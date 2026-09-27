export interface EmailMessage {
  id: string;
  to: string;
  recipientName: string;
  subject: string;
  body: string;
  type: 'PRIZE_NOTIFICATION' | 'PRIZE_CANCELLATION' | 'SYSTEM_ALERT';
  status: 'SENT' | 'FAILED';
  sentAt: string;
  metadata?: Record<string, any>;
}

export interface SendEmailDto {
  to: string;
  recipientName: string;
  subject: string;
  body: string;
  type?: 'PRIZE_NOTIFICATION' | 'PRIZE_CANCELLATION' | 'SYSTEM_ALERT';
  metadata?: Record<string, any>;
  simulateFailure?: boolean;
}

export interface SendBatchEmailsDto {
  emails: SendEmailDto[];
  simulateFailure?: boolean;
  failAtIndex?: number; // Permite simular falha no i-ésimo email para fins didáticos
}

export interface CompensateEmailDto {
  originalBatchId?: string;
  reason: string;
  recipients: Array<{
    to: string;
    recipientName: string;
    amountToRefund?: number;
  }>;
}

export interface EmailStats {
  totalSent: number;
  totalFailed: number;
  byType: Record<string, number>;
}
