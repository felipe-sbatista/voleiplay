// O Elastic APM DEVE ser o primeiríssimo import para auto-instrumentação (Distributed Tracing)
import './observability/apm.js';

import express from 'express';
import cors from 'cors';
import { createEmailRouter } from './routes/email.router.js';
import { emailService } from './services/email.service.js';

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

// Monta as rotas REST padrão sob /api/emails
const emailRouter = createEmailRouter();
app.use('/api/emails', emailRouter);

// Atalho para /health
app.get('/health', (req, res) => {
  res.json({
    service: 'Voleiplay Email Microservice',
    status: 'UP',
    mocked: true,
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Dashboard Web Didático e Interativo do Microsserviço
app.get('/', (req, res) => {
  const stats = emailService.getStats();
  const recentEmails = emailService.listSent(20);

  res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VOLEIPLAY - Microsserviço de E-mail (Mock)</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #070a13;
      --card: rgba(18, 24, 43, 0.85);
      --border: rgba(255, 255, 255, 0.08);
      --text: #f3f4f6;
      --muted: #9ca3af;
      --primary: #38bdf8;
      --accent: #a855f7;
      --success: #10b981;
      --danger: #ef4444;
      --warning: #f59e0b;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Outfit', sans-serif;
      background: radial-gradient(circle at 50% 0%, #0c4a6e 0%, var(--bg) 65%);
      color: var(--text);
      padding: 2.5rem 1.5rem;
      min-height: 100vh;
    }
    .container { max-width: 1100px; margin: 0 auto; }
    header { text-align: center; margin-bottom: 2.5rem; }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 1rem;
      background: rgba(56, 189, 248, 0.15);
      color: var(--primary);
      border: 1px solid rgba(56, 189, 248, 0.3);
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 700;
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 10px #10b981;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.85); }
    }
    h1 { font-size: 2.6rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 0.5rem; }
    p.subtitle { color: var(--muted); font-size: 1.1rem; max-width: 700px; margin: 0 auto; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 1rem;
      padding: 1.5rem;
      backdrop-filter: blur(12px);
      box-shadow: 0 15px 35px -10px rgba(0,0,0,0.5);
    }
    .stat-label { font-size: 0.8rem; color: var(--muted); text-transform: uppercase; font-weight: 600; }
    .stat-value { font-size: 2.2rem; font-weight: 800; margin-top: 0.3rem; }

    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 1.25rem;
      padding: 1.75rem;
      margin-bottom: 2rem;
      backdrop-filter: blur(12px);
    }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem; }
    .card-title { font-size: 1.3rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1rem;
      border-radius: 0.6rem;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      text-decoration: none;
    }
    .btn:hover { opacity: 0.9; transform: translateY(-1px); }
    .btn-primary { background: var(--primary); color: #070a13; }
    .btn-danger { background: var(--danger); color: white; }
    .btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text); }
    .btn-outline:hover { background: rgba(255,255,255,0.06); }

    table { width: 100%; border-collapse: collapse; text-align: left; }
    th, td { padding: 0.85rem; border-bottom: 1px solid var(--border); font-size: 0.88rem; }
    th { color: var(--muted); text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; }
    
    .pill {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.72rem;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      display: inline-block;
      font-weight: 600;
    }
    .pill-notification { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .pill-cancellation { background: rgba(239, 68, 68, 0.15); color: #f87171; }
    .pill-system { background: rgba(56, 189, 248, 0.15); color: #38bdf8; }

    .code-box {
      background: #03050a;
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      padding: 1rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.82rem;
      color: #38bdf8;
      overflow-x: auto;
      margin-top: 0.5rem;
    }
    .empty-state { text-align: center; padding: 2.5rem; color: var(--muted); }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="badge">
        <span class="status-dot"></span>
        Microservice Online &bull; Porta ${PORT}
      </div>
      <h1>📧 Voleiplay Email API</h1>
      <p class="subtitle">
        Microsserviço autônomo e mockado responsável pelo envio de notificações, recibos de premiação e e-mails de estorno compensatório da Saga.
      </p>
    </header>

    <!-- Métricas -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total de E-mails Enviados</div>
        <div class="stat-value" style="color: var(--success);" id="val-sent">${stats.totalSent}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Falhas Simuladas</div>
        <div class="stat-value" style="color: var(--danger);" id="val-failed">${stats.totalFailed}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Notificações de Premiação</div>
        <div class="stat-value" style="color: var(--primary);">${stats.byType['PRIZE_NOTIFICATION'] || 0}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Estornos Compensatórios</div>
        <div class="stat-value" style="color: var(--warning);">${stats.byType['PRIZE_CANCELLATION'] || 0}</div>
      </div>
    </div>

    <!-- Tabela da Caixa de Saída -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          📬 Caixa de Saída (Histórico Recente em Memória)
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-outline" onclick="location.reload()">🔄 Atualizar</button>
          <button class="btn btn-danger" onclick="clearEmails()">🧹 Limpar Caixa</button>
        </div>
      </div>

      ${recentEmails.length === 0 ? `
        <div class="empty-state">
          Nenhum e-mail foi disparado ainda. Dispare a Saga no Gateway ou envie uma requisição REST para começar!
        </div>
      ` : `
        <div style="overflow-x: auto;">
          <table>
            <thead>
              <tr>
                <th>Horário</th>
                <th>Destinatário</th>
                <th>Assunto</th>
                <th>Tipo</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${recentEmails.map(m => `
                <tr>
                  <td style="color: var(--muted); font-size: 0.8rem;">${new Date(m.sentAt).toLocaleTimeString('pt-BR')}</td>
                  <td>
                    <strong>${m.recipientName}</strong><br>
                    <span style="color: var(--muted); font-size: 0.78rem;">${m.to}</span>
                  </td>
                  <td>${m.subject}</td>
                  <td>
                    <span class="pill ${m.type === 'PRIZE_CANCELLATION' ? 'pill-cancellation' : (m.type === 'PRIZE_NOTIFICATION' ? 'pill-notification' : 'pill-system')}">
                      ${m.type}
                    </span>
                  </td>
                  <td>
                    <span style="color: ${m.status === 'SENT' ? '#34d399' : '#f87171'}; font-weight: 700;">
                      ${m.status === 'SENT' ? '✔ ENVIADO' : '✖ FALHA'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>

    <!-- Guia de Integração REST -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">🔌 Endpoints REST Disponíveis</div>
      </div>
      <p style="color: var(--muted); font-size: 0.9rem; margin-bottom: 1rem;">
        Esta API responde exclusivamente por chamadas HTTP REST. O backend principal orquestra envios consumindo estes endpoints:
      </p>

      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <div>
          <span class="pill" style="background: rgba(56, 189, 248, 0.2); color: #38bdf8;">POST</span>
          <strong style="margin-left: 0.5rem; font-family: monospace;">http://localhost:${PORT}/api/emails/send-batch</strong>
          <p style="color: var(--muted); font-size: 0.82rem; margin-top: 0.25rem;">Disparo de múltiplos e-mails no Passo 3 (T3) da Saga.</p>
        </div>
        <div>
          <span class="pill" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24;">POST</span>
          <strong style="margin-left: 0.5rem; font-family: monospace;">http://localhost:${PORT}/api/emails/compensate</strong>
          <p style="color: var(--muted); font-size: 0.82rem; margin-top: 0.25rem;">Disparo de comunicados de estorno na compensação reversa (C3) da Saga.</p>
        </div>
        <div>
          <span class="pill" style="background: rgba(16, 185, 129, 0.2); color: #34d399;">GET</span>
          <strong style="margin-left: 0.5rem; font-family: monospace;">http://localhost:${PORT}/api/emails</strong>
          <p style="color: var(--muted); font-size: 0.82rem; margin-top: 0.25rem;">Consulta dos e-mails enviados para auditoria.</p>
        </div>
        <div>
          <span class="pill" style="background: rgba(16, 185, 129, 0.2); color: #34d399;">GET</span>
          <strong style="margin-left: 0.5rem; font-family: monospace;">http://localhost:${PORT}/api/emails/stats</strong>
          <p style="color: var(--muted); font-size: 0.82rem; margin-top: 0.25rem;">Métricas e contadores de envio.</p>
        </div>
      </div>
    </div>
  </div>

  <script>
    async function clearEmails() {
      if (!confirm('Deseja realmente limpar a caixa de saída?')) return;
      try {
        await fetch('/api/emails', { method: 'DELETE' });
        location.reload();
      } catch (err) {
        alert('Erro ao limpar: ' + err.message);
      }
    }
  </script>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`\n================================================================`);
  console.log(`\x1b[36m📧 [Email Service API] Microsserviço ativo em http://localhost:${PORT}\x1b[0m`);
  console.log(`   Healthcheck:   http://localhost:${PORT}/api/emails/health`);
  console.log(`   Listar:        http://localhost:${PORT}/api/emails`);
  console.log(`   Stats:         http://localhost:${PORT}/api/emails/stats`);
  console.log(`   Dashboard Web: http://localhost:${PORT}/`);
  console.log(`================================================================\n`);
});
