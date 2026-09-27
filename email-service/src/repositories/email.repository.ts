import { EmailMessage, EmailStats } from '../types/email.types.js';

export class EmailRepository {
  private sentEmails: EmailMessage[] = [];

  save(email: EmailMessage): EmailMessage {
    this.sentEmails.unshift(email);
    return email;
  }

  findAll(limit = 50): EmailMessage[] {
    return this.sentEmails.slice(0, limit);
  }

  findById(id: string): EmailMessage | undefined {
    return this.sentEmails.find(e => e.id === id);
  }

  getStats(): EmailStats {
    const totalSent = this.sentEmails.filter(e => e.status === 'SENT').length;
    const totalFailed = this.sentEmails.filter(e => e.status === 'FAILED').length;
    const lastEmail = this.sentEmails[0];

    const byType: Record<string, number> = {};
    for (const email of this.sentEmails) {
      byType[email.type] = (byType[email.type] || 0) + 1;
    }

    return {
      totalSent,
      totalFailed,
      lastSentAt: lastEmail ? lastEmail.sentAt : undefined,
      byType
    };
  }

  clear(): void {
    this.sentEmails = [];
  }
}

export const emailRepository = new EmailRepository();
