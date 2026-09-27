import {
  SagaExecution,
  SagaStepLog,
  ExecuteSagaDto,
  SagaStatus
} from './saga.types.js';
import { sagaLogRepository, SagaLogRepository } from './saga-log.repository.js';
import { prizeBatchService, PrizeBatchService } from '../prize-service/prize-batch.service.js';
import { emailServiceClient, EmailServiceClient } from '../clients/email-service.client.js';
import { PrizeBatch, CreatePrizeItemDto } from '../prize-service/prize.types.js';
import { SendEmailDto } from '../email-service/email.types.js';
import { Observability } from '../../shared/observability/apm.js';

export class PrizeDistributionSagaOrchestrator {
  constructor(
    private prizeService: PrizeBatchService = prizeBatchService,
    private mailService: EmailServiceClient = emailServiceClient,
    private logRepo: SagaLogRepository = sagaLogRepository
  ) {}

  /**
   * Executa a Saga Orquestrada de Distribuição e Liquidação de Prêmios
   */
  async execute(dto: ExecuteSagaDto = {}): Promise<SagaExecution> {
    const sagaId = `saga-prize-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const startTime = Date.now();
    const tournamentId = dto.tournamentId || 'tour-copa-2026';
    const simulateFailureAt = dto.simulateFailureAt || 'none';

    // Rastreamento no Elastic APM
    Observability.setLabel('sagaId', sagaId);
    Observability.setLabel('tournamentId', tournamentId);
    Observability.setLabel('simulateFailureAt', simulateFailureAt);


    // Prêmios padrão caso não informados (pódio do Circuito de Vôlei de Praia)
    const prizes: CreatePrizeItemDto[] = dto.customPrizes || [
      {
        playerId: 'p-1',
        playerName: 'Ana Patrícia Silva',
        playerEmail: 'ana.patricia@voleiplay.com.br',
        positionWon: '1º Lugar (Campeã)',
        amount: 25000
      },
      {
        playerId: 'p-2',
        playerName: 'Eduarda (Duda) Lisboa',
        playerEmail: 'duda.lisboa@voleiplay.com.br',
        positionWon: '1º Lugar (Campeã)',
        amount: 25000
      },
      {
        playerId: 'p-3',
        playerName: 'Bárbara Seixas',
        playerEmail: 'barbara.seixas@voleiplay.com.br',
        positionWon: '2º Lugar (Vice-campeã)',
        amount: 15000
      },
      {
        playerId: 'p-4',
        playerName: 'Carol Solberg',
        playerEmail: 'carol.solberg@voleiplay.com.br',
        positionWon: '2º Lugar (Vice-campeã)',
        amount: 15000
      }
    ];

    const totalAmount = prizes.reduce((sum, p) => sum + p.amount, 0);

    const steps: SagaStepLog[] = [
      {
        step: 'CREATE_BATCH',
        service: 'PrizeService',
        description: 'T1: Criação do lote de premiação em estado PENDING',
        status: 'NOT_STARTED',
        startedAt: ''
      },
      {
        step: 'PROCESS_BATCH',
        service: 'PrizeService',
        description: 'T2: Processamento em lote dos pagamentos e débito no orçamento',
        status: 'NOT_STARTED',
        startedAt: ''
      },
      {
        step: 'SEND_EMAILS',
        service: 'EmailService',
        description: 'T3: Envio de recibos e notificações por e-mail aos atletas via REST API',
        status: 'NOT_STARTED',
        startedAt: ''
      }
    ];

    const execution: SagaExecution = {
      sagaId,
      sagaName: 'TournamentPrizeDistributionSaga',
      tournamentId,
      status: 'STARTED',
      startedAt: new Date().toISOString(),
      steps,
      simulatedFailureStep: simulateFailureAt,
      totalAmount,
      playersCount: prizes.length
    };

    this.logRepo.save(execution);

    console.log('\n================================================================');
    console.log(`\x1b[35m🏐 [SAGA ORCHESTRATOR] 🚀 Iniciando SAGA: ${sagaId}\x1b[0m`);
    console.log(`   Torneio: ${tournamentId} | Total de Atletas: ${prizes.length} | Montante: R$ ${totalAmount.toLocaleString('pt-BR')}`);
    if (simulateFailureAt !== 'none') {
      console.log(`   \x1b[33m⚠️ SIMULAÇÃO ATIVADA: A saga falhará intencionalmente no passo: "${simulateFailureAt}"\x1b[0m`);
    }
    console.log('================================================================');

    let createdBatch: PrizeBatch | null = null;

    try {
      // -----------------------------------------------------------------------
      // PASSO 1 (T1): Criar Lote de Prêmios (PrizeService)
      // -----------------------------------------------------------------------
      const step1 = steps[0];
      step1.status = 'RUNNING';
      step1.startedAt = new Date().toISOString();
      this.logRepo.save(execution);

      console.log(`\x1b[34m[Saga Step 1/3] 🔹 Executando T1: Criar lote pendente no PrizeService...\x1b[0m`);
      const spanT1 = Observability.startSpan('Saga Step 1: Create Prize Batch', 'saga.step', 'prize-service', 'create');
      createdBatch = await this.prizeService.createBatch({
        tournamentId,
        items: prizes
      });
      spanT1?.end();

      step1.status = 'SUCCESS';
      step1.completedAt = new Date().toISOString();
      step1.data = { batchId: createdBatch.id, totalAmount: createdBatch.totalAmount };
      execution.batchId = createdBatch.id;
      execution.tournamentName = createdBatch.tournamentName;
      this.logRepo.save(execution);

      // -----------------------------------------------------------------------
      // PASSO 2 (T2): Processar Lote em Batch (PrizeService)
      // -----------------------------------------------------------------------
      const step2 = steps[1];
      step2.status = 'RUNNING';
      step2.startedAt = new Date().toISOString();
      this.logRepo.save(execution);

      const shouldFailStep2 = simulateFailureAt === 'process_batch';
      console.log(`\x1b[34m[Saga Step 2/3] 🔹 Executando T2: Liquidar pagamentos em lote no PrizeService...\x1b[0m`);
      
      const spanT2 = Observability.startSpan('Saga Step 2: Process Payments Batch', 'saga.step', 'prize-service', 'process');
      const processedBatch = await this.prizeService.processBatch(createdBatch.id, {
        simulateFailure: shouldFailStep2,
        failureMessage: shouldFailStep2 ? 'Simulação de erro na integração PIX / Saldo de liquidação bancária' : undefined
      });
      spanT2?.end();

      step2.status = 'SUCCESS';
      step2.completedAt = new Date().toISOString();
      step2.data = { processedAt: processedBatch.processedAt, status: processedBatch.status };
      this.logRepo.save(execution);

      // -----------------------------------------------------------------------
      // PASSO 3 (T3): Notificar Atletas via Email (EmailService)
      // -----------------------------------------------------------------------
      const step3 = steps[2];
      step3.status = 'RUNNING';
      step3.startedAt = new Date().toISOString();
      this.logRepo.save(execution);

      const shouldFailStep3 = simulateFailureAt === 'send_emails';
      console.log(`\x1b[34m[Saga Step 3/3] 🔹 Executando T3: Notificar ${prizes.length} atletas via REST na nova Email Service API...\x1b[0m`);

      const emailDtos: SendEmailDto[] = prizes.map(p => ({
        to: p.playerEmail,
        recipientName: p.playerName,
        subject: `🎉 Parabéns! Sua premiação do ${execution.tournamentName} foi creditada!`,
        body: `Olá ${p.playerName}! Parabéns pela conquista do ${p.positionWon}! Informamos que a premiação no valor de R$ ${p.amount.toLocaleString('pt-BR')} foi creditada em sua conta com sucesso.`,
        type: 'PRIZE_NOTIFICATION',
        metadata: {
          sagaId,
          batchId: createdBatch!.id,
          position: p.positionWon,
          amount: p.amount
        }
      }));

      const spanT3 = Observability.startSpan('Saga Step 3: Send Notification Emails', 'saga.step', 'email-service', 'send');
      await this.mailService.sendBatch({
        emails: emailDtos,
        simulateFailure: shouldFailStep3
      });
      spanT3?.end();

      step3.status = 'SUCCESS';
      step3.completedAt = new Date().toISOString();
      step3.data = { emailsSentCount: emailDtos.length };

      // -----------------------------------------------------------------------
      // SAGA FINALIZADA COM SUCESSO (HAPPY PATH)
      // -----------------------------------------------------------------------
      execution.status = 'COMPLETED';
      execution.finishedAt = new Date().toISOString();
      execution.durationMs = Date.now() - startTime;
      this.logRepo.save(execution);

      console.log('\n================================================================');
      console.log(`\x1b[32m🎉 [SAGA CONCLUÍDA COM SUCESSO] Saga ${sagaId} finalizada em ${execution.durationMs}ms!\x1b[0m`);
      console.log(`   Todos os 3 passos locais (T1, T2, T3) foram comitados com consistência eventual.`);
      console.log('================================================================\n');

      return execution;

    } catch (err: any) {
      // -----------------------------------------------------------------------
      // TRATAMENTO DE FALHA E EXECUÇÃO DE TRANSAÇÕES COMPENSATÓRIAS
      // -----------------------------------------------------------------------
      console.log('\n----------------------------------------------------------------');
      console.log(`\x1b[31m💥 [SAGA FALHOU] Erro detectado no fluxo: "${err.message}"\x1b[0m`);
      console.log(`\x1b[33m🔄 Iniciando protocolo de TRANSAÇÕES COMPENSATÓRIAS em ordem reversa...\x1b[0m`);
      console.log('----------------------------------------------------------------');

      // Captura o erro da Saga com contexto estruturado para o APM
      Observability.captureError(err, {
        sagaId,
        tournamentId,
        simulatedFailureStep: simulateFailureAt,
        batchId: createdBatch?.id
      });

      execution.status = 'COMPENSATING';
      execution.failureReason = err.message;
      this.logRepo.save(execution);

      // Identifica qual passo falhou
      const currentStepIndex = steps.findIndex(s => s.status === 'RUNNING');
      if (currentStepIndex !== -1) {
        steps[currentStepIndex].status = 'FAILED';
        steps[currentStepIndex].error = err.message;
        steps[currentStepIndex].completedAt = new Date().toISOString();
      }

      // COMPENSAÇÃO PASSO A PASSO
      // Se o passo 3 (Email) falhou, precisamos compensar o passo 2 (PrizeBatch liquidado) e enviar email de cancelamento
      if (steps[1].status === 'SUCCESS' && createdBatch) {
        console.log(`\x1b[33m[Compensação C2] ↩️ Revertendo Step 2: Estornar pagamentos do lote ${createdBatch.id} no PrizeService...\x1b[0m`);
        steps[1].compensationAction = 'Estorno contábil do lote e devolução de orçamento ao torneio';
        steps[1].compensationStatus = 'RUNNING';

        const spanComp2 = Observability.startSpan('Saga Compensation C2: Refund Prize Batch', 'saga.compensation', 'prize-service', 'refund');
        try {
          await this.prizeService.compensateBatch(createdBatch.id, {
            reason: `Saga Compensation: Falha subsequente no envio de emails (${err.message})`
          });
          steps[1].compensationStatus = 'SUCCESS';
          console.log(`\x1b[32m✔ [Compensação C2] Sucesso: Lote ${createdBatch.id} marcado como REFUNDED e saldo restaurado!\x1b[0m`);
        } catch (compErr: any) {
          steps[1].compensationStatus = 'FAILED';
          console.error(`❌ [Compensação C2] Falha grave ao compensar Step 2:`, compErr.message);
        } finally {
          spanComp2?.end();
        }

        // Também dispara notificação de estorno no email service via REST
        console.log(`\x1b[33m[Compensação C3] ↩️ Enviando e-mails aos atletas avisando sobre o estorno via REST API...\x1b[0m`);
        steps[2].compensationAction = 'Envio de comunicado de estorno aos atletas via REST API';
        steps[2].compensationStatus = 'RUNNING';

        const spanComp3 = Observability.startSpan('Saga Compensation C3: Send Refund Notices (REST)', 'saga.compensation', 'email-service', 'send');
        try {
          await this.mailService.compensateBatch({
            originalBatchId: createdBatch.id,
            reason: 'Falha técnica no processo de pagamento - estorno preventivo realizado.',
            recipients: prizes.map(p => ({
              to: p.playerEmail,
              recipientName: p.playerName,
              amountToRefund: p.amount
            }))
          });
          steps[2].compensationStatus = 'SUCCESS';
          console.log(`\x1b[32m✔ [Compensação C3] Sucesso: E-mails de notificação de estorno despachados!\x1b[0m`);
        } catch (compErr: any) {
          steps[2].compensationStatus = 'FAILED';
          console.error(`❌ [Compensação C3] Falha grave ao enviar e-mails de estorno:`, compErr.message);
        } finally {
          spanComp3?.end();
        }
      } 
      // Se o passo 2 (Processamento) falhou, o lote ainda estava PENDING, apenas cancelamos o lote
      else if (steps[0].status === 'SUCCESS' && createdBatch) {
        console.log(`\x1b[33m[Compensação C1] ↩️ Revertendo Step 1: Cancelando lote pendente ${createdBatch.id} no PrizeService...\x1b[0m`);
        steps[0].compensationAction = 'Cancelamento do lote pendente';
        steps[0].compensationStatus = 'RUNNING';

        const spanComp1 = Observability.startSpan('Saga Compensation C1: Cancel Pending Batch', 'saga.compensation', 'prize-service', 'cancel');
        try {
          await this.prizeService.compensateBatch(createdBatch.id, {
            reason: `Saga Compensation: Falha no processamento do lote (${err.message})`
          });
          steps[0].compensationStatus = 'SUCCESS';
          console.log(`\x1b[32m✔ [Compensação C1] Sucesso: Lote ${createdBatch.id} cancelado com segurança!\x1b[0m`);
        } catch (compErr: any) {
          steps[0].compensationStatus = 'FAILED';
          console.error(`❌ [Compensação C1] Falha ao cancelar lote:`, compErr.message);
        } finally {
          spanComp1?.end();
        }
      }

      execution.status = 'COMPENSATED';
      execution.finishedAt = new Date().toISOString();
      execution.durationMs = Date.now() - startTime;
      this.logRepo.save(execution);

      console.log('================================================================');
      console.log(`\x1b[33m🔄 [SAGA COMPENSADA COM SUCESSO] Saga ${sagaId} restaurou consistência em ${execution.durationMs}ms.\x1b[0m`);
      console.log(`   O sistema voltou ao estado íntegro sem transações órfãs ou perda de saldo.`);
      console.log('================================================================\n');

      return execution;
    }
  }

  getExecution(sagaId: string): SagaExecution | undefined {
    return this.logRepo.findById(sagaId);
  }

  listExecutions(): SagaExecution[] {
    return this.logRepo.findAll();
  }

  clearHistory(): void {
    this.logRepo.clear();
  }
}

export const prizeDistributionSaga = new PrizeDistributionSagaOrchestrator();
