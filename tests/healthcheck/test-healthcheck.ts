import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface HealthTarget {
  name: string;
  category: 'CORE_MICROSERVICE' | 'GATEWAY' | 'FRONTEND' | 'OBSERVABILITY';
  url: string;
  expectedStatus: number | number[];
  validateBody?: (body: any) => boolean | string;
  isOptional?: boolean;
}

export interface HealthProbeResult {
  name: string;
  category: string;
  url: string;
  isUp: boolean;
  statusCode: number;
  latencyMs: number;
  details: string;
  timestamp: string;
}

/**
 * Dispara uma requisição HTTP medindo latência e capturando resposta
 */
function probeHealth(target: HealthTarget): Promise<HealthProbeResult> {
  return new Promise((resolve) => {
    const url = new URL(target.url);
    const startTime = performance.now();
    const timestamp = new Date().toISOString();

    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: 'GET',
        headers: { 'Accept': 'application/json, text/html, */*' },
        timeout: 4000
      },
      (res) => {
        let rawData = '';
        res.on('data', chunk => rawData += chunk);
        res.on('end', () => {
          const latencyMs = Math.round(performance.now() - startTime);
          const statusCode = res.statusCode || 0;
          const allowedStatuses = Array.isArray(target.expectedStatus)
            ? target.expectedStatus
            : [target.expectedStatus];

          let isUp = allowedStatuses.includes(statusCode);
          let details = `HTTP ${statusCode}`;

          if (isUp && target.validateBody && rawData) {
            try {
              const parsed = JSON.parse(rawData);
              const validationResult = target.validateBody(parsed);
              if (typeof validationResult === 'string') {
                isUp = false;
                details = validationResult;
              } else if (!validationResult) {
                isUp = false;
                details = 'Falha na validação do payload de resposta';
              } else {
                details = `OK (${parsed.status || 'UP'})`;
              }
            } catch {
              // Se não for JSON, considera válido pelo status code
              details = `HTTP ${statusCode} OK`;
            }
          }

          resolve({
            name: target.name,
            category: target.category,
            url: target.url,
            isUp,
            statusCode,
            latencyMs,
            details,
            timestamp
          });
        });
      }
    );

    req.on('error', (err: any) => {
      const latencyMs = Math.round(performance.now() - startTime);
      resolve({
        name: target.name,
        category: target.category,
        url: target.url,
        isUp: false,
        statusCode: 0,
        latencyMs,
        details: err.code === 'ECONNREFUSED' ? 'Conexão recusada (Serviço parado)' : err.message,
        timestamp
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const latencyMs = Math.round(performance.now() - startTime);
      resolve({
        name: target.name,
        category: target.category,
        url: target.url,
        isUp: false,
        statusCode: 408,
        latencyMs,
        details: 'Timeout de resposta (> 4000ms)',
        timestamp
      });
    });

    req.end();
  });
}

/**
 * Executa a bateria de sondagens de Healthcheck de todos os serviços
 */
export async function runHealthCheckSuite() {
  console.log('\n\x1b[1m\x1b[35m' + '═'.repeat(75) + '\x1b[0m');
  console.log('\x1b[1m\x1b[35m🏐 VOLEIPLAY BEACH PRO TOUR - SCRIPT DE HEALTHCHECK DOS SERVIÇOS\x1b[0m');
  console.log('\x1b[1m\x1b[35m' + '═'.repeat(75) + '\x1b[0m\n');

  const targets: HealthTarget[] = [
    // 1. Microsserviços Centrais
    {
      name: 'Auth Service API',
      category: 'CORE_MICROSERVICE',
      url: 'http://localhost:3007/api/auth/health',
      expectedStatus: 200,
      validateBody: (body) => body.status === 'UP'
    },
    {
      name: 'Email Service API',
      category: 'CORE_MICROSERVICE',
      url: 'http://localhost:3004/api/emails/health',
      expectedStatus: 200,
      validateBody: (body) => body.status === 'UP'
    },
    // 2. Gateway e Proxies
    {
      name: 'Backend Gateway',
      category: 'GATEWAY',
      url: 'http://localhost:3000/health',
      expectedStatus: 200,
      validateBody: (body) => body.status === 'UP'
    },
    {
      name: 'Gateway Proxy -> Auth Stats',
      category: 'GATEWAY',
      url: 'http://localhost:3000/services/auth/stats',
      expectedStatus: 200,
      validateBody: (body) => body.success === true
    },
    {
      name: 'Gateway -> Circuit Breaker',
      category: 'GATEWAY',
      url: 'http://localhost:3000/services/email/circuit-breaker',
      expectedStatus: 200,
      validateBody: (body) => body.circuitBreaker?.state === 'CLOSED' || body.circuitBreaker?.state === 'HALF_OPEN'
    },
    // 3. Frontend
    {
      name: 'Angular Frontend DevServer',
      category: 'FRONTEND',
      url: 'http://localhost:4200/',
      expectedStatus: [200, 304]
    },
    // 4. Observabilidade
    {
      name: 'Elastic APM Server',
      category: 'OBSERVABILITY',
      url: 'http://localhost:8200/',
      expectedStatus: [200, 401],
      isOptional: true
    },
    {
      name: 'Elasticsearch Engine',
      category: 'OBSERVABILITY',
      url: 'http://localhost:9200/',
      expectedStatus: [200, 401],
      isOptional: true
    },
    {
      name: 'Kibana Dashboard',
      category: 'OBSERVABILITY',
      url: 'http://localhost:5601/',
      expectedStatus: [200, 302],
      isOptional: true
    }
  ];

  const results: HealthProbeResult[] = [];

  for (const target of targets) {
    const res = await probeHealth(target);
    results.push(res);
  }

  // Tabela de Resultados
  console.log(
    'Serviço / Alvo'.padEnd(30) +
    'URL'.padEnd(35) +
    'Latência'.padEnd(12) +
    'Status'
  );
  console.log('─'.repeat(85));

  let allCoreHealthy = true;

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const target = targets[i];

    const statusBadge = r.isUp
      ? `\x1b[32m✔ ONLINE (${r.details})\x1b[0m`
      : target.isOptional
        ? `\x1b[33m⚠ OPCIONAL (${r.details})\x1b[0m`
        : `\x1b[31m✖ OFFLINE (${r.details})\x1b[0m`;

    if (!r.isUp && !target.isOptional) {
      allCoreHealthy = false;
    }

    const shortUrl = r.url.replace('http://localhost', ':');
    console.log(
      r.name.padEnd(30) +
      shortUrl.padEnd(35) +
      `${r.latencyMs}ms`.padEnd(12) +
      statusBadge
    );
  }

  console.log('─'.repeat(85));

  // Resumo
  const totalOnline = results.filter(r => r.isUp).length;
  console.log(`\n\x1b[1m📊 Resumo Geral:\x1b[0m \x1b[32m${totalOnline}/${results.length} serviços respondendo normalmente.\x1b[0m`);

  // Salva relatório estruturado em JSON
  const reportPath = path.join(__dirname, 'healthcheck-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    allCoreHealthy,
    totalTargets: results.length,
    onlineCount: totalOnline,
    results
  }, null, 2));

  console.log(`💾 Relatório de Healthcheck salvo em: \x1b[36m${reportPath}\x1b[0m\n`);

  if (!allCoreHealthy) {
    console.error('\x1b[31m✖ Alerta: Um ou mais serviços essenciais estão OFFLINE!\x1b[0m\n');
    process.exit(1);
  } else {
    console.log('\x1b[32m✅ Todos os serviços essenciais estão saudáveis e operacionais!\x1b[0m\n');
  }
}

runHealthCheckSuite().catch(err => {
  console.error('\x1b[31mErro fatal ao executar healthcheck:\x1b[0m', err);
  process.exit(1);
});
