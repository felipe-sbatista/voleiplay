import { describe, it, expect, vi } from 'vitest';
import { CircuitBreaker, CircuitBreakerOpenError } from '../../backend/shared/resilience/circuit-breaker.js';
import { withRetry, calculateBackoff } from '../../backend/shared/resilience/retry-backoff.js';

describe('Resilience - Circuit Breaker Unit Tests', () => {
  it('deve inicializar no estado CLOSED com contadores zerados', () => {
    const cb = new CircuitBreaker({
      name: 'TestCircuit',
      failureThreshold: 3,
      resetTimeoutMs: 1000,
      successThreshold: 2
    });

    expect(cb.getState()).toBe('CLOSED');
    const stats = cb.getStats();
    expect(stats.failureCount).toBe(0);
    expect(stats.successCount).toBe(0);
    expect(stats.totalCalls).toBe(0);
    expect(stats.totalFailures).toBe(0);
    expect(stats.totalShortCircuited).toBe(0);
  });

  it('deve executar ação com sucesso mantendo o circuito CLOSED', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 3 });
    const action = vi.fn().mockResolvedValue('OK');

    const result = await cb.execute(action);

    expect(result).toBe('OK');
    expect(action).toHaveBeenCalledTimes(1);
    expect(cb.getState()).toBe('CLOSED');
    expect(cb.getStats().totalCalls).toBe(1);
  });

  it('deve abrir o circuito (OPEN) após atingir o failureThreshold', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 1000 });
    const failingAction = vi.fn().mockRejectedValue(new Error('Falha de conexão'));

    // 1ª falha
    await expect(cb.execute(failingAction)).rejects.toThrow('Falha de conexão');
    expect(cb.getState()).toBe('CLOSED');
    expect(cb.getStats().failureCount).toBe(1);

    // 2ª falha
    await expect(cb.execute(failingAction)).rejects.toThrow('Falha de conexão');
    expect(cb.getState()).toBe('CLOSED');
    expect(cb.getStats().failureCount).toBe(2);

    // 3ª falha -> atinge threshold
    await expect(cb.execute(failingAction)).rejects.toThrow('Falha de conexão');
    expect(cb.getState()).toBe('OPEN');
    expect(cb.getStats().totalFailures).toBe(3);
  });

  it('deve rejeitar chamadas imediatamente (Fast Fail) no estado OPEN sem executar a ação', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 2, resetTimeoutMs: 5000 });
    const failingAction = vi.fn().mockRejectedValue(new Error('Erro inicial'));

    await expect(cb.execute(failingAction)).rejects.toThrow();
    await expect(cb.execute(failingAction)).rejects.toThrow();
    expect(cb.getState()).toBe('OPEN');

    const actionNeverCalled = vi.fn().mockResolvedValue('Nao deve ser chamado');

    await expect(cb.execute(actionNeverCalled)).rejects.toThrow(CircuitBreakerOpenError);
    expect(actionNeverCalled).not.toHaveBeenCalled();
    expect(cb.getStats().totalShortCircuited).toBe(1);
  });

  it('deve transicionar para HALF_OPEN após expiração do resetTimeoutMs', async () => {
    vi.useFakeTimers();
    const cb = new CircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 1000, successThreshold: 2 });
    const failingAction = vi.fn().mockRejectedValue(new Error('Erro'));

    await expect(cb.execute(failingAction)).rejects.toThrow();
    expect(cb.getState()).toBe('OPEN');

    // Avança o tempo além do timeout
    vi.advanceTimersByTime(1100);

    expect(cb.getState()).toBe('HALF_OPEN');
    vi.useRealTimers();
  });

  it('deve reabrir o circuito para OPEN se falhar em HALF_OPEN', async () => {
    vi.useFakeTimers();
    const cb = new CircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 1000, successThreshold: 2 });
    
    // Abre o circuito
    await expect(cb.execute(vi.fn().mockRejectedValue(new Error('Falha 1')))).rejects.toThrow();
    expect(cb.getState()).toBe('OPEN');

    // Avança até HALF_OPEN
    vi.advanceTimersByTime(1100);
    expect(cb.getState()).toBe('HALF_OPEN');

    // Falha em HALF_OPEN
    await expect(cb.execute(vi.fn().mockRejectedValue(new Error('Falha em teste')))).rejects.toThrow();
    expect(cb.getState()).toBe('OPEN');

    vi.useRealTimers();
  });

  it('deve fechar o circuito (CLOSED) após atingir o successThreshold em HALF_OPEN', async () => {
    vi.useFakeTimers();
    const cb = new CircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 1000, successThreshold: 2 });

    // Força OPEN
    await expect(cb.execute(vi.fn().mockRejectedValue(new Error('Falha')))).rejects.toThrow();
    expect(cb.getState()).toBe('OPEN');

    // Vai para HALF_OPEN
    vi.advanceTimersByTime(1100);
    expect(cb.getState()).toBe('HALF_OPEN');

    // 1º sucesso
    const successAction = vi.fn().mockResolvedValue('Sucesso experimental');
    await cb.execute(successAction);
    expect(cb.getState()).toBe('HALF_OPEN');
    expect(cb.getStats().successCount).toBe(1);

    // 2º sucesso -> atinge threshold de recuperação
    await cb.execute(successAction);
    expect(cb.getState()).toBe('CLOSED');
    expect(cb.getStats().failureCount).toBe(0);

    vi.useRealTimers();
  });
});

describe('Resilience - Retry com Exponential Backoff Unit Tests', () => {
  it('deve calcular corretamente o backoff exponencial sem jitter', () => {
    const delay1 = calculateBackoff(1, 100, 2, 1000, false);
    const delay2 = calculateBackoff(2, 100, 2, 1000, false);
    const delay3 = calculateBackoff(3, 100, 2, 1000, false);
    const delayCapped = calculateBackoff(10, 100, 2, 1000, false);

    expect(delay1).toBe(100);   // 100 * 2^0
    expect(delay2).toBe(200);   // 100 * 2^1
    expect(delay3).toBe(400);   // 100 * 2^2
    expect(delayCapped).toBe(1000); // Teto de maxDelayMs
  });

  it('deve ter sucesso na primeira tentativa sem retries adicionais', async () => {
    const action = vi.fn().mockResolvedValue('OK_IMEDIATO');

    const result = await withRetry(action, { maxAttempts: 3, initialDelayMs: 10 });

    expect(result).toBe('OK_IMEDIATO');
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('deve retentar e obter sucesso na 2ª tentativa após falha transitória', async () => {
    let callCount = 0;
    const action = vi.fn().mockImplementation(async (attempt) => {
      callCount++;
      if (callCount === 1) {
        throw new Error('Falha transitória 503');
      }
      return 'RECUPERADO';
    });

    const result = await withRetry(action, {
      maxAttempts: 3,
      initialDelayMs: 10,
      backoffFactor: 1.5,
      jitter: false
    });

    expect(result).toBe('RECUPERADO');
    expect(action).toHaveBeenCalledTimes(2);
  });

  it('deve estourar o limite de tentativas e lançar o último erro', async () => {
    const action = vi.fn().mockRejectedValue(new Error('Falha persistente'));

    await expect(
      withRetry(action, { maxAttempts: 3, initialDelayMs: 10, jitter: false })
    ).rejects.toThrow('Falha persistente');

    expect(action).toHaveBeenCalledTimes(3);
  });

  it('não deve retentar se o erro for CircuitBreakerOpenError (Fast Fail)', async () => {
    const action = vi.fn().mockRejectedValue(new CircuitBreakerOpenError('TestCircuit', 5000));

    await expect(
      withRetry(action, { maxAttempts: 4, initialDelayMs: 10 })
    ).rejects.toThrow(CircuitBreakerOpenError);

    expect(action).toHaveBeenCalledTimes(1); // Aborta na 1ª tentativa
  });
});
