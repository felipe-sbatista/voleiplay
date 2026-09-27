import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface LoadScenarioConfig {
  name: string;
  url: string;
  method: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: any;
  concurrency: number;
  totalRequests: number;
  expectedMaxP95Ms: number;
}

export interface LatencyMetrics {
  min: number;
  max: number;
  avg: number;
  p50: number;
  p90: number;
  p95: number;
  p99: number;
}

export interface ScenarioResult {
  name: string;
  totalRequests: number;
  successful: number;
  failed: number;
  errorRatePercent: number;
  durationSeconds: number;
  rps: number;
  latencies: LatencyMetrics;
  passedSla: boolean;
}

/**
 * Dispara uma única requisição HTTP medindo com precisão a latência
 */
function sendRequest(
  urlStr: string,
  method: string,
  headers: Record<string, string> = {},
  body?: any
): Promise<{ statusCode: number; durationMs: number }> {
  return new Promise((resolve) => {
    const url = new URL(urlStr);
    const postData = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined;

    const reqHeaders: Record<string, string> = {
      ...headers,
      'Connection': 'keep-alive'
    };

    if (postData) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(postData).toString();
    }

    const startTime = performance.now();

    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method,
        headers: reqHeaders,
        timeout: 5000
      },
      (res) => {
        // Consome todo o stream para liberar o socket
        res.on('data', () => {});
        res.on('end', () => {
          const durationMs = performance.now() - startTime;
          resolve({ statusCode: res.statusCode || 0, durationMs });
        });
      }
    );

    req.on('error', () => {
      const durationMs = performance.now() - startTime;
      resolve({ statusCode: 0, durationMs });
    });

    req.on('timeout', () => {
      req.destroy();
      const durationMs = performance.now() - startTime;
      resolve({ statusCode: 408, durationMs });
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

/**
 * Calcula percentis matemáticos para uma amostra ordenada de latências
 */
function calculatePercentiles(sortedLatencies: number[]): LatencyMetrics {
  if (sortedLatencies.length === 0) {
    return { min: 0, max: 0, avg: 0, p50: 0, p90: 0, p95: 0, p99: 0 };
  }

  const getPercentile = (p: number) => {
    const idx = Math.ceil((p / 100) * sortedLatencies.length) - 1;
    return sortedLatencies[Math.max(0, Math.min(idx, sortedLatencies.length - 1))];
  };

  const sum = sortedLatencies.reduce((acc, val) => acc + val, 0);
  const avg = sum / sortedLatencies.length;

  return {
    min: Number(sortedLatencies[0].toFixed(2)),
    max: Number(sortedLatencies[sortedLatencies.length - 1].toFixed(2)),
    avg: Number(avg.toFixed(2)),
    p50: Number(getPercentile(50).toFixed(2)),
    p90: Number(getPercentile(90).toFixed(2)),
    p95: Number(getPercentile(95).toFixed(2)),
    p99: Number(getPercentile(99).toFixed(2))
  };
}

/**
 * Executa um cenário de carga com pool de workers concorrentes
 */
async function runScenario(cfg: LoadScenarioConfig): Promise<ScenarioResult> {
  console.log(`\n\x1b[1m\x1b[36m⚡ Executando Cenário de Carga: "${cfg.name}"\x1b[0m`);
  console.log(`   Alvo: \x1b[33m${cfg.method} ${cfg.url}\x1b[0m | Concorrência: \x1b[35m${cfg.concurrency}\x1b[0m | Total: \x1b[35m${cfg.totalRequests} reqs\x1b[0m`);

  const latencies: number[] = [];
  let successful = 0;
  let failed = 0;
  let sentCount = 0;

  const startTime = performance.now();

  // Pool de concorrência com fila assíncrona
  async function worker() {
    while (true) {
      const current = sentCount++;
      if (current >= cfg.totalRequests) break;

      const res = await sendRequest(cfg.url, cfg.method, cfg.headers, cfg.body);
      latencies.push(res.durationMs);

      if (res.statusCode >= 200 && res.statusCode < 400) {
        successful++;
      } else {
        failed++;
      }
    }
  }

  const workers = Array.from({ length: cfg.concurrency }, () => worker());
  await Promise.all(workers);

  const durationMs = performance.now() - startTime;
  const durationSeconds = durationMs / 1000;
  const rps = Number((cfg.totalRequests / durationSeconds).toFixed(2));

  latencies.sort((a, b) => a - b);
  const metrics = calculatePercentiles(latencies);
  const errorRatePercent = Number(((failed / cfg.totalRequests) * 100).toFixed(2));
  const passedSla = errorRatePercent === 0 && metrics.p95 <= cfg.expectedMaxP95Ms;

  console.log(`   ✔ Concluído em: \x1b[32m${durationSeconds.toFixed(2)}s\x1b[0m | Throughput: \x1b[1m\x1b[32m${rps} req/s\x1b[0m`);
  console.log(`   Métricas de Latência:`);
  console.log(`     - Méd: \x1b[36m${metrics.avg}ms\x1b[0m | Mín: \x1b[36m${metrics.min}ms\x1b[0m | Máx: \x1b[36m${metrics.max}ms\x1b[0m`);
  console.log(`     - p50 (Mediana): \x1b[36m${metrics.p50}ms\x1b[0m | p90: \x1b[36m${metrics.p90}ms\x1b[0m | p95: \x1b[36m${metrics.p95}ms\x1b[0m | p99: \x1b[36m${metrics.p99}ms\x1b[0m`);
  console.log(`   Sucessos: \x1b[32m${successful}\x1b[0m | Falhas: ${failed > 0 ? `\x1b[31m${failed}\x1b[0m` : '\x1b[32m0\x1b[0m'} (Erro: ${errorRatePercent}%)`);
  console.log(`   SLA (${cfg.expectedMaxP95Ms}ms máx p95): ${passedSla ? '\x1b[32m[APROVADO]\x1b[0m' : '\x1b[31m[REPROVADO]\x1b[0m'}`);

  return {
    name: cfg.name,
    totalRequests: cfg.totalRequests,
    successful,
    failed,
    errorRatePercent,
    durationSeconds: Number(durationSeconds.toFixed(2)),
    rps,
    latencies: metrics,
    passedSla
  };
}

/**
 * Ponto de entrada da Bateria de Testes de Carga
 */
export async function runLoadTestSuite() {
  console.log('\n\x1b[1m\x1b[35m' + '═'.repeat(70) + '\x1b[0m');
  console.log('\x1b[1m\x1b[35m🏐 SUÍTE DE TESTES DE CARGA E PERFORMANCE (Voleiplay Microservices)\x1b[0m');
  console.log('\x1b[1m\x1b[35m' + '═'.repeat(70) + '\x1b[0m');

  const scenarios: LoadScenarioConfig[] = [
    {
      name: '1. Autenticação Concorrente (Auth Service /api/auth/login)',
      url: 'http://localhost:3007/api/auth/login',
      method: 'POST',
      body: {
        email: 'ana.patricia@voleiplay.com.br',
        password: 'atleta123'
      },
      concurrency: 20,
      totalRequests: 200,
      expectedMaxP95Ms: 350
    },
    {
      name: '2. Envio de E-mails em Alta Frequência (Email Service /api/emails/send)',
      url: 'http://localhost:3004/api/emails/send',
      method: 'POST',
      body: {
        to: 'carga.atleta@voleiplay.com',
        recipientName: 'Atleta Carga',
        subject: '🏐 Notificação Automática de Carga',
        body: 'Disparo gerado pelo teste de carga automatizado.',
        type: 'SYSTEM_ALERT'
      },
      concurrency: 25,
      totalRequests: 250,
      expectedMaxP95Ms: 350
    },
    {
      name: '3. Gateway Proxy & Circuit Breaker (Gateway /services/email/circuit-breaker)',
      url: 'http://localhost:3000/services/email/circuit-breaker',
      method: 'GET',
      concurrency: 30,
      totalRequests: 300,
      expectedMaxP95Ms: 350
    }
  ];

  const results: ScenarioResult[] = [];

  for (const sc of scenarios) {
    const res = await runScenario(sc);
    results.push(res);
  }

  // Tabela Comparativa Final
  console.log('\n\x1b[1m\x1b[35m' + '═'.repeat(70) + '\x1b[0m');
  console.log('\x1b[1m📊 TABELA COMPARATIVA DE PERFORMANCE E THROUGHPUT:\x1b[0m');
  console.log('\x1b[1m\x1b[35m' + '─'.repeat(70) + '\x1b[0m');
  console.log(
    'Cenário'.padEnd(32) +
    'Reqs'.padEnd(8) +
    'RPS'.padEnd(10) +
    'p50'.padEnd(8) +
    'p95'.padEnd(8) +
    'p99'.padEnd(8) +
    'SLA'
  );
  console.log('─'.repeat(70));

  for (const r of results) {
    const shortName = r.name.slice(0, 30);
    const slaStr = r.passedSla ? '\x1b[32mOK\x1b[0m' : '\x1b[31mFALHA\x1b[0m';
    console.log(
      shortName.padEnd(32) +
      `${r.totalRequests}`.padEnd(8) +
      `\x1b[32m${r.rps}\x1b[0m`.padEnd(19) +
      `${r.latencies.p50}ms`.padEnd(8) +
      `${r.latencies.p95}ms`.padEnd(8) +
      `${r.latencies.p99}ms`.padEnd(8) +
      slaStr
    );
  }
  console.log('\x1b[1m\x1b[35m' + '═'.repeat(70) + '\x1b[0m\n');

  // Salva relatório em JSON
  const reportPath = path.join(__dirname, 'load-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2));
  console.log(`💾 Relatório detalhado salvo em: \x1b[36m${reportPath}\x1b[0m\n`);

  const hasFailures = results.some(r => !r.passedSla);
  if (hasFailures) {
    process.exit(1);
  }
}

// Execução direta se invocado via CLI
runLoadTestSuite().catch(err => {
  console.error('\x1b[31m[Load Test] Erro fatal durante a execução dos testes de carga:\x1b[0m', err);
  process.exit(1);
});
