import { LoginDto, RegisterDto, User, AuthSession, AuthStats } from '../types/auth.types.js';
import { userRepository, UserRepository } from '../repositories/user.repository.js';
import { AuthObservability } from '../observability/apm.js';

export class AuthService {
  constructor(private repo: UserRepository = userRepository) {}

  /**
   * Autentica usuário por e-mail e senha
   */
  async login(dto: LoginDto): Promise<AuthSession> {
    const span = AuthObservability.startSpan('AuthService.login', 'auth', 'login', 'authenticate');
    
    try {
      const email = dto.email?.trim().toLowerCase();
      const userRecord = this.repo.findByEmail(email);

      if (!userRecord) {
        console.log(`\x1b[31m[AuthService] ✖ Falha de login: Usuário com e-mail "${email}" não encontrado.\x1b[0m`);
        throw new Error('Credenciais inválidas: e-mail ou senha incorretos.');
      }

      // Validação de senha didática
      if (userRecord.passwordHash !== dto.password) {
        console.log(`\x1b[31m[AuthService] ✖ Falha de login: Senha incorreta para o usuário "${email}".\x1b[0m`);
        throw new Error('Credenciais inválidas: e-mail ou senha incorretos.');
      }

      const { passwordHash, ...user } = userRecord;
      const session = this.repo.createSession(user);

      console.log(`\x1b[32m[AuthService] ✔ Login bem-sucedido: ${user.name} (${user.role}) <${user.email}>\x1b[0m`);
      AuthObservability.setLabel('userId', user.id);
      AuthObservability.setLabel('userRole', user.role);

      return session;
    } finally {
      span?.end();
    }
  }

  /**
   * Registra um novo usuário
   */
  async register(dto: RegisterDto): Promise<AuthSession> {
    const span = AuthObservability.startSpan('AuthService.register', 'auth', 'register', 'create');

    try {
      const email = dto.email?.trim().toLowerCase();
      if (!email || !dto.password || !dto.name) {
        throw new Error('Nome, e-mail e senha são campos obrigatórios.');
      }

      if (this.repo.findByEmail(email)) {
        throw new Error(`Já existe um usuário cadastrado com o e-mail "${email}".`);
      }

      const id = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const role = dto.role || 'FAN';

      const newUser = {
        id,
        name: dto.name.trim(),
        email,
        passwordHash: dto.password,
        role,
        avatarUrl: dto.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${id}`,
        bio: dto.bio || 'Membro da comunidade Voleiplay',
        createdAt: new Date().toISOString()
      };

      this.repo.save(newUser);
      console.log(`\x1b[32m[AuthService] 👤 Novo usuário registrado: ${newUser.name} (${newUser.role}) <${newUser.email}>\x1b[0m`);

      const { passwordHash, ...safeUser } = newUser;

      // Dispara e-mail de boas-vindas para o novo usuário via REST para o microsserviço de e-mail
      await this.dispatchWelcomeEmail(safeUser);

      return this.repo.createSession(safeUser);
    } finally {
      span?.end();
    }
  }

  /**
   * Envia e-mail de boas-vindas através da API de E-mails mockada (REST)
   */
  private async dispatchWelcomeEmail(user: User): Promise<void> {
    const emailServiceUrl = process.env.EMAIL_SERVICE_URL || 'http://localhost:3004';
    const span = AuthObservability.startSpan('REST Call: EmailService send welcome email', 'http', 'email-service', 'send');

    try {
      console.log(`\x1b[36m[AuthService] 📧 Disparando e-mail de boas-vindas via REST para ${emailServiceUrl}/api/emails/send...\x1b[0m`);
      const response = await fetch(`${emailServiceUrl}/api/emails/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          to: user.email,
          recipientName: user.name,
          subject: '🏐 Bem-vindo ao Voleiplay Beach Pro Tour!',
          body: `Olá ${user.name}! Seu cadastro como ${user.role} foi realizado com sucesso no sistema oficial do Voleiplay Beach Pro Tour. Prepare-se para as etapas na areia!`,
          type: 'SYSTEM_ALERT',
          metadata: {
            userId: user.id,
            userRole: user.role,
            source: 'auth-service-registration'
          }
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        console.log(`\x1b[32m[AuthService] ✔ E-mail de boas-vindas despachado com sucesso via API de E-mail (ID: ${data.email?.id})!\x1b[0m`);
      } else {
        console.warn(`\x1b[33m[AuthService] ⚠️ Resposta da API de E-mail: ${data.error || response.statusText}\x1b[0m`);
      }
    } catch (err: any) {
      console.error(`\x1b[31m[AuthService] ✖ Não foi possível contatar a API de e-mail (${emailServiceUrl}):\x1b[0m`, err.message);
    } finally {
      span?.end();
    }
  }

  /**
   * Valida um token de sessão
   */
  validateToken(token: string): User {
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();
    const session = this.repo.findSession(cleanToken);

    if (!session) {
      throw new Error('Sessão inválida ou expirada. Efetue login novamente.');
    }

    return session.user;
  }

  /**
   * Encerra sessão (logout)
   */
  logout(token: string): boolean {
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();
    const removed = this.repo.deleteSession(cleanToken);
    if (removed) {
      console.log(`\x1b[36m[AuthService] 🚪 Sessão encerrada com sucesso.\x1b[0m`);
    }
    return removed;
  }

  listUsers(): User[] {
    return this.repo.findAll();
  }

  getStats(): AuthStats {
    return this.repo.getStats();
  }
}

export const authService = new AuthService();
