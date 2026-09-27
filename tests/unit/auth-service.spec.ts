import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserRepository } from '../../auth-service/src/repositories/user.repository.js';
import { AuthService } from '../../auth-service/src/services/auth.service.js';

describe('Auth Service - UserRepository Unit Tests', () => {
  let repo: UserRepository;

  beforeEach(() => {
    repo = new UserRepository();
  });

  it('deve inicializar com usuários padrão pré-semeados', () => {
    const users = repo.findAll();
    expect(users.length).toBeGreaterThanOrEqual(4);

    const admin = repo.findByEmail('admin@voleiplay.com.br');
    expect(admin).toBeDefined();
    expect(admin?.role).toBe('ADMIN');

    const ana = repo.findByEmail('ana.patricia@voleiplay.com.br');
    expect(ana).toBeDefined();
    expect(ana?.role).toBe('ATHLETE');
  });

  it('deve buscar usuário por e-mail independente de maiúsculas e espaços', () => {
    const user = repo.findByEmail('   ANA.PATRICIA@VOLEIPLAY.COM.BR   ');
    expect(user).toBeDefined();
    expect(user?.name).toBe('Ana Patrícia Silva');
  });

  it('deve criar e recuperar uma sessão com token vptok_*', () => {
    const safeUser = {
      id: 'test-1',
      name: 'Tester',
      email: 'test@voleiplay.com',
      role: 'ATHLETE' as const,
      avatarUrl: 'https://example.com/avatar.jpg',
      bio: 'Bio',
      createdAt: new Date().toISOString()
    };

    const session = repo.createSession(safeUser);
    expect(session.token).toMatch(/^vptok_/);
    expect(session.user.email).toBe('test@voleiplay.com');

    const retrieved = repo.findSession(session.token);
    expect(retrieved).toBeDefined();
    expect(retrieved?.user.id).toBe('test-1');
  });

  it('deve revogar sessão com sucesso ao fazer logout', () => {
    const safeUser = {
      id: 'test-logout',
      name: 'User Logout',
      email: 'logout@voleiplay.com',
      role: 'FAN' as const,
      avatarUrl: 'https://example.com/avatar.jpg',
      bio: '',
      createdAt: new Date().toISOString()
    };

    const session = repo.createSession(safeUser);
    expect(repo.findSession(session.token)).toBeDefined();

    const revoked = repo.deleteSession(session.token);
    expect(revoked).toBe(true);
    expect(repo.findSession(session.token)).toBeUndefined();
  });

  it('deve contabilizar estatísticas de autenticação corretamente', () => {
    const statsInitial = repo.getStats();
    expect(statsInitial.totalUsers).toBeGreaterThanOrEqual(4);

    const user = repo.findAll()[0];
    repo.createSession(user);

    const statsAfter = repo.getStats();
    expect(statsAfter.totalLogins).toBe(statsInitial.totalLogins + 1);
    expect(statsAfter.activeSessions).toBe(statsInitial.activeSessions + 1);
  });
});

describe('Auth Service - AuthService Business Logic Unit Tests', () => {
  let repo: UserRepository;
  let authService: AuthService;

  beforeEach(() => {
    repo = new UserRepository();
    authService = new AuthService(repo);
    // Mock global fetch para evitar chamadas de rede externas no teste unitário
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, email: { id: 'email-mock-123' } })
    }));
  });

  it('deve realizar login com sucesso usando credenciais válidas', async () => {
    const session = await authService.login({
      email: 'admin@voleiplay.com.br',
      password: 'admin123'
    });

    expect(session.token).toMatch(/^vptok_/);
    expect(session.user.role).toBe('ADMIN');
    expect((session.user as any).passwordHash).toBeUndefined(); // Não deve vazar senha
  });

  it('deve rejeitar login com e-mail inexistente', async () => {
    await expect(
      authService.login({
        email: 'inexistente@voleiplay.com',
        password: 'qualquer_senha'
      })
    ).rejects.toThrow('Credenciais inválidas: e-mail ou senha incorretos.');
  });

  it('deve rejeitar login com senha incorreta', async () => {
    await expect(
      authService.login({
        email: 'admin@voleiplay.com.br',
        password: 'senha_errada_total'
      })
    ).rejects.toThrow('Credenciais inválidas: e-mail ou senha incorretos.');
  });

  it('deve registrar novo usuário com sucesso e disparar notificação de e-mail mock', async () => {
    const session = await authService.register({
      name: 'Evandro Gonçalves',
      email: 'evandro@voleiplay.com.br',
      password: 'senhaSegura123',
      role: 'ATHLETE',
      bio: 'Atleta olímpico de vôlei de praia'
    });

    expect(session.token).toMatch(/^vptok_/);
    expect(session.user.name).toBe('Evandro Gonçalves');
    expect(session.user.email).toBe('evandro@voleiplay.com.br');
    expect(session.user.role).toBe('ATHLETE');

    // Valida que fetch foi chamado para enviar o email de boas vindas
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/emails/send'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('evandro@voleiplay.com.br')
      })
    );
  });

  it('deve rejeitar registro se campos obrigatórios estiverem faltando', async () => {
    await expect(
      authService.register({
        name: '',
        email: 'teste@voleiplay.com',
        password: '123'
      })
    ).rejects.toThrow('Nome, e-mail e senha são campos obrigatórios.');
  });

  it('deve rejeitar registro se o e-mail já estiver cadastrado', async () => {
    await expect(
      authService.register({
        name: 'Duplicado',
        email: 'admin@voleiplay.com.br',
        password: '123'
      })
    ).rejects.toThrow('Já existe um usuário cadastrado');
  });

  it('deve validar token de sessão existente no validateToken()', async () => {
    const session = await authService.login({
      email: 'ana.patricia@voleiplay.com.br',
      password: 'atleta123'
    });

    const activeUser = authService.validateToken(session.token);
    expect(activeUser).toBeDefined();
    expect(activeUser.email).toBe('ana.patricia@voleiplay.com.br');
    expect(activeUser.role).toBe('ATHLETE');
  });

  it('deve realizar logout com sucesso invalidando o token', async () => {
    const session = await authService.login({
      email: 'duda.lisboa@voleiplay.com.br',
      password: 'atleta123'
    });

    const loggedOut = authService.logout(session.token);
    expect(loggedOut).toBe(true);

    expect(() => authService.validateToken(session.token)).toThrow('Sessão inválida ou expirada');
  });
});
