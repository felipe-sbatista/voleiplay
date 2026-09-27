export type SagaStatus =
  | 'STARTED'
  | 'EXECUTING'
  | 'COMPENSATING'
  | 'COMPENSATED'
  | 'FAILED'
  | 'COMPLETED';

export type SagaStepName = 'CREATE_BATCH' | 'PROCESS_BATCH' | 'SEND_EMAILS';

export type StepExecutionStatus =
  | 'NOT_STARTED'
  | 'RUNNING'
  | 'SUCCESS'
  | 'FAILED'
  | 'COMPENSATED';

export interface SagaStepLog {
  step: SagaStepName;
  service: 'PrizeService' | 'EmailService';
  description: string;
  status: StepExecutionStatus;
  startedAt: string;
  completedAt?: string;
  error?: string;
  compensationAction?: string;
  compensationStatus?: 'NOT_NEEDED' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  data?: any;
}

export interface SagaExecution {
  sagaId: string;
  sagaName: string;
  tournamentId: string;
  tournamentName?: string;
  status: SagaStatus;
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
  steps: SagaStepLog[];
  failureReason?: string;
  simulatedFailureStep?: 'none' | 'process_batch' | 'send_emails';
  batchId?: string;
  totalAmount?: number;
  playersCount?: number;
}

export interface ExecuteSagaDto {
  tournamentId?: string;
  simulateFailureAt?: 'none' | 'process_batch' | 'send_emails';
  customPrizes?: Array<{
    playerId: string;
    playerName: string;
    playerEmail: string;
    positionWon: string;
    amount: number;
  }>;
}
