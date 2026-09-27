// 1. O Elastic APM DEVE ser o primeiríssimo import para auto-instrumentação
import './shared/observability/apm.js';
import express from 'express';
import cors from 'cors';
import { createHexagonalPlayerRouter } from './1-hexagonal/adapters/inbound/http/player.router.js';
import { createVerticalSliceRouter } from './2-vertical-slice/router.js';
import { createCqrsPlayerRouter } from './3-cqrs-mediator/controllers/player.router.js';
import { createEmailProxyRouter } from './4-saga/clients/email-proxy.router.js';
import { createAuthProxyRouter } from './4-saga/clients/auth-proxy.router.js';
import { createPrizeRouter } from './4-saga/prize-service/prize.router.js';
import { createSagaRouter } from './4-saga/saga-orchestrator/saga.router.js';
import { createObservabilityRouter } from './shared/observability/observability.router.js';
import { createDatabaseRouter } from './shared/database/database.router.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Monta os estilos arquiteturais e microsserviços no gateway unificado
app.use('/hexagonal/players', createHexagonalPlayerRouter());
app.use('/vertical', createVerticalSliceRouter()); // expõe /vertical/players
app.use('/cqrs', createCqrsPlayerRouter());         // expõe /cqrs/players

// Novos Microsserviços e Orquestrador Saga
app.use('/services/email', createEmailProxyRouter()); // Encaminha via REST para a nova Email Service API (:3004)
app.use('/services/auth', createAuthProxyRouter());   // Encaminha via REST para a nova Auth Service API (:3007)
app.use('/services/prizes', createPrizeRouter());
app.use('/saga', createSagaRouter());

// Laboratório Didático de Observabilidade e Elastic APM
app.use('/observability', createObservabilityRouter());

// Laboratório Didático de Persistência Poliglota & Caching (PostgreSQL, MongoDB, Redis)
app.use('/database', createDatabaseRouter());

// Endpoint de Healthcheck oficial do Gateway
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'voleiplay-backend',
    port: PORT,
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    dependencies: {
      authService: process.env.AUTH_SERVICE_URL || 'http://localhost:3007',
      emailService: process.env.EMAIL_SERVICE_URL || 'http://localhost:3004',
      apmServer: process.env.ELASTIC_APM_SERVER_URL || 'http://localhost:8200',
      postgres: `${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || 5432}`,
      mongodb: `${process.env.MONGO_HOST || 'localhost'}:${process.env.MONGO_PORT || 27017}`,
      redis: `${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
    }
  });
});

// Dashboard visual didático para demonstração em sala de aula
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VOLEIPLAY Backend - Laboratório Arquitetural & Saga Pattern</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: rgba(26, 32, 53, 0.75);
      --border: rgba(255, 255, 255, 0.08);
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --hex-color: #3b82f6;
      --slice-color: #f97316;
      --cqrs-color: #10b981;
      --saga-color: #a855f7;
      --danger-color: #ef4444;
      --warning-color: #f59e0b;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Outfit', sans-serif;
      background: radial-gradient(circle at 50% 0%, #1e1b4b 0%, var(--bg) 60%);
      color: var(--text);
      padding: 2.5rem 1.5rem;
      min-height: 100vh;
    }
    .container { max-width: 1250px; margin: 0 auto; }
    header { text-align: center; margin-bottom: 2.5rem; }
    .badge {
      display: inline-block;
      padding: 0.35rem 0.9rem;
      background: rgba(168, 85, 247, 0.15);
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.3);
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    h1 { font-size: 2.8rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 0.6rem; }
    p.subtitle { color: var(--text-muted); font-size: 1.15rem; max-width: 800px; margin: 0 auto; }
    
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2.5rem;
    }
    .card {
      background: var(--card-bg);
      backdrop-filter: blur(12px);
      border: 1px solid var(--border);
      border-radius: 1.25rem;
      padding: 1.75rem;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
      box-shadow: 0 20px 40px -15px rgba(0,0,0,0.5);
      transition: transform 0.2s, border-color 0.2s;
    }
    .card:hover { transform: translateY(-4px); }
    .card.hex { border-top: 4px solid var(--hex-color); }
    .card.slice { border-top: 4px solid var(--slice-color); }
    .card.cqrs { border-top: 4px solid var(--cqrs-color); }
    .card.saga { border-top: 4px solid var(--saga-color); }
    
    .card-title { font-size: 1.35rem; font-weight: 700; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
    .card-desc { color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; margin-bottom: 1.25rem; flex-grow: 1; }
    
    .tech-pill {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      background: rgba(255,255,255,0.06);
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      margin-bottom: 0.35rem;
      display: inline-block;
    }

    .btn-group { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem; }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.65rem 0.9rem;
      border-radius: 0.6rem;
      font-weight: 600;
      text-decoration: none;
      font-size: 0.85rem;
      transition: all 0.2s;
      cursor: pointer;
      border: none;
    }
    .btn:hover { opacity: 0.9; transform: translateY(-1px); }
    .btn-hex { background: var(--hex-color); color: #fff; }
    .btn-slice { background: var(--slice-color); color: #fff; }
    .btn-cqrs { background: var(--cqrs-color); color: #0b0f19; }
    .btn-saga { background: var(--saga-color); color: #fff; }
    .btn-success { background: #10b981; color: #0b0f19; }
    .btn-danger { background: #ef4444; color: #fff; }
    .btn-warning { background: #f59e0b; color: #0b0f19; }
    .btn-outline {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text);
    }
    .btn-outline:hover { background: rgba(255,255,255,0.05); }

    /* Seção Especial Saga Interactive Simulator */
    .saga-section {
      background: linear-gradient(135deg, rgba(30, 27, 75, 0.6), rgba(15, 23, 42, 0.8));
      border: 1px solid rgba(168, 85, 247, 0.3);
      border-radius: 1.25rem;
      padding: 2rem;
      margin-bottom: 2.5rem;
      box-shadow: 0 25px 50px -12px rgba(168, 85, 247, 0.15);
    }
    .saga-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem; }
    .saga-badge { background: #a855f7; color: white; padding: 0.3rem 0.8rem; border-radius: 9999px; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; }
    
    .saga-controls {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-bottom: 1.5rem;
    }

    .timeline {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .timeline-step {
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      padding: 1.25rem;
      transition: all 0.3s;
      position: relative;
    }
    .timeline-step.active { border-color: var(--saga-color); box-shadow: 0 0 15px rgba(168, 85, 247, 0.3); }
    .timeline-step.success { border-color: #10b981; }
    .timeline-step.failed { border-color: #ef4444; }
    .timeline-step.compensated { border-color: #f59e0b; }

    .step-num { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.25rem; }
    .step-title { font-size: 1rem; font-weight: 700; margin-bottom: 0.35rem; }
    .step-desc { font-size: 0.8rem; color: var(--text-muted); }
    .step-status {
      display: inline-block;
      margin-top: 0.6rem;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .status-idle { background: rgba(255,255,255,0.1); color: #9ca3af; }
    .status-running { background: rgba(168,85,247,0.2); color: #c084fc; }
    .status-success { background: rgba(16,185,129,0.2); color: #34d399; }
    .status-failed { background: rgba(239,68,68,0.2); color: #f87171; }
    .status-compensated { background: rgba(245,158,11,0.2); color: #fbbf24; }

    .comparison {
      background: var(--card-bg);
      backdrop-filter: blur(12px);
      border: 1px solid var(--border);
      border-radius: 1.25rem;
      padding: 2rem;
      margin-bottom: 2.5rem;
    }
    .comparison h2 { font-size: 1.5rem; margin-bottom: 1.2rem; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th, td { padding: 0.9rem; border-bottom: 1px solid var(--border); }
    th { color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; }
    td { font-size: 0.9rem; }

    .console-box {
      background: #05070d;
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      padding: 1.25rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.82rem;
      overflow-x: auto;
      margin-top: 1rem;
      max-height: 320px;
      color: #34d399;
      display: none;
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="badge">Laboratório Didático de Arquitetura de Software & Microsserviços</div>
      <h1>VOLEIPLAY Backend 🏐</h1>
      <p class="subtitle">
        Estilos arquiteturais (Hexagonal, Vertical Slice, CQRS) e Transações Distribuídas com o <strong>Padrão Saga</strong>.
      </p>
    </header>

    <!-- Seção de Demonstração Interativa da Saga -->
    <div class="saga-section">
      <div class="saga-header">
        <div>
          <span class="saga-badge">Saga Pattern Orchestrator</span>
          <h2 style="font-size: 1.6rem; margin-top: 0.35rem;">Simulador Didático de Transações Distribuídas 🔄</h2>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.25rem;">
            Orquestração entre o <strong>Prize Service</strong> (Processamento em Batch) e o <strong>Email Service</strong> (Notificações).
          </p>
        </div>
        <div>
          <button class="btn btn-outline" onclick="fetchSample('/saga/executions')">Histórico de Sagas</button>
          <button class="btn btn-outline" onclick="fetchSample('/services/email')">Ver E-mails Enviados</button>
          <button class="btn btn-outline" onclick="fetchSample('/services/prizes/batches')">Ver Lotes de Prêmios</button>
        </div>
      </div>

      <!-- Timeline dos Passos da Saga -->
      <div class="timeline" id="saga-timeline">
        <div class="timeline-step" id="step-t1">
          <div class="step-num">Passo 1 (T1) • Prize Service</div>
          <div class="step-title">Criar Lote (Pending)</div>
          <div class="step-desc">Valida orçamento e cria lote com status PENDING</div>
          <span class="step-status status-idle" id="badge-t1">Aguardando</span>
        </div>

        <div class="timeline-step" id="step-t2">
          <div class="step-num">Passo 2 (T2) • Prize Service</div>
          <div class="step-title">Liquidação em Batch</div>
          <div class="step-desc">Processa pagamentos PIX em lote e debita orçamento</div>
          <span class="step-status status-idle" id="badge-t2">Aguardando</span>
        </div>

        <div class="timeline-step" id="step-t3">
          <div class="step-num">Passo 3 (T3) • Email Service</div>
          <div class="step-title">Disparo de E-mails</div>
          <div class="step-desc">Envia recibos mockados aos atletas premiados</div>
          <span class="step-status status-idle" id="badge-t3">Aguardando</span>
        </div>

        <div class="timeline-step" id="step-comp">
          <div class="step-num">Compensação (C2 / C1)</div>
          <div class="step-title">Ação Compensatória</div>
          <div class="step-desc">Estorno contábil do lote, restaura saldo e notifica atletas</div>
          <span class="step-status status-idle" id="badge-comp">Não necessária</span>
        </div>
      </div>

      <!-- Botões de Ação para a Aula -->
      <div class="saga-controls">
        <button class="btn btn-success" onclick="runSagaSimulation('none')">
          🟢 1. Executar Cenário Feliz (Happy Path)
        </button>
        <button class="btn btn-danger" onclick="runSagaSimulation('process_batch')">
          🔴 2. Simular Falha no Batch (Compensação T1)
        </button>
        <button class="btn btn-warning" onclick="runSagaSimulation('send_emails')">
          🟡 3. Simular Falha no E-mail (Compensação Completa C2 + C3)
        </button>
      </div>

      <pre id="saga-console" class="console-box"></pre>
    </div>

    <!-- Seção Especial: Laboratório de Observabilidade & Elastic APM -->
    <div class="saga-section" style="border-color: rgba(56, 189, 248, 0.4); background: linear-gradient(135deg, rgba(12, 74, 110, 0.35), rgba(15, 23, 42, 0.85));">
      <div class="saga-header">
        <div>
          <span class="saga-badge" style="background: #0284c7;">📡 Observabilidade & Elastic APM</span>
          <h2 style="font-size: 1.6rem; font-weight: 700; margin-top: 0.3rem;">🔬 Laboratório de Telemetria, Performance e Tracing</h2>
          <p style="color: var(--text-muted); font-size: 0.95rem; margin-top: 0.2rem;">
            Stack ativa: <strong>Elasticsearch</strong> (9200), <strong>APM Server</strong> (8200) e <strong>Kibana APM</strong> (5601). Envie transações e inspecione a telemetria ao vivo.
          </p>
        </div>
        <div>
          <a class="btn" style="background: #0284c7; color: #fff; font-weight: 700; gap: 0.5rem;" href="http://localhost:5601/app/apm" target="_blank">
            📊 Abrir Kibana APM Dashboard ↗
          </a>
        </div>
      </div>

      <!-- Controles de Simulação para Aula -->
      <div class="saga-controls" style="margin-bottom: 1rem;">
        <button class="btn btn-outline" style="border-color: #38bdf8; color: #38bdf8;" onclick="runObservabilityLab('/observability/status')">
          ℹ️ 1. Verificar Status do APM Agent
        </button>
        <button class="btn btn-warning" onclick="runObservabilityLab('/observability/slow-operation')">
          ⏱️ 2. Simular Gargalo (Waterfall com 4 Spans)
        </button>
        <button class="btn btn-danger" onclick="runObservabilityLab('/observability/error-simulation')">
          💥 3. Capturar Exceção e Stack Trace
        </button>
        <button class="btn btn-success" onclick="runObservabilityLab('/observability/metrics-load')">
          📈 4. Gerar Carga de Event Loop e Memória
        </button>
      </div>

      <pre id="obs-console" class="console-box" style="border-color: rgba(56, 189, 248, 0.3);"></pre>
    </div>

    <!-- Seção Especial: Resiliência & Circuit Breaker -->
    <div class="saga-section" style="border-color: rgba(245, 158, 11, 0.4); background: linear-gradient(135deg, rgba(120, 53, 15, 0.25), rgba(15, 23, 42, 0.85));">
      <div class="saga-header">
        <div>
          <span class="saga-badge" style="background: #d97706;">⚡ Resiliência em Microsserviços</span>
          <h2 style="font-size: 1.6rem; font-weight: 700; margin-top: 0.3rem;">🛡️ Circuit Breaker & Retry com Exponential Backoff</h2>
          <p style="color: var(--text-muted); font-size: 0.95rem; margin-top: 0.2rem;">
            Proteção das chamadas REST para o <strong>Email Service (:3004)</strong> com até 3 tentativas, backoff exponencial, limiar de 3 falhas e <em>Fast Fail</em>.
          </p>
        </div>
        <div id="cb-badge-container">
          <span class="badge" id="cb-state-badge" style="background: rgba(16, 185, 129, 0.2); color: #34d399; border-color: #10b981; font-size: 0.95rem; padding: 0.45rem 1.1rem; text-transform: none;">
            ● Circuito: CLOSED (Saudável)
          </span>
        </div>
      </div>

      <div class="saga-controls" style="margin-bottom: 1rem;">
        <button class="btn btn-outline" style="border-color: #f59e0b; color: #fbbf24;" onclick="fetchCircuitBreakerStatus()">
          🔍 1. Consultar Status do Disjuntor
        </button>
        <button class="btn btn-warning" onclick="resetCircuitBreaker()">
          🔄 2. Resetar Disjuntor (Forçar CLOSED)
        </button>
        <button class="btn btn-danger" onclick="simulateEmailCircuitTrip()">
          💥 3. Disparar Falha na Saga (Testar Retry & Abrir Disjuntor)
        </button>
      </div>

      <pre id="resilience-console" class="console-box" style="border-color: rgba(245, 158, 11, 0.3); color: #fbbf24;"></pre>
    </div>

    <!-- Seção Especial: Persistência Poliglota & Caching Lab -->
    <div class="saga-section" style="border-color: rgba(16, 185, 129, 0.4); background: linear-gradient(135deg, rgba(6, 78, 59, 0.35), rgba(15, 23, 42, 0.85));">
      <div class="saga-header">
        <div>
          <span class="saga-badge" style="background: #059669;">💾 Persistência Poliglota & Caching</span>
          <h2 style="font-size: 1.6rem; font-weight: 700; margin-top: 0.3rem;">🐘 PostgreSQL • 🍃 MongoDB • ⚡ Redis</h2>
          <p style="color: var(--text-muted); font-size: 0.95rem; margin-top: 0.2rem;">
            Laboratório didático de banco relacional leve (ACID), NoSQL documental flexível (BASE) e cache em memória (&lt;1ms).
          </p>
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;" id="db-badges-container">
          <span class="badge" id="badge-pg" style="background: rgba(59, 130, 246, 0.15); color: #60a5fa; border-color: #3b82f6;">🐘 Postgres: ...</span>
          <span class="badge" id="badge-mongo" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border-color: #10b981;">🍃 Mongo: ...</span>
          <span class="badge" id="badge-redis" style="background: rgba(239, 68, 68, 0.15); color: #f87171; border-color: #ef4444;">⚡ Redis: ...</span>
        </div>
      </div>

      <!-- Controles de Demonstração para Aula -->
      <div class="saga-controls" style="margin-bottom: 1rem;">
        <button class="btn btn-outline" style="border-color: #10b981; color: #34d399;" onclick="runDbLab('/database/status')">
          🔍 1. Status & Conectividade dos Bancos
        </button>
        <button class="btn btn-warning" onclick="runDbBenchmark()">
          ⏱️ 2. Executar Benchmark Comparativo (RAM vs Disco)
        </button>
        <button class="btn btn-success" onclick="testCacheAside('p-1')">
          ⚡ 3. Simular Leitura com Cache-Aside (HIT vs MISS)
        </button>
        <button class="btn btn-outline" style="border-color: #ef4444; color: #f87171;" onclick="invalidateCache('p-1')">
          🗑️ 4. Invalidar Cache do Jogador
        </button>
        <button class="btn btn-outline" style="border-color: #10b981; color: #10b981;" onclick="saveNoSqlScout()">
          🍃 5. Salvar Scout NoSQL Aninhado (MongoDB)
        </button>
        <button class="btn btn-outline" style="border-color: #3b82f6; color: #60a5fa;" onclick="testAcidTx(false)">
          🐘 6. Transação ACID (COMMIT)
        </button>
        <button class="btn btn-danger" onclick="testAcidTx(true)">
          💥 7. Falha na Transação (ROLLBACK)
        </button>
      </div>

      <pre id="db-console" class="console-box" style="border-color: rgba(16, 185, 129, 0.3); color: #34d399;"></pre>
    </div>

    <!-- Grid dos 4 Cards Arquiteturais -->
    <div class="grid">
      <!-- Hexagonal -->
      <div class="card hex">
        <h2 class="card-title">🔷 Hexagonal (Ports & Adapters)</h2>
        <p class="card-desc">
          Domínio isolado no centro, agnóstico a frameworks. Comunica-se por <strong>Portas Inbound</strong> (Use Cases) e <strong>Portas Outbound</strong> (Repositories).
        </p>
        <div>
          <span class="tech-pill">domain/entity</span>
          <span class="tech-pill">ports/inbound</span>
          <span class="tech-pill">ports/outbound</span>
          <span class="tech-pill">adapters/http</span>
        </div>
        <div class="btn-group">
          <a class="btn btn-hex" href="/hexagonal/players" target="_blank">GET /hexagonal/players</a>
          <button class="btn btn-outline" onclick="fetchSample('/hexagonal/players')">Testar Requisição</button>
        </div>
      </div>

      <!-- Vertical Slice -->
      <div class="card slice">
        <h2 class="card-title">🔶 Vertical Slice</h2>
        <p class="card-desc">
          Fatias autônomas por caso de uso. Cada pasta agrupa seu próprio DTO, validação, regra de negócio e endpoint HTTP, sem acoplamento transversal.
        </p>
        <div>
          <span class="tech-pill">features/create-player</span>
          <span class="tech-pill">features/list-players</span>
          <span class="tech-pill">features/get-player</span>
          <span class="tech-pill">self-contained</span>
        </div>
        <div class="btn-group">
          <a class="btn btn-slice" href="/vertical/players" target="_blank">GET /vertical/players</a>
          <button class="btn btn-outline" onclick="fetchSample('/vertical/players')">Testar Requisição</button>
        </div>
      </div>

      <!-- CQRS + Mediator -->
      <div class="card cqrs">
        <h2 class="card-title">🟢 CQRS com Mediator</h2>
        <p class="card-desc">
          Separação estrita entre Comandos de Escrita (Commands) e Consultas (Queries). Despacho via barramento Mediator com pipeline behaviors automáticos.
        </p>
        <div>
          <span class="tech-pill">commands/create</span>
          <span class="tech-pill">queries/list</span>
          <span class="tech-pill">core/mediator</span>
          <span class="tech-pill">pipeline/behaviors</span>
        </div>
        <div class="btn-group">
          <a class="btn btn-cqrs" href="/cqrs/players" target="_blank">GET /cqrs/players</a>
          <button class="btn btn-outline" onclick="fetchSample('/cqrs/players')">Testar Requisição</button>
        </div>
      </div>

      <!-- Saga Pattern (Transações Distribuídas) -->
      <div class="card saga">
        <h2 class="card-title">🟣 Saga (Transações Distribuídas)</h2>
        <p class="card-desc">
          Garante consistência eventual entre microsserviços autônomos. Orquestra transações locais e dispara <strong>ações compensatórias</strong> reversas em falhas.
        </p>
        <div>
          <span class="tech-pill">prize-service (batch)</span>
          <span class="tech-pill">email-service (REST :3004)</span>
          <span class="tech-pill">saga-orchestrator</span>
          <span class="tech-pill">compensating-tx</span>
        </div>
        <div class="btn-group">
          <a class="btn btn-saga" href="/services/prizes/tournaments" target="_blank">GET /services/prizes/tournaments</a>
          <button class="btn btn-outline" onclick="fetchSample('/services/email/stats')">Ver Stats de E-mails (Proxy REST)</button>
          <a class="btn btn-outline" href="http://localhost:3004" target="_blank" style="border-color: #38bdf8; color: #38bdf8;">Abrir Nova Email API (Porta 3004) ↗</a>
        </div>
      </div>
    </div>

    <!-- Tabela Comparativa Geral -->
    <div class="comparison">
      <h2>📊 Tabela Comparativa Didática dos Padrões</h2>
      <table>
        <thead>
          <tr>
            <th>Critério</th>
            <th>Hexagonal (Ports & Adapters)</th>
            <th>Vertical Slice</th>
            <th>CQRS + Mediator</th>
            <th>Saga Pattern (Microsserviços)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Organização</strong></td>
            <td>Camadas concêntricas (Domínio puro)</td>
            <td>Por caso de uso (Fatias verticais)</td>
            <td>Por intenção de I/O (Commands / Queries)</td>
            <td>Sequência de transações locais distribuídas</td>
          </tr>
          <tr>
            <td><strong>Gerenciamento de Estado</strong></td>
            <td>Transação no repositório local</td>
            <td>Transação na fatia</td>
            <td>Transação no Command Handler</td>
            <td><strong>Consistência Eventual</strong> com rollback semântico</td>
          </tr>
          <tr>
            <td><strong>Tratamento de Falha</strong></td>
            <td>Rollback de transação ACID no DB</td>
            <td>Rollback de transação ACID no DB</td>
            <td>Rollback de transação ACID no DB</td>
            <td><strong>Transações Compensatórias (C_1...C_n)</strong></td>
          </tr>
          <tr>
            <td><strong>Ideal Para</strong></td>
            <td>Domínios ricos e agnósticos a framework</td>
            <td>APIs ágeis, evolução rápida</td>
            <td>Assimetria alta entre leitura e escrita</td>
            <td>Processos multi-serviço e orquestração de batches</td>
          </tr>
        </tbody>
      </table>

      <pre id="general-console" class="console-box"></pre>
    </div>
  </div>

  <script>
    async function fetchSample(url) {
      const box = document.getElementById('general-console');
      box.style.display = 'block';
      box.textContent = 'Consultando ' + url + '...';
      try {
        const res = await fetch(url);
        const data = await res.json();
        box.textContent = 'Status ' + res.status + ' OK:\\n' + JSON.stringify(data, null, 2);
        box.scrollIntoView({ behavior: 'smooth' });
      } catch (err) {
        box.textContent = 'Erro ao consultar ' + url + ': ' + err.message;
      }
    }

    async function runSagaSimulation(failAt) {
      const box = document.getElementById('saga-console');
      box.style.display = 'block';
      box.textContent = '⏳ Executando Saga de Distribuição de Prêmios (simulando falha: ' + failAt + ')...\\n';

      // Reseta timeline
      resetTimeline();

      try {
        const res = await fetch('/saga/prize-distribution/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ simulateFailureAt: failAt })
        });
        const data = await res.json();
        
        updateTimelineFromExecution(data.execution);
        box.textContent = '🏁 Resposta do Orquestrador da Saga (Status HTTP ' + res.status + '):\\n' + JSON.stringify(data, null, 2);
      } catch (err) {
        box.textContent = '❌ Erro ao disparar a Saga: ' + err.message;
      }
    }

    function resetTimeline() {
      ['t1', 't2', 't3', 'comp'].forEach(id => {
        const step = document.getElementById('step-' + id);
        const badge = document.getElementById('badge-' + id);
        step.className = 'timeline-step';
        badge.className = 'step-status status-idle';
        badge.textContent = id === 'comp' ? 'Não necessária' : 'Aguardando';
      });
    }

    function updateTimelineFromExecution(exec) {
      if (!exec || !exec.steps) return;
      const s1 = exec.steps[0];
      const s2 = exec.steps[1];
      const s3 = exec.steps[2];

      updateStepUI('t1', s1);
      updateStepUI('t2', s2);
      updateStepUI('t3', s3);

      const compStep = document.getElementById('step-comp');
      const compBadge = document.getElementById('badge-comp');

      if (exec.status === 'COMPENSATED') {
        compStep.className = 'timeline-step compensated';
        compBadge.className = 'step-status status-compensated';
        compBadge.textContent = 'Compensado com Sucesso';
      } else if (exec.status === 'COMPLETED') {
        compStep.className = 'timeline-step';
        compBadge.className = 'step-status status-idle';
        compBadge.textContent = 'Não necessária (Sucesso)';
      }
    }

    function updateStepUI(id, stepData) {
      const step = document.getElementById('step-' + id);
      const badge = document.getElementById('badge-' + id);
      if (!stepData) return;

      if (stepData.status === 'SUCCESS') {
        step.className = 'timeline-step success';
        badge.className = 'step-status status-success';
        badge.textContent = 'Sucesso';
      } else if (stepData.status === 'FAILED') {
        step.className = 'timeline-step failed';
        badge.className = 'step-status status-failed';
        badge.textContent = 'Falha (' + (stepData.error || 'Erro') + ')';
      } else {
        step.className = 'timeline-step';
        badge.className = 'step-status status-idle';
        badge.textContent = stepData.status;
      }

      if (stepData.compensationStatus === 'SUCCESS') {
        step.className = 'timeline-step compensated';
        badge.className = 'step-status status-compensated';
        badge.textContent = 'Estornado (C)';
      }
    }

    async function runObservabilityLab(url) {
      const box = document.getElementById('obs-console');
      box.style.display = 'block';
      box.textContent = '📡 Enviando requisição para: ' + url + '...\\n';
      try {
        const start = performance.now();
        const res = await fetch(url);
        const data = await res.json();
        const duration = (performance.now() - start).toFixed(1);
        box.textContent = '✔ Resposta recebida (HTTP ' + res.status + ' em ' + duration + 'ms):\\n\\n' +
          JSON.stringify(data, null, 2) + 
          '\\n\\n🎯 DICA PARA AULA: Abra o Kibana APM (http://localhost:5601/app/apm) para ver a transação registrada com todos os seus spans e métricas!';
        box.scrollIntoView({ behavior: 'smooth' });
      } catch (err) {
        box.textContent = '❌ Falha na requisição: ' + err.message;
      }
    }

    async function fetchCircuitBreakerStatus() {
      const box = document.getElementById('resilience-console');
      box.style.display = 'block';
      box.textContent = '🔍 Consultando status do Circuit Breaker (/services/email/circuit-breaker)...\\n';
      try {
        const res = await fetch('/services/email/circuit-breaker');
        const data = await res.json();
        box.textContent = 'Status do Circuit Breaker (HTTP ' + res.status + '):\\n\\n' + JSON.stringify(data, null, 2);
        updateCircuitBadge(data.circuitBreaker);
        box.scrollIntoView({ behavior: 'smooth' });
      } catch (err) {
        box.textContent = '❌ Erro ao consultar Circuit Breaker: ' + err.message;
      }
    }

    async function resetCircuitBreaker() {
      const box = document.getElementById('resilience-console');
      box.style.display = 'block';
      box.textContent = '🔄 Resetando Circuit Breaker para CLOSED...\\n';
      try {
        const res = await fetch('/services/email/circuit-breaker/reset', { method: 'POST' });
        const data = await res.json();
        box.textContent = '✔ ' + data.message + ':\\n\\n' + JSON.stringify(data, null, 2);
        updateCircuitBadge(data.circuitBreaker);
        box.scrollIntoView({ behavior: 'smooth' });
      } catch (err) {
        box.textContent = '❌ Erro ao resetar: ' + err.message;
      }
    }

    async function simulateEmailCircuitTrip() {
      const box = document.getElementById('resilience-console');
      box.style.display = 'block';
      box.textContent = '💥 Disparando Saga com simulação de falha no e-mail (simulateFailureAt="send_emails")...\\n';
      try {
        const res = await fetch('/saga/prize-distribution/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ simulateFailureAt: 'send_emails' })
        });
        const data = await res.json();
        box.textContent += '🏁 Resposta da Saga:\\n' + JSON.stringify(data, null, 2) + '\\n\\n';
        
        // Atualiza badge e status do circuit breaker
        await fetchCircuitBreakerStatus();
      } catch (err) {
        box.textContent += '❌ Erro: ' + err.message;
      }
    }

    function updateCircuitBadge(cb) {
      if (!cb) return;
      const badge = document.getElementById('cb-state-badge');
      if (!badge) return;

      if (cb.state === 'CLOSED') {
        badge.style.background = 'rgba(16, 185, 129, 0.2)';
        badge.style.color = '#34d399';
        badge.style.borderColor = '#10b981';
        badge.textContent = '● Circuito: CLOSED (Saudável - ' + cb.failureCount + '/3 falhas)';
      } else if (cb.state === 'OPEN') {
        badge.style.background = 'rgba(239, 68, 68, 0.2)';
        badge.style.color = '#f87171';
        badge.style.borderColor = '#ef4444';
        badge.textContent = '● Circuito: OPEN (Proteção Fast Fail Ativa!)';
      } else {
        badge.style.background = 'rgba(245, 158, 11, 0.2)';
        badge.style.color = '#fbbf24';
        badge.style.borderColor = '#f59e0b';
        badge.textContent = '● Circuito: HALF_OPEN (Sondagem Experimental)';
      }
    }

    // Funções do Laboratório de Persistência Poliglota & Caching
    async function fetchDbStatus() {
      try {
        const res = await fetch('/database/status');
        const report = await res.json();
        
        const bPg = document.getElementById('badge-pg');
        const bMongo = document.getElementById('badge-mongo');
        const bRedis = document.getElementById('badge-redis');

        if (report.postgres && report.postgres.connected) {
          bPg.style.background = 'rgba(16, 185, 129, 0.2)';
          bPg.style.color = '#34d399';
          bPg.style.borderColor = '#10b981';
          bPg.textContent = '🐘 Postgres: CONECTADO (' + report.postgres.latencyMs + 'ms)';
        } else {
          bPg.style.background = 'rgba(239, 68, 68, 0.2)';
          bPg.style.color = '#f87171';
          bPg.style.borderColor = '#ef4444';
          bPg.textContent = '🐘 Postgres: OFFLINE (Fallback)';
        }

        if (report.mongodb && report.mongodb.connected) {
          bMongo.style.background = 'rgba(16, 185, 129, 0.2)';
          bMongo.style.color = '#34d399';
          bMongo.style.borderColor = '#10b981';
          bMongo.textContent = '🍃 MongoDB: CONECTADO (' + report.mongodb.latencyMs + 'ms)';
        } else {
          bMongo.style.background = 'rgba(239, 68, 68, 0.2)';
          bMongo.style.color = '#f87171';
          bMongo.style.borderColor = '#ef4444';
          bMongo.textContent = '🍃 MongoDB: OFFLINE (Fallback)';
        }

        if (report.redis && report.redis.connected) {
          bRedis.style.background = 'rgba(16, 185, 129, 0.2)';
          bRedis.style.color = '#34d399';
          bRedis.style.borderColor = '#10b981';
          bRedis.textContent = '⚡ Redis: CONECTADO (' + report.redis.latencyMs + 'ms)';
        } else {
          bRedis.style.background = 'rgba(239, 68, 68, 0.2)';
          bRedis.style.color = '#f87171';
          bRedis.style.borderColor = '#ef4444';
          bRedis.textContent = '⚡ Redis: OFFLINE (Fallback)';
        }
      } catch (err) {
        console.warn('Erro ao carregar status dos bancos:', err);
      }
    }

    async function runDbLab(endpoint) {
      const box = document.getElementById('db-console');
      box.style.display = 'block';
      box.textContent = '🔄 Consultando ' + endpoint + '...\\n';
      try {
        const res = await fetch(endpoint);
        const data = await res.json();
        box.textContent = '✔ Resposta de ' + endpoint + ':\\n\\n' + JSON.stringify(data, null, 2);
        await fetchDbStatus();
        box.scrollIntoView({ behavior: 'smooth' });
      } catch (err) {
        box.textContent = '❌ Erro: ' + err.message;
      }
    }

    async function runDbBenchmark() {
      const box = document.getElementById('db-console');
      box.style.display = 'block';
      box.textContent = '⏱️ Executando benchmark comparativo (RAM vs Disco)... Aguarde...\\n';
      try {
        const res = await fetch('/database/benchmark');
        const data = await res.json();
        let formatted = '🏆 RESULTADO DO BENCHMARK COMPARATIVO DE LATÊNCIA:\\n\\n';
        if (data.results) {
          data.results.forEach(function(r) {
            const statusIcon = r.status === 'SUCCESS' ? '✅' : '⚠️';
            formatted += statusIcon + ' [' + r.engine + '] (' + r.category + '):\\n';
            formatted += '   ✍️ Escrita: ' + r.writeMs + 'ms | 📖 Leitura: ' + r.readMs + 'ms | ⏱️ Total: ' + r.totalMs + 'ms\\n';
            if (r.error) formatted += '   ⚠️ Aviso: ' + r.error + '\\n';
            formatted += '\\n';
          });
        }
        formatted += '💡 Análise de Engenharia:\\n' + data.analysis + '\\n';
        box.textContent = formatted;
        await fetchDbStatus();
        box.scrollIntoView({ behavior: 'smooth' });
      } catch (err) {
        box.textContent = '❌ Erro no benchmark: ' + err.message;
      }
    }

    async function testCacheAside(playerId) {
      const box = document.getElementById('db-console');
      box.style.display = 'block';
      box.textContent = '⚡ Executando requisição com Cache-Aside para jogador ' + playerId + '...\\n';
      try {
        const res = await fetch('/database/cache-demo/player/' + playerId);
        const data = await res.json();
        const cacheHeader = res.headers.get('X-Cache') || 'DESCONHECIDO';
        const responseTime = res.headers.get('X-Response-Time') || (data.latencyMs + 'ms');

        let summary = '📦 STATUS DO CACHE: [' + cacheHeader + ']\\n';
        summary += '⏱️ TEMPO DE RESPOSTA: ' + responseTime + '\\n';
        summary += '🏛️ FONTE DOS DADOS: ' + data.source + '\\n\\n';
        summary += '📝 Detalhes da Operação:\\n' + data.cacheStatus + '\\n\\n';
        summary += '👤 Dados do Atleta:\\n' + JSON.stringify(data.data, null, 2);

        box.textContent = summary;
        await fetchDbStatus();
        box.scrollIntoView({ behavior: 'smooth' });
      } catch (err) {
        box.textContent = '❌ Erro ao testar cache: ' + err.message;
      }
    }

    async function invalidateCache(playerId) {
      const box = document.getElementById('db-console');
      box.style.display = 'block';
      box.textContent = '🗑️ Invalidando chave do jogador ' + playerId + ' no Redis...\\n';
      try {
        const res = await fetch('/database/cache-demo/player/' + playerId, { method: 'DELETE' });
        const data = await res.json();
        box.textContent = '✔ Resposta da Invalidação:\\n\\n' + JSON.stringify(data, null, 2) + '\\n\\n💡 Dica de Aula: Execute o botão "3. Simular Leitura com Cache-Aside" novamente para observar o Cache MISS!';
        box.scrollIntoView({ behavior: 'smooth' });
      } catch (err) {
        box.textContent = '❌ Erro ao invalidar cache: ' + err.message;
      }
    }

    async function saveNoSqlScout() {
      const box = document.getElementById('db-console');
      box.style.display = 'block';
      box.textContent = '🍃 Enviando scout semiestruturado de vôlei para o MongoDB...\\n';
      try {
        const sampleScout = {
          tournament: 'Final do Circuito Brasileiro 2026',
          teams: {
            teamA: { player1: 'Alison Mamute', player2: 'Bruno Schmidt', score: 2 },
            teamB: { player1: 'Evandro Gonçalves', player2: 'Arthur Lanci', score: 1 }
          },
          advancedStats: {
            aces: { mamute: 5, bruno: 2 },
            blocks: { mamute: 8, evandro: 6 },
            sandHeatmapPoints: [
              { x: 23, y: 45, type: 'spike' },
              { x: 67, y: 88, type: 'block' }
            ]
          }
        };

        const res = await fetch('/database/nosql/scout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sampleScout)
        });
        const data = await res.json();
        box.textContent = '✔ Documento salvo com sucesso no MongoDB:\\n\\n' + JSON.stringify(data, null, 2);
        box.scrollIntoView({ behavior: 'smooth' });
      } catch (err) {
        box.textContent = '❌ Erro ao salvar scout no MongoDB: ' + err.message;
      }
    }

    async function testAcidTx(simulateError) {
      const box = document.getElementById('db-console');
      box.style.display = 'block';
      box.textContent = simulateError
        ? '💥 Testando falha em transação ACID no PostgreSQL (esperando ROLLBACK)...\\n'
        : '🐘 Testando transação atômica ACID no PostgreSQL (esperando COMMIT)...\\n';
      try {
        const res = await fetch('/database/relational/transaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amountCents: 50000, simulateError: simulateError })
        });
        const data = await res.json();
        box.textContent = '🏁 Resposta da Transação Relacional:\\n\\n' + JSON.stringify(data, null, 2);
        box.scrollIntoView({ behavior: 'smooth' });
      } catch (err) {
        box.textContent = '❌ Erro: ' + err.message;
      }
    }

    // Carrega status na inicialização
    setTimeout(function() {
      fetchCircuitBreakerStatus();
      fetchDbStatus();
    }, 500);
  </script>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`\n🏐 [VoleiPlay Gateway] Servidor unificado ativo em http://localhost:${PORT}`);
  console.log(`   🔷 Hexagonal:        http://localhost:${PORT}/hexagonal/players`);
  console.log(`   🔶 Vertical Slice:   http://localhost:${PORT}/vertical/players`);
  console.log(`   🟢 CQRS Mediator:    http://localhost:${PORT}/cqrs/players`);
  console.log(`   🟣 Saga (Prêmios):   http://localhost:${PORT}/services/prizes/batches`);
  console.log(`   📧 Saga (Email REST):http://localhost:${PORT}/services/email -> http://localhost:3004`);
  console.log(`   🔐 Auth Service:     http://localhost:${PORT}/services/auth -> http://localhost:3007`);
  console.log(`   🔄 Saga Orchestrator http://localhost:${PORT}/saga/executions`);
  console.log(`   📡 Observability:    http://localhost:${PORT}/observability/status`);
  console.log(`   📊 Kibana APM:       http://localhost:5601/app/apm`);
  console.log(`   🎯 Elastic APM:      http://localhost:8200`);
  console.log(`   🔍 Elasticsearch:    http://localhost:9200`);
  console.log(`   🐘 PostgreSQL (ACID):http://localhost:${PORT}/database/status`);
  console.log(`   🍃 MongoDB (NoSQL):  http://localhost:${PORT}/database/nosql/scouts`);
  console.log(`   ⚡ Redis Cache-Aside:http://localhost:${PORT}/database/cache-demo/player/p-1`);
  console.log(`   ⏱️ DB Benchmark:     http://localhost:${PORT}/database/benchmark\n`);
});

