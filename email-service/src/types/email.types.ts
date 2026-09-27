export type EmailType = 
  | 'PRIZE_NOTIFICATION'
  | 'PRIZE_CANCELLATION'
  | 'TOURNAMENT_ALERT'
  | 'SYSTEM_ALERT';

export interface EmailMessage {
  id: string;
  to: string;
  recipientName: string;
  subject: string;
  body: string;
  type: EmailType;
  status: 'SENT' | 'FAILED';
  sentAt: string;
  metadata?: Record<string, any>;
}

export interface SendEmailDto {
  to: string;
  recipientName: string;
  subject: string;
  body: string;
  type?: EmailType;
  metadata?: Record<string, any>;
  simulateFailure?: boolean;
}

export interface SendBatchEmailsDto {
  emails: SendEmailDto[];
  simulateFailure?: boolean;
  failAtIndex?: number;
}

export interface CompensateEmailRecipient {
  to: string;
  recipientName: string;
  amountToRefund?: number;
}

export interface CompensateEmailDto {
  originalBatchId: string;
  reason: string;
  recipients: CompensateEmailRecipient[];
}

export interface EmailStats {
  totalSent: number;
  totalFailed: number;
  lastSentAt?: string;
  byType: Record<string, number>;
}
