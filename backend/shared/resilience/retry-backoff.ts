import { Observability } from '../observability/apm.js';

export interface RetryOptions {
  maxAttempts?: number;          // Total de tentativas (padrão: 3)
  initialDelayMs?: number;       // Delay da primeira espera em ms (padrão: 300ms)
  backoffFactor?: number;        // Multiplicador exponencial (padrão: 2)
  maxDelayMs?: number;           // Tempo máximo de espera por tentativa (padrão: 3000ms)
  jitter?: boolean;              // Adiciona ruído aleatório (jitter) para mitigar thundering herd (padrão: true)
  operationName?: string;        // Nome da operação para logs e tracing
  retryIf?: (error: any) => boolean; // Predicado para decidir se o erro é passível de retry
}

/**
 * Utilitário para aguardar N milissegundos
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calcula o atraso exponencial com jitter para uma determinada tentativa
 */
export function calculateBackoff(
  attempt: number,
  initialDelayMs: number,
  backoffFactor: number,
  maxDelayMs: number,
  jitter: boolean
): number {
  // attempt é 1-indexado (tentativa 1 é a primeira falha)
  const exponentialDelay = initialDelayMs * Math.pow(backoffFactor, attempt - 1);
  const cappedDelay = Math.min(exponentialDelay, maxDelayMs);

  if (!jitter) {
    return Math.round(cappedDelay);
  }

  // Jitter aleatório entre 80% e 120% do tempo calculado
  const jitterFactor = 0.8 + Math.random() * 0.4;
  return Math.round(cappedDelay * jitterFactor);
}

/**
 * Executa uma operação assíncrona com tentativas de Retry e Backoff Exponencial
 */
export async function withRetry<T>(
  action: (attempt: number) => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const initialDelayMs = options.initialDelayMs ?? 300;
  const backoffFactor = options.backoffFactor ?? 2;
  const maxDelayMs = options.maxDelayMs ?? 3000;
  const jitter = options.jitter ?? true;
  const opName = options.operationName || 'Operation';

  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const span = Observability.startSpan(
      `${opName} (Attempt ${attempt}/${maxAttempts})`,
      'resilience',
      'retry',
      `attempt_${attempt}`
    );

    try {
      if (attempt > 1) {
        console.log(`\x1b[36m🔄 [Retry: ${opName}] Executando tentativa ${attempt}/${maxAttempts}...\x1b[0m`);
      }

      const result = await action(attempt);
      span?.end();

      if (attempt > 1) {
        console.log(`\x1b[32m✔ [Retry: ${opName}] Sucesso obtido na tentativa ${attempt}!\x1b[0m`);
      }

      return result;
    } catch (error: any) {
      span?.end();
      lastError = error;

      // Se o erro for de circuito aberto (Fast Fail), não faz sentido dar retry
      if (error.name === 'CircuitBreakerOpenError') {
        console.log(`\x1b[31m⛔ [Retry: ${opName}] Circuito está aberto. Abortando retries preventivamente.\x1b[0m`);
        throw error;
      }

      // Se um predicado customizado disser que não devemos tentar novamente
      if (options.retryIf && !options.retryIf(error)) {
        console.log(`\x1b[31m⛔ [Retry: ${opName}] Erro não-passível de retry: ${error.message}\x1b[0m`);
        throw error;
      }

      // Se atingiu o limite de tentativas
      if (attempt >= maxAttempts) {
        console.error(`\x1b[31m✖ [Retry: ${opName}] Todas as ${maxAttempts} tentativas falharam!\x1b[0m Último erro: ${error.message}`);
        break;
      }

      // Calcula o tempo de espera com backoff exponencial
      const delayMs = calculateBackoff(attempt, initialDelayMs, backoffFactor, maxDelayMs, jitter);
      console.warn(
        `\x1b[33m⚠️ [Retry: ${opName}] Tentativa ${attempt}/${maxAttempts} falhou: "${error.message}". ` +
        `Aguardando ${delayMs}ms (Backoff Exponencial) antes da próxima tentativa...\x1b[0m`
      );

      await sleep(delayMs);
    }
  }

  throw lastError;
}
