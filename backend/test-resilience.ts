import { CircuitBreaker } from './shared/resilience/circuit-breaker.js';
import { withRetry } from './shared/resilience/retry-backoff.js';

async function runResilienceTests() {
  console.log('🧪 ================================================================');
  console.log('🧪 TESTES DE VALIDAÇÃO: RETRY COM BACKOFF & CIRCUIT BREAKER');
  console.log('🧪 ================================================================\n');

  // ---------------------------------------------------------------------------
  // TESTE 1: Retry com Exponential Backoff (Sucesso após falhas transitórias)
  // ---------------------------------------------------------------------------
  console.log('--- TESTE 1: Retry com Backoff Exponencial (Recuperação na 3ª tentativa) ---');
  let attemptCounter = 0;
  const startRetryTime = Date.now();

  const retryResult = await withRetry(
    async (attempt) => {
      attemptCounter++;
      if (attempt < 3) {
        throw new Error(`Falha transitória na tentativa ${attempt}`);
      }
      return 'SUCESSO_RETRY';
    },
    {
      operationName: 'TesteEnvioEmail',
      maxAttempts: 3,
      initialDelayMs: 150,
      backoffFactor: 2,
      jitter: false
    }
  );

  const retryDuration = Date.now() - startRetryTime;
  console.log(`Resultado: ${retryResult} | Total tentativas: ${attemptCounter} | Duração: ${retryDuration}ms`);

  if (retryResult !== 'SUCESSO_RETRY' || attemptCounter !== 3) {
    throw new Error('Falha no Teste 1: Retry não executou as 3 tentativas esperadas!');
  }
  // Delay 1: 150ms, Delay 2: 300ms => total >= 450ms
  if (retryDuration < 400) {
    throw new Error(`Falha no Teste 1: Backoff não aplicou o tempo de espera esperado (${retryDuration}ms)!`);
  }
  console.log('✅ TESTE 1 PASSOU: Retry com Backoff Exponencial validado com sucesso!\n');

  // ---------------------------------------------------------------------------
  // TESTE 2: Circuit Breaker - Abertura após limiar de falhas
  // ---------------------------------------------------------------------------
  console.log('--- TESTE 2: Circuit Breaker (CLOSED -> OPEN após 3 falhas) ---');
  const breaker = new CircuitBreaker({
    name: 'EmailServiceTest',
    failureThreshold: 3,
    resetTimeoutMs: 800, // 800ms para teste rápido
    successThreshold: 2
  });

  if (breaker.getState() !== 'CLOSED') {
    throw new Error(`Esperado CLOSED, obtido ${breaker.getState()}`);
  }

  // Provoca 3 falhas consecutivas
  for (let i = 1; i <= 3; i++) {
    try {
      await breaker.execute(async () => {
        throw new Error(`Erro no serviço externo #${i}`);
      });
    } catch (e: any) {
      // esperado
    }
  }

  console.log('Estado após 3 falhas consecutivas:', breaker.getState());
  if (breaker.getState() !== 'OPEN') {
    throw new Error(`Falha no Teste 2: Esperado estado OPEN, mas o circuito está ${breaker.getState()}`);
  }
  console.log('✅ TESTE 2 PASSOU: Circuito abriu (OPEN) após 3 falhas consecutivas!\n');

  // ---------------------------------------------------------------------------
  // TESTE 3: Fast Fail (Rejeição imediata sem bater na rede quando OPEN)
  // ---------------------------------------------------------------------------
  console.log('--- TESTE 3: Fast Fail (Rejeição imediata quando OPEN) ---');
  let networkCallMade = false;
  let fastFailTriggered = false;

  try {
    await breaker.execute(async () => {
      networkCallMade = true;
      return 'NUNCA_DEVE_RODAR';
    });
  } catch (err: any) {
    if (err.name === 'CircuitBreakerOpenError') {
      fastFailTriggered = true;
      console.log('Erro capturado corretamente:', err.message);
    }
  }

  if (networkCallMade || !fastFailTriggered) {
    throw new Error('Falha no Teste 3: Fast Fail não bloqueou a chamada enquanto o circuito estava OPEN!');
  }
  console.log('✅ TESTE 3 PASSOU: Fast Fail operou instantaneamente protegendo a rede!\n');

  // ---------------------------------------------------------------------------
  // TESTE 4: Transição para HALF_OPEN e Recuperação para CLOSED
  // ---------------------------------------------------------------------------
  console.log('--- TESTE 4: Transição HALF_OPEN e Auto-recuperação para CLOSED ---');
  console.log('Aguardando 900ms para expiração do timeout do Circuit Breaker...');
  await new Promise(r => setTimeout(r, 900));

  console.log('Estado após timeout:', breaker.getState());
  if (breaker.getState() !== 'HALF_OPEN') {
    throw new Error(`Falha no Teste 4: Esperado HALF_OPEN após timeout, obtido ${breaker.getState()}`);
  }

  // Executa 2 sucessos de sondagem requeridos
  await breaker.execute(async () => 'sucesso_probe_1');
  console.log('Estado após 1º sucesso de teste:', breaker.getState());

  await breaker.execute(async () => 'sucesso_probe_2');
  console.log('Estado após 2º sucesso de teste:', breaker.getState());

  if (breaker.getState() !== 'CLOSED') {
    throw new Error(`Falha no Teste 4: Circuito deveria ter fechado (CLOSED), mas está ${breaker.getState()}`);
  }
  console.log('✅ TESTE 4 PASSOU: Circuito recuperou a saúde e retornou para CLOSED!\n');

  console.log('================================================================');
  console.log('🏆 TODOS OS 4 TESTES DE RESILIÊNCIA PASSARAM COM SUCESSO!');
  console.log('================================================================\n');
}

runResilienceTests().catch(err => {
  console.error('❌ Erro durante testes de resiliência:', err);
  process.exit(1);
});
