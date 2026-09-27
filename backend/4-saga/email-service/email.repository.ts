import { EmailMessage, EmailStats } from './email.types.js';

export class EmailRepository {
  private sentBox: EmailMessage[] = [];

  save(email: EmailMessage): EmailMessage {
    this.sentBox.unshift(email);
    return email;
  }

  saveAll(emails: EmailMessage[]): EmailMessage[] {
    for (const email of emails) {
      this.sentBox.unshift(email);
    }
    return emails;
  }

  findAll(limit = 50): EmailMessage[] {
    return this.sentBox.slice(0, limit);
  }

  findById(id: string): EmailMessage | undefined {
    return this.sentBox.find(e => e.id === id);
  }

  findByRecipient(emailAddress: string): EmailMessage[] {
    return this.sentBox.filter(e => e.to.toLowerCase() === emailAddress.toLowerCase());
  }

  getStats(): EmailStats {
    const byType: Record<string, number> = {};
    let totalFailed = 0;

    for (const email of this.sentBox) {
      byType[email.type] = (byType[email.type] || 0) + 1;
      if (email.status === 'FAILED') totalFailed++;
    }

    return {
      totalSent: this.sentBox.filter(e => e.status === 'SENT').length,
      totalFailed,
      byType
    };
  }

  clear(): void {
    this.sentBox = [];
  }
}

export const emailRepository = new EmailRepository();
