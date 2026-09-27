import { describe, it, expect } from 'vitest';

describe('Healthcheck Integration Unit Tests', () => {
  it('Auth Service deve responder com status UP na porta 3007', async () => {
    const res = await fetch('http://localhost:3007/api/auth/health');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('UP');
    expect(data.service).toContain('Auth');
  });

  it('Email Service deve responder com status UP na porta 3004', async () => {
    const res = await fetch('http://localhost:3004/api/emails/health');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('UP');
    expect(data.service).toContain('Email');
  });

  it('Backend Gateway deve responder com status UP e listar dependências na porta 3000', async () => {
    const res = await fetch('http://localhost:3000/health');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('UP');
    expect(data.service).toBe('voleiplay-backend');
    expect(data.dependencies).toBeDefined();
    expect(data.dependencies.authService).toContain(':3007');
    expect(data.dependencies.emailService).toContain(':3004');
  });

  it('Gateway Proxy de autenticação deve repassar requisições com sucesso', async () => {
    const res = await fetch('http://localhost:3000/services/auth/stats');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.stats).toBeDefined();
    expect(data.stats.totalUsers).toBeGreaterThanOrEqual(4);
  });
});
