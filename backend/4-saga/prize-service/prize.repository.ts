import { PrizeBatch, TournamentBudget } from './prize.types.js';

export class PrizeRepository {
  private batches: Map<string, PrizeBatch> = new Map();
  private tournaments: Map<string, TournamentBudget> = new Map();

  constructor() {
    this.seedTournaments();
  }

  private seedTournaments(): void {
    const copacabanaOpen: TournamentBudget = {
      id: 'tour-copa-2026',
      name: 'Circuito Brasileiro de Vôlei de Praia - Etapa Copacabana',
      season: '2026',
      totalBudget: 150000,
      allocatedBudget: 0,
      availableBudget: 150000,
      currency: 'BRL'
    };

    const saquaremaGrandSlam: TournamentBudget = {
      id: 'tour-saqua-2026',
      name: 'Grand Slam de Saquarema Beach Volley',
      season: '2026',
      totalBudget: 80000,
      allocatedBudget: 0,
      availableBudget: 80000,
      currency: 'BRL'
    };

    this.tournaments.set(copacabanaOpen.id, copacabanaOpen);
    this.tournaments.set(saquaremaGrandSlam.id, saquaremaGrandSlam);
  }

  // Batches
  saveBatch(batch: PrizeBatch): PrizeBatch {
    this.batches.set(batch.id, { ...batch, items: [...batch.items], logs: [...batch.logs] });
    return batch;
  }

  findBatchById(id: string): PrizeBatch | undefined {
    const batch = this.batches.get(id);
    if (!batch) return undefined;
    return { ...batch, items: [...batch.items], logs: [...batch.logs] };
  }

  findAllBatches(): PrizeBatch[] {
    return Array.from(this.batches.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Tournaments
  findTournamentById(id: string): TournamentBudget | undefined {
    const t = this.tournaments.get(id);
    return t ? { ...t } : undefined;
  }

  findAllTournaments(): TournamentBudget[] {
    return Array.from(this.tournaments.values());
  }

  updateTournament(tournament: TournamentBudget): void {
    this.tournaments.set(tournament.id, { ...tournament });
  }

  reset(): void {
    this.batches.clear();
    this.tournaments.clear();
    this.seedTournaments();
  }
}

export const prizeRepository = new PrizeRepository();
