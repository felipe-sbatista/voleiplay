// 1. Elastic APM DEVE ser o primeiríssimo import para auto-instrumentação (Distributed Tracing)
import './observability/apm.js';

import express from 'express';
import cors from 'cors';
import { createAuthRouter } from './routes/auth.router.js';
import { authService } from './services/auth.service.js';

const app = express();
const PORT = process.env.PORT || 3007;

app.use(cors());
app.use(express.json());

// Monta rotas REST sob /api/auth
app.use('/api/auth', createAuthRouter());

// Atalho para /health
app.get('/health', (req, res) => {
  res.json({
    service: 'Voleiplay Auth Microservice',
    status: 'UP',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Dashboard Web Didático do Microsserviço de Autenticação
app.get('/', (req, res) => {
  const stats = authService.getStats();
  const users = authService.listUsers();

  res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VOLEIPLAY - Microsserviço de Autenticação</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #070a13;
      --card: rgba(18, 24, 43, 0.85);
      --border: rgba(255, 255, 255, 0.08);
      --text: #f3f4f6;
      --muted: #9ca3af;
      --primary: #a855f7;
      --volt: #ccff00;
      --success: #10b981;
      --danger: #ef4444;
      --warning: #f59e0b;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Outfit', sans-serif;
      background: radial-gradient(circle at 50% 0%, #3b0764 0%, var(--bg) 65%);
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
      background: rgba(168, 85, 247, 0.15);
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.3);
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
    .pill-admin { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
    .pill-athlete { background: rgba(204, 255, 0, 0.15); color: #ccff00; border: 1px solid rgba(204, 255, 0, 0.3); }
    .pill-coach { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }
    .pill-fan { background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
      vertical-align: middle;
      margin-right: 0.5rem;
      border: 2px solid rgba(255,255,255,0.1);
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="badge">
        <span class="status-dot"></span>
        Auth Microservice Online &bull; Porta ${PORT}
      </div>
      <h1>🔐 Voleiplay Auth Service API</h1>
      <p class="subtitle">
        Microsserviço autônomo responsável pelo login, cadastro de atletas/usuários, geração de tokens de sessão e controle de acesso.
      </p>
    </header>

    <!-- Métricas -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Usuários Cadastrados</div>
        <div class="stat-value" style="color: var(--primary);">${stats.totalUsers}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Sessões Ativas</div>
        <div class="stat-value" style="color: var(--success);">${stats.activeSessions}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total de Logins</div>
        <div class="stat-value" style="color: var(--volt);">${stats.totalLogins}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Atletas Registrados</div>
        <div class="stat-value" style="color: #38bdf8;">${stats.usersByRole['ATHLETE'] || 0}</div>
      </div>
    </div>

    <!-- Tabela de Usuários Cadastrados / Credenciais Demo -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">👥 Usuários & Credenciais para Demonstração em Aula</div>
      </div>
      <div style="overflow-x: auto;">
        <table>
          <thead>
            <tr>
              <th>Usuário</th>
              <th>E-mail</th>
              <th>Senha Demo</th>
              <th>Papel (Role)</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => `
              <tr>
                <td>
                  <img src="${u.avatarUrl}" class="user-avatar" alt="${u.name}">
                  <strong>${u.name}</strong>
                </td>
                <td style="font-family: monospace; color: var(--muted);">${u.email}</td>
                <td><code style="background: rgba(255,255,255,0.08); padding: 0.2rem 0.4rem; border-radius: 4px;">${u.role === 'ADMIN' ? 'admin123' : (u.role === 'COACH' ? 'treinador123' : 'atleta123')}</code></td>
                <td>
                  <span class="pill ${u.role === 'ADMIN' ? 'pill-admin' : (u.role === 'ATHLETE' ? 'pill-athlete' : (u.role === 'COACH' ? 'pill-coach' : 'pill-fan'))}">
                    ${u.role}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Guia de Endpoints -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">🔌 Endpoints REST de Autenticação</div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <div>
          <span class="pill" style="background: rgba(16, 185, 129, 0.2); color: #34d399;">POST</span>
          <strong style="margin-left: 0.5rem; font-family: monospace;">http://localhost:${PORT}/api/auth/login</strong>
          <p style="color: var(--muted); font-size: 0.82rem; margin-top: 0.25rem;">Autentica usuário com e-mail e senha. Retorna token e dados do usuário.</p>
        </div>
        <div>
          <span class="pill" style="background: rgba(56, 189, 248, 0.2); color: #38bdf8;">POST</span>
          <strong style="margin-left: 0.5rem; font-family: monospace;">http://localhost:${PORT}/api/auth/register</strong>
          <p style="color: var(--muted); font-size: 0.82rem; margin-top: 0.25rem;">Cadastra um novo usuário no sistema.</p>
        </div>
        <div>
          <span class="pill" style="background: rgba(168, 85, 247, 0.2); color: #c084fc;">GET</span>
          <strong style="margin-left: 0.5rem; font-family: monospace;">http://localhost:${PORT}/api/auth/me</strong>
          <p style="color: var(--muted); font-size: 0.82rem; margin-top: 0.25rem;">Valida o token enviado no cabeçalho Authorization: Bearer &lt;token&gt;.</p>
        </div>
        <div>
          <span class="pill" style="background: rgba(239, 68, 68, 0.2); color: #f87171;">POST</span>
          <strong style="margin-left: 0.5rem; font-family: monospace;">http://localhost:${PORT}/api/auth/logout</strong>
          <p style="color: var(--muted); font-size: 0.82rem; margin-top: 0.25rem;">Invalida o token de sessão ativo.</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`\n================================================================`);
  console.log(`\x1b[35m🔐 [Auth Service API] Microsserviço ativo em http://localhost:${PORT}\x1b[0m`);
  console.log(`   Healthcheck:   http://localhost:${PORT}/api/auth/health`);
  console.log(`   Login:         http://localhost:${PORT}/api/auth/login`);
  console.log(`   Dashboard Web: http://localhost:${PORT}/`);
  console.log(`================================================================\n`);
});
