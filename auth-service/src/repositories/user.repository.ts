import { User, UserRecord, AuthSession, AuthStats, UserRole } from '../types/auth.types.js';

export class UserRepository {
  private users: Map<string, UserRecord> = new Map();
  private sessions: Map<string, AuthSession> = new Map();
  private totalLoginsCount = 0;

  constructor() {
    this.seedUsers();
  }

  private seedUsers(): void {
    const defaultUsers: UserRecord[] = [
      {
        id: 'usr-admin-1',
        name: 'Diretor de Competições BPT',
        email: 'admin@voleiplay.com.br',
        passwordHash: 'admin123',
        role: 'ADMIN',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=faces',
        bio: 'Administrador geral da Federação e gestor dos torneios oficiais.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-athlete-1',
        name: 'Ana Patrícia Silva',
        email: 'ana.patricia@voleiplay.com.br',
        passwordHash: 'atleta123',
        role: 'ATHLETE',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop&crop=faces',
        bio: 'Campeã Olímpica Paris 2024 e Líder do ranking mundial de duplas.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-athlete-2',
        name: 'Eduarda (Duda) Lisboa',
        email: 'duda.lisboa@voleiplay.com.br',
        passwordHash: 'atleta123',
        role: 'ATHLETE',
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop&crop=faces',
        bio: 'Campeã Olímpica Paris 2024 e eleita melhor defensora do mundo.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-coach-1',
        name: 'Técnico Bernardinho de Areia',
        email: 'treinador@voleiplay.com.br',
        passwordHash: 'treinador123',
        role: 'COACH',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=faces',
        bio: 'Coordenador técnico de duplas de vôlei de praia.',
        createdAt: new Date().toISOString()
      }
    ];

    for (const u of defaultUsers) {
      this.users.set(u.email.toLowerCase(), u);
    }
  }

  findByEmail(email: string): UserRecord | undefined {
    return this.users.get(email.toLowerCase().trim());
  }

  findById(id: string): UserRecord | undefined {
    return Array.from(this.users.values()).find(u => u.id === id);
  }

  save(user: UserRecord): UserRecord {
    this.users.set(user.email.toLowerCase().trim(), user);
    return user;
  }

  findAll(): User[] {
    return Array.from(this.users.values()).map(u => {
      const { passwordHash, ...safeUser } = u;
      return safeUser;
    });
  }

  // Sessões e Tokens
  createSession(user: User): AuthSession {
    this.totalLoginsCount++;
    const token = `vptok_${Date.now()}_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
    const session: AuthSession = {
      token,
      user,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
    };

    this.sessions.set(token, session);
    return session;
  }

  findSession(token: string): AuthSession | undefined {
    const session = this.sessions.get(token);
    if (!session) return undefined;

    // Verifica expiração
    if (new Date() > new Date(session.expiresAt)) {
      this.sessions.delete(token);
      return undefined;
    }

    return session;
  }

  deleteSession(token: string): boolean {
    return this.sessions.delete(token);
  }

  getStats(): AuthStats {
    const byRole: Record<UserRole, number> = {
      ADMIN: 0,
      ATHLETE: 0,
      COACH: 0,
      FAN: 0
    };

    for (const user of this.users.values()) {
      byRole[user.role] = (byRole[user.role] || 0) + 1;
    }

    return {
      totalUsers: this.users.size,
      activeSessions: this.sessions.size,
      totalLogins: this.totalLoginsCount,
      usersByRole: byRole
    };
  }
}

export const userRepository = new UserRepository();
