import {
  EmailMessage,
  SendEmailDto,
  SendBatchEmailsDto,
  CompensateEmailDto,
  EmailStats
} from '../types/email.types.js';
import { emailRepository, EmailRepository } from '../repositories/email.repository.js';

export class EmailService {
  constructor(private repo: EmailRepository = emailRepository) {}

  /**
   * Envia um e-mail individual (mockado com log didático)
   */
  async sendEmail(dto: SendEmailDto): Promise<EmailMessage> {
    if (dto.simulateFailure) {
      console.log(`\x1b[31m[EmailService] ❌ Falha simulada ao enviar e-mail para ${dto.to} ("${dto.subject}")\x1b[0m`);
      const failedEmail: EmailMessage = {
        id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        to: dto.to,
        recipientName: dto.recipientName,
        subject: dto.subject,
        body: dto.body,
        type: dto.type || 'PRIZE_NOTIFICATION',
        status: 'FAILED',
        sentAt: new Date().toISOString(),
        metadata: { ...dto.metadata, failureReason: 'Simulated failure in EmailService' }
      };
      this.repo.save(failedEmail);
      throw new Error(`[EmailService] Falha no envio de e-mail para ${dto.to}: Servidor SMTP indisponível (Simulação).`);
    }

    const email: EmailMessage = {
      id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      to: dto.to,
      recipientName: dto.recipientName,
      subject: dto.subject,
      body: dto.body,
      type: dto.type || 'PRIZE_NOTIFICATION',
      status: 'SENT',
      sentAt: new Date().toISOString(),
      metadata: dto.metadata
    };

    this.repo.save(email);
    console.log(`\x1b[36m[EmailService] ✉️ E-mail mockado enviado com sucesso para ${dto.recipientName} <${dto.to}>\x1b[0m | Assunto: "${dto.subject}"`);
    return email;
  }

  /**
   * Envia um lote de e-mails para múltiplos destinatários
   */
  async sendBatch(dto: SendBatchEmailsDto): Promise<{ sent: EmailMessage[]; count: number }> {
    console.log(`\x1b[36m[EmailService] 📬 Iniciando disparo em lote de ${dto.emails.length} e-mail(s)...\x1b[0m`);

    if (dto.simulateFailure) {
      console.log(`\x1b[31m[EmailService] 💥 Simulação ativada: Falha catastrófica no gateway de e-mails!\x1b[0m`);
      throw new Error('[EmailService] Falha ao disparar lote de e-mails: Gateway indisponível.');
    }

    const sentEmails: EmailMessage[] = [];

    for (let i = 0; i < dto.emails.length; i++) {
      const emailDto = dto.emails[i];
      if (dto.failAtIndex !== undefined && dto.failAtIndex === i) {
        console.log(`\x1b[31m[EmailService] ❌ Falha simulada no item [${i}] do lote (${emailDto.to})\x1b[0m`);
        throw new Error(`[EmailService] Falha ao enviar e-mail [${i}] para ${emailDto.to}`);
      }

      const sent = await this.sendEmail(emailDto);
      sentEmails.push(sent);
    }

    console.log(`\x1b[32m[EmailService] ✅ Lote concluído: ${sentEmails.length} e-mails despachados.\x1b[0m`);
    return { sent: sentEmails, count: sentEmails.length };
  }

  /**
   * Transação compensatória: Envia e-mails notificando o cancelamento/estorno do prêmio
   */
  async compensateBatch(dto: CompensateEmailDto): Promise<{ compensatedEmails: EmailMessage[] }> {
    console.log(`\x1b[33m[EmailService] ↩️ EXECUTANDO TRANSAÇÃO COMPENSATÓRIA: Enviando notificações de estorno...\x1b[0m`);
    console.log(`   Motivo: "${dto.reason}" | Destinatários: ${dto.recipients.length}`);

    const compensatedList: EmailMessage[] = [];

    for (const recipient of dto.recipients) {
      const email: EmailMessage = {
        id: `email-comp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        to: recipient.to,
        recipientName: recipient.recipientName,
        subject: `[IMPORTANTE] Notificação de Estorno de Premiação - VoleiPlay`,
        body: `Olá ${recipient.recipientName}, informamos que houve uma inconsistência no processamento da premiação do torneio (Motivo: ${dto.reason}). Quaisquer valores creditados preliminarmente foram estornados pela federação. Lamentamos o inconveniente.`,
        type: 'PRIZE_CANCELLATION',
        status: 'SENT',
        sentAt: new Date().toISOString(),
        metadata: {
          originalBatchId: dto.originalBatchId,
          refundReason: dto.reason,
          refundAmount: recipient.amountToRefund
        }
      };

      this.repo.save(email);
      compensatedList.push(email);
      console.log(`   \x1b[33m↪ E-mail de estorno entregue para ${recipient.recipientName} <${recipient.to}>\x1b[0m`);
    }

    return { compensatedEmails: compensatedList };
  }

  listSent(limit = 50): EmailMessage[] {
    return this.repo.findAll(limit);
  }

  getStats(): EmailStats {
    return this.repo.getStats();
  }

  clear(): void {
    this.repo.clear();
    console.log(`[EmailService] 🧹 Caixa de saída limpa.`);
  }
}

export const emailService = new EmailService();
