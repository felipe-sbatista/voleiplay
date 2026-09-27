import {
  PrizeBatch,
  PrizeBatchItem,
  CreateBatchDto,
  ProcessBatchDto,
  CompensateBatchDto,
  TournamentBudget
} from './prize.types.js';
import { prizeRepository, PrizeRepository } from './prize.repository.js';

export class PrizeBatchService {
  constructor(private repo: PrizeRepository = prizeRepository) {}

  /**
   * Passo 1 da Saga: Criação do lote em estado PENDING
   */
  async createBatch(dto: CreateBatchDto): Promise<PrizeBatch> {
    const tournament = this.repo.findTournamentById(dto.tournamentId);
    if (!tournament) {
      throw new Error(`[PrizeService] Torneio '${dto.tournamentId}' não encontrado.`);
    }

    if (!dto.items || dto.items.length === 0) {
      throw new Error('[PrizeService] O lote deve conter pelo menos um atleta premiado.');
    }

    const totalAmount = dto.items.reduce((sum, item) => sum + item.amount, 0);

    // Validação de regra de negócio: Orçamento do torneio
    if (totalAmount > tournament.availableBudget) {
      throw new Error(
        `[PrizeService] Orçamento insuficiente no torneio "${tournament.name}". ` +
        `Requerido: R$ ${totalAmount.toLocaleString('pt-BR')}, Disponível: R$ ${tournament.availableBudget.toLocaleString('pt-BR')}`
      );
    }

    const batchId = `batch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const items: PrizeBatchItem[] = dto.items.map((item, index) => ({
      id: `item-${batchId}-${index + 1}`,
      playerId: item.playerId,
      playerName: item.playerName,
      playerEmail: item.playerEmail,
      positionWon: item.positionWon,
      amount: item.amount,
      status: 'PENDING'
    }));

    const batch: PrizeBatch = {
      id: batchId,
      tournamentId: tournament.id,
      tournamentName: tournament.name,
      status: 'PENDING',
      totalAmount,
      itemsCount: items.length,
      items,
      createdAt: new Date().toISOString(),
      logs: [
        `[${new Date().toISOString()}] Lote criado em estado PENDING. Total: R$ ${totalAmount.toLocaleString('pt-BR')}`
      ]
    };

    this.repo.saveBatch(batch);
    console.log(`\x1b[35m[PrizeService] 📦 Lote de Premiação criado: ${batch.id}\x1b[0m | Torneio: "${tournament.name}" | Total: R$ ${totalAmount}`);
    return batch;
  }

  /**
   * Passo 2 da Saga: Processamento em lote dos pagamentos
   */
  async processBatch(batchId: string, dto: ProcessBatchDto = {}): Promise<PrizeBatch> {
    const batch = this.repo.findBatchById(batchId);
    if (!batch) {
      throw new Error(`[PrizeService] Lote '${batchId}' não encontrado.`);
    }

    if (batch.status !== 'PENDING') {
      throw new Error(`[PrizeService] Lote '${batchId}' não pode ser processado no status atual: ${batch.status}`);
    }

    const tournament = this.repo.findTournamentById(batch.tournamentId);
    if (!tournament) {
      throw new Error(`[PrizeService] Torneio '${batch.tournamentId}' não encontrado.`);
    }

    console.log(`\x1b[35m[PrizeService] ⚙️ Iniciando processamento em BATCH do lote ${batch.id} (${batch.itemsCount} itens)...\x1b[0m`);
    batch.status = 'PROCESSING';
    batch.logs.push(`[${new Date().toISOString()}] Iniciado processamento em lote dos pagamentos.`);

    // Simulação didática de falha configurada pelo orquestrador ou usuário
    if (dto.simulateFailure) {
      batch.status = 'FAILED';
      const errMsg = dto.failureMessage || 'Simulação de falha no gateway de pagamentos PIX/Bancário.';
      batch.logs.push(`[${new Date().toISOString()}] FALHA no processamento: ${errMsg}`);
      this.repo.saveBatch(batch);
      console.log(`\x1b[31m[PrizeService] ❌ Erro durante processamento em lote do lote ${batch.id}: ${errMsg}\x1b[0m`);
      throw new Error(`[PrizeService] Falha no processamento em batch: ${errMsg}`);
    }

    // Processamento de cada item do lote
    for (let i = 0; i < batch.items.length; i++) {
      const item = batch.items[i];

      if (dto.failAtPlayerIndex !== undefined && dto.failAtPlayerIndex === i) {
        batch.status = 'FAILED';
        item.status = 'FAILED';
        const errMsg = `Falha ao processar pagamento do atleta ${item.playerName} (Conta bancária/PIX rejeitada)`;
        batch.logs.push(`[${new Date().toISOString()}] FALHA no item [${i}]: ${errMsg}`);
        this.repo.saveBatch(batch);
        console.log(`\x1b[31m[PrizeService] ❌ ${errMsg}\x1b[0m`);
        throw new Error(`[PrizeService] ${errMsg}`);
      }

      item.status = 'PAID';
      item.paidAt = new Date().toISOString();
      item.transactionRef = `TX-PIX-${Date.now()}-${i + 1}`;
      console.log(`   \x1b[32m✔ Pagamento liquidado: R$ ${item.amount.toLocaleString('pt-BR')} para ${item.playerName} (${item.positionWon}) [Ref: ${item.transactionRef}]\x1b[0m`);
    }

    // Atualiza orçamento do torneio (débito contábil)
    tournament.allocatedBudget += batch.totalAmount;
    tournament.availableBudget -= batch.totalAmount;
    this.repo.updateTournament(tournament);

    batch.status = 'PROCESSED';
    batch.processedAt = new Date().toISOString();
    batch.logs.push(
      `[${new Date().toISOString()}] Lote liquidado com sucesso. Saldo restante do torneio: R$ ${tournament.availableBudget.toLocaleString('pt-BR')}`
    );

    this.repo.saveBatch(batch);
    console.log(`\x1b[32m[PrizeService] 🏁 Lote ${batch.id} 100% liquidado e processado com sucesso!\x1b[0m`);
    return batch;
  }

  /**
   * Transação Compensatória (C_2 da Saga): Estorno / Cancelamento do Lote de Prêmios
   */
  async compensateBatch(batchId: string, dto: CompensateBatchDto): Promise<PrizeBatch> {
    const batch = this.repo.findBatchById(batchId);
    if (!batch) {
      throw new Error(`[PrizeService] Lote '${batchId}' não encontrado para compensação.`);
    }

    console.log(`\x1b[33m[PrizeService] ↩️ EXECUTANDO TRANSAÇÃO COMPENSATÓRIA no lote ${batch.id}...\x1b[0m`);
    console.log(`   Status anterior: ${batch.status} | Motivo: "${dto.reason}"`);

    const tournament = this.repo.findTournamentById(batch.tournamentId);

    if (batch.status === 'PROCESSED') {
      // Se o lote já havia sido liquidado, desfaz o débito no orçamento do torneio!
      if (tournament) {
        tournament.allocatedBudget -= batch.totalAmount;
        tournament.availableBudget += batch.totalAmount;
        this.repo.updateTournament(tournament);
        console.log(`   \x1b[33m↪ Orçamento do torneio estornado: +R$ ${batch.totalAmount.toLocaleString('pt-BR')} (Disponível restaurado para R$ ${tournament.availableBudget.toLocaleString('pt-BR')})\x1b[0m`);
      }

      // Atualiza itens para REFUNDED
      for (const item of batch.items) {
        item.status = 'REFUNDED';
      }

      batch.status = 'REFUNDED';
    } else {
      // Se ainda estava PENDING ou FAILED, apenas marca como CANCELLED
      batch.status = 'REFUNDED';
    }

    batch.compensatedAt = new Date().toISOString();
    batch.compensationReason = dto.reason;
    batch.logs.push(
      `[${new Date().toISOString()}] TRANSAÇÃO COMPENSATÓRIA EXECUTADA: Lote estornado. Motivo: ${dto.reason}`
    );

    this.repo.saveBatch(batch);
    console.log(`\x1b[33m[PrizeService] 🔄 Compensação concluída: Lote ${batch.id} está no estado REFUNDED.\x1b[0m`);
    return batch;
  }

  getBatch(id: string): PrizeBatch | undefined {
    return this.repo.findBatchById(id);
  }

  listBatches(): PrizeBatch[] {
    return this.repo.findAllBatches();
  }

  listTournaments(): TournamentBudget[] {
    return this.repo.findAllTournaments();
  }

  reset(): void {
    this.repo.reset();
  }
}

export const prizeBatchService = new PrizeBatchService();
