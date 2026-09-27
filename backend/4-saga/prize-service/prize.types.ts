export type BatchStatus = 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'REFUNDED' | 'FAILED';

export interface PrizeBatchItem {
  id: string;
  playerId: string;
  playerName: string;
  playerEmail: string;
  positionWon: string; // Ex: '1º Lugar (Campeão)', '2º Lugar (Vice-campeão)', '3º Lugar (Bronze)'
  amount: number;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paidAt?: string;
  transactionRef?: string;
}

export interface PrizeBatch {
  id: string;
  tournamentId: string;
  tournamentName: string;
  status: BatchStatus;
  totalAmount: number;
  itemsCount: number;
  items: PrizeBatchItem[];
  createdAt: string;
  processedAt?: string;
  compensatedAt?: string;
  compensationReason?: string;
  logs: string[];
}

export interface TournamentBudget {
  id: string;
  name: string;
  season: string;
  totalBudget: number;
  allocatedBudget: number;
  availableBudget: number;
  currency: string;
}

export interface CreatePrizeItemDto {
  playerId: string;
  playerName: string;
  playerEmail: string;
  positionWon: string;
  amount: number;
}

export interface CreateBatchDto {
  tournamentId: string;
  items: CreatePrizeItemDto[];
}

export interface ProcessBatchDto {
  simulateFailure?: boolean;
  failAtPlayerIndex?: number;
  failureMessage?: string;
}

export interface CompensateBatchDto {
  reason: string;
}
