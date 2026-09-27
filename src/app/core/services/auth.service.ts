import { Injectable, signal, computed } from '@angular/core';
import { User, LoginCredentials, RegisterCredentials, AuthResponse } from '../models/auth.models';

const STORAGE_KEYS = {
  TOKEN: 'voleiplay_auth_token_v1',
  USER: 'voleiplay_auth_user_v1'
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // URLs de API (prioriza o microserviço direto na 3007 ou o gateway na 3000)
  private readonly authApiUrl = 'http://localhost:3007/api/auth';
  private readonly gatewayAuthUrl = 'http://localhost:3000/services/auth';

  // Signals
  readonly currentUser = signal<User | null>(this.loadUser());
  readonly token = signal<string | null>(this.loadToken());
  readonly isLoading = signal<boolean>(false);
  readonly authError = signal<string | null>(null);

  // Computed Signals
  readonly isAuthenticated = computed<boolean>(() => !!this.currentUser());
  readonly isAdmin = computed<boolean>(() => this.currentUser()?.role === 'ADMIN');
  readonly isAthlete = computed<boolean>(() => this.currentUser()?.role === 'ATHLETE');
  readonly userRole = computed<string>(() => this.currentUser()?.role || 'GUEST');

  constructor() {
    // Valida sessão ao carregar a aplicação caso haja token armazenado
    if (this.token()) {
      this.validateCurrentSession();
    }
  }

  /**
   * Realiza login no microsserviço de autenticação
   */
  async login(credentials: LoginCredentials): Promise<boolean> {
    this.isLoading.set(true);
    this.authError.set(null);

    try {
      const response = await this.fetchWithFallback('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data: AuthResponse = await response.json();

      if (!response.ok || !data.success || !data.token || !data.user) {
        throw new Error(data.error || 'Credenciais inválidas.');
      }

      // Persiste sessão
      this.token.set(data.token);
      this.currentUser.set(data.user);
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));

      return true;
    } catch (err: any) {
      console.error('[AuthService] Erro ao autenticar:', err.message);
      this.authError.set(err.message || 'Falha ao conectar com o serviço de autenticação.');
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Cadastra novo usuário no microsserviço de autenticação
   */
  async register(data: RegisterCredentials): Promise<boolean> {
    this.isLoading.set(true);
    this.authError.set(null);

    try {
      const response = await this.fetchWithFallback('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const resData: AuthResponse = await response.json();

      if (!response.ok || !resData.success || !resData.token || !resData.user) {
        throw new Error(resData.error || 'Falha ao registrar novo usuário.');
      }

      this.token.set(resData.token);
      this.currentUser.set(resData.user);
      localStorage.setItem(STORAGE_KEYS.TOKEN, resData.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(resData.user));

      return true;
    } catch (err: any) {
      console.error('[AuthService] Erro ao registrar:', err.message);
      this.authError.set(err.message || 'Falha ao cadastrar usuário.');
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Encerra a sessão
   */
  async logout(): Promise<void> {
    const currentToken = this.token();
    if (currentToken) {
      try {
        await this.fetchWithFallback('/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentToken}`
          }
        });
      } catch {
        // ignora erros de logout remoto
      }
    }

    this.token.set(null);
    this.currentUser.set(null);
    this.authError.set(null);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  /**
   * Valida sessão remota através de GET /api/auth/me
   */
  private async validateCurrentSession(): Promise<void> {
    const currentToken = this.token();
    if (!currentToken) return;

    try {
      const response = await this.fetchWithFallback('/me', {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });

      if (!response.ok) {
        // Token expirado ou inválido
        this.logout();
      } else {
        const data = await response.json();
        if (data.user) {
          this.currentUser.set(data.user);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
        }
      }
    } catch {
      // Se a API estiver offline, mantém a sessão offline se houver dados locais
    }
  }

  /**
   * Tenta primeiro a chamada direta na porta 3007; caso falhe, tenta o gateway na 3000
   */
  private async fetchWithFallback(endpoint: string, options: RequestInit = {}): Promise<Response> {
    try {
      return await fetch(`${this.authApiUrl}${endpoint}`, options);
    } catch (directErr) {
      // Fallback para o Gateway
      return await fetch(`${this.gatewayAuthUrl}${endpoint}`, options);
    }
  }

  private loadToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  private loadUser(): User | null {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
}
