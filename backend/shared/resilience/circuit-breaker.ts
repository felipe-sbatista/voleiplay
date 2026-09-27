export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  failureThreshold?: number;     // Número de falhas consecutivas para abrir o circuito (padrão: 3)
  resetTimeoutMs?: number;       // Tempo que o circuito permanece OPEN antes de ir para HALF_OPEN (padrão: 5000ms)
  successThreshold?: number;     // Número de sucessos em HALF_OPEN para fechar o circuito (padrão: 2)
  name?: string;                 // Nome do circuito para fins de log e métricas
}

export interface CircuitBreakerStats {
  name: string;
  state: CircuitState;
  failureCount: number;
  successCount: number;
  totalCalls: number;
  totalFailures: number;
  totalShortCircuited: number;
  lastFailureTime?: string;
  lastStateChange: string;
  nextAttemptAllowedAt?: string;
}

export class CircuitBreakerOpenError extends Error {
  constructor(public circuitName: string, public retryAfterMs: number) {
    super(`[CircuitBreaker: ${circuitName}] Circuito está ABERTO (OPEN). Requisição rejeitada preventivamente (Fast Fail). Tente novamente em ${Math.ceil(retryAfterMs / 1000)}s.`);
    this.name = 'CircuitBreakerOpenError';
  }
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private totalCalls = 0;
  private totalFailures = 0;
  private totalShortCircuited = 0;
  private lastFailureTime?: Date;
  private lastStateChange: Date = new Date();
  private nextAttemptAllowedAt?: Date;

  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;
  private readonly successThreshold: number;
  private readonly name: string;

  constructor(options: CircuitBreakerOptions = {}) {
    this.name = options.name || 'DefaultCircuit';
    this.failureThreshold = options.failureThreshold || 3;
    this.resetTimeoutMs = options.resetTimeoutMs || 5000;
    this.successThreshold = options.successThreshold || 2;
  }

  /**
   * Executa uma função protegida pelo Circuit Breaker
   */
  async execute<T>(action: () => Promise<T>): Promise<T> {
    this.totalCalls++;

    // Verifica transição automática de OPEN para HALF_OPEN com base no tempo
    this.checkStateTransition();

    if (this.state === 'OPEN') {
      this.totalShortCircuited++;
      const remainingMs = Math.max(0, (this.nextAttemptAllowedAt?.getTime() || 0) - Date.now());
      console.log(`\x1b[31m⚡ [CircuitBreaker: ${this.name}] FAST FAIL! Circuito ABERTO. Bloqueando chamada sem bater na rede (Restam ${remainingMs}ms).\x1b[0m`);
      throw new CircuitBreakerOpenError(this.name, remainingMs);
    }

    try {
      const result = await action();
      this.onSuccess();
      return result;
    } catch (error: any) {
      this.onFailure(error);
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      console.log(`\x1b[33m⚡ [CircuitBreaker: ${this.name}] Sucesso em HALF_OPEN (${this.successCount}/${this.successThreshold})...\x1b[0m`);
      if (this.successCount >= this.successThreshold) {
        this.transitionTo('CLOSED');
        this.failureCount = 0;
        this.successCount = 0;
        console.log(`\x1b[32m⚡ [CircuitBreaker: ${this.name}] ✅ Circuito FECHADO com sucesso! Serviço restabelecido.\x1b[0m`);
      }
    } else if (this.state === 'CLOSED') {
      // Zera contador de falhas após um sucesso
      this.failureCount = 0;
    }
  }

  private onFailure(error: any): void {
    this.totalFailures++;
    this.lastFailureTime = new Date();

    if (this.state === 'HALF_OPEN') {
      console.log(`\x1b[31m⚡ [CircuitBreaker: ${this.name}] ❌ Falha em teste experimental (HALF_OPEN)! Reabrindo circuito imediatamente.\x1b[0m`);
      this.transitionTo('OPEN');
    } else if (this.state === 'CLOSED') {
      this.failureCount++;
      console.log(`\x1b[33m⚡ [CircuitBreaker: ${this.name}] Falha detectada (${this.failureCount}/${this.failureThreshold}): ${error.message}\x1b[0m`);
      if (this.failureCount >= this.failureThreshold) {
        this.transitionTo('OPEN');
        console.log(`\x1b[31m⚡ [CircuitBreaker: ${this.name}] 🚨 Limiar de falhas atingido! Circuito ABERTO por ${this.resetTimeoutMs / 1000}s.\x1b[0m`);
      }
    }
  }

  private checkStateTransition(): void {
    if (this.state === 'OPEN' && this.nextAttemptAllowedAt && Date.now() >= this.nextAttemptAllowedAt.getTime()) {
      this.transitionTo('HALF_OPEN');
      this.successCount = 0;
      console.log(`\x1b[33m⚡ [CircuitBreaker: ${this.name}] ⏳ Timeout expirado. Transicionando para HALF_OPEN (permitindo chamadas de sondagem)...\x1b[0m`);
    }
  }

  private transitionTo(newState: CircuitState): void {
    this.state = newState;
    this.lastStateChange = new Date();

    if (newState === 'OPEN') {
      this.nextAttemptAllowedAt = new Date(Date.now() + this.resetTimeoutMs);
    } else {
      this.nextAttemptAllowedAt = undefined;
    }
  }

  getState(): CircuitState {
    this.checkStateTransition();
    return this.state;
  }

  getStats(): CircuitBreakerStats {
    this.checkStateTransition();
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      totalCalls: this.totalCalls,
      totalFailures: this.totalFailures,
      totalShortCircuited: this.totalShortCircuited,
      lastFailureTime: this.lastFailureTime?.toISOString(),
      lastStateChange: this.lastStateChange.toISOString(),
      nextAttemptAllowedAt: this.nextAttemptAllowedAt?.toISOString()
    };
  }

  reset(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = undefined;
    this.nextAttemptAllowedAt = undefined;
    this.lastStateChange = new Date();
    console.log(`\x1b[36m⚡ [CircuitBreaker: ${this.name}] Reset manual executado. Estado resetado para CLOSED.\x1b[0m`);
  }
}
