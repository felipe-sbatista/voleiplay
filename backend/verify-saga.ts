import { prizeDistributionSaga } from './4-saga/saga-orchestrator/prize-distribution.saga.js';
import { prizeBatchService } from './4-saga/prize-service/prize-batch.service.js';
import { emailServiceClient } from './4-saga/clients/email-service.client.js';

async function runTests() {
  console.log('🧪 Iniciando testes de validação do Padrão Saga com REST Email Service...\n');

  // Verifica se o Email Service REST está ativo
  const health = await emailServiceClient.checkHealth();
  if (!health.online) {
    console.error(`\x1b[31m❌ A nova Email Service API não está rodando em ${health.url}!\x1b[0m`);
    console.error('Por favor, inicie a API de e-mail executando:');
    console.error('  npm run email:dev (ou npm --prefix email-service run dev)\n');
    process.exit(1);
  }
  console.log(`\x1b[32m✔ Email Service API online em ${health.url}!\x1b[0m\n`);

  // Teste 1: Happy Path
  console.log('--- TESTE 1: Cenário Feliz (Happy Path via REST) ---');
  await emailServiceClient.clear();
  prizeBatchService.reset();

  const exec1 = await prizeDistributionSaga.execute({ simulateFailureAt: 'none' });
  if (exec1.status !== 'COMPLETED') {
    throw new Error(`Teste 1 Falhou: Esperado COMPLETED, obtido ${exec1.status}`);
  }
  const batch1 = prizeBatchService.getBatch(exec1.batchId!);
  if (batch1?.status !== 'PROCESSED') {
    throw new Error(`Teste 1 Falhou: Lote deveria estar PROCESSED, mas está ${batch1?.status}`);
  }
  const emails1 = await emailServiceClient.listSent();
  if (emails1.length !== 4) {
    throw new Error(`Teste 1 Falhou: Esperado 4 e-mails enviados via REST, obtido ${emails1.length}`);
  }
  console.log('✅ TESTE 1 PASSOU!\n');

  // Teste 2: Falha no Batch
  console.log('--- TESTE 2: Falha no Processamento Batch (Compensação T1) ---');
  await emailServiceClient.clear();
  prizeBatchService.reset();

  const exec2 = await prizeDistributionSaga.execute({ simulateFailureAt: 'process_batch' });
  if (exec2.status !== 'COMPENSATED') {
    throw new Error(`Teste 2 Falhou: Esperado COMPENSATED, obtido ${exec2.status}`);
  }
  const batch2 = prizeBatchService.getBatch(exec2.batchId!);
  if (batch2?.status !== 'REFUNDED') {
    throw new Error(`Teste 2 Falhou: Lote deveria estar REFUNDED, mas está ${batch2?.status}`);
  }
  console.log('✅ TESTE 2 PASSOU!\n');

  // Teste 3: Falha no Envio de E-mails
  console.log('--- TESTE 3: Falha no Envio de E-mails (Compensação Completa C2 + C3 via REST) ---');
  await emailServiceClient.clear();
  prizeBatchService.reset();
  const initialTournament = prizeBatchService.listTournaments()[0];
  const initialAvailable = initialTournament.availableBudget;

  const exec3 = await prizeDistributionSaga.execute({ simulateFailureAt: 'send_emails' });
  if (exec3.status !== 'COMPENSATED') {
    throw new Error(`Teste 3 Falhou: Esperado COMPENSATED, obtido ${exec3.status}`);
  }
  const batch3 = prizeBatchService.getBatch(exec3.batchId!);
  if (batch3?.status !== 'REFUNDED') {
    throw new Error(`Teste 3 Falhou: Lote deveria estar REFUNDED, mas está ${batch3?.status}`);
  }
  const restoredTournament = prizeBatchService.listTournaments()[0];
  if (restoredTournament.availableBudget !== initialAvailable) {
    throw new Error(
      `Teste 3 Falhou: Orçamento não foi estornado corretamente. Esperado: ${initialAvailable}, Obtido: ${restoredTournament.availableBudget}`
    );
  }
  const allEmails = await emailServiceClient.listSent();
  const compensationEmails = allEmails.filter(e => e.type === 'PRIZE_CANCELLATION');
  if (compensationEmails.length !== 4) {
    throw new Error(`Teste 3 Falhou: Esperado 4 e-mails de estorno via REST, obtido ${compensationEmails.length}`);
  }
  console.log('✅ TESTE 3 PASSOU!\n');

  console.log('🏆 TODOS OS TESTES DA SAGA VIA REST PASSARAM COM SUCESSO!');
}

runTests().catch(err => {
  console.error('❌ Erro na validação da Saga:', err);
  process.exit(1);
});
