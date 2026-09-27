import { describe, it, expect, beforeEach } from 'vitest';
import { EmailRepository } from '../../email-service/src/repositories/email.repository.js';
import { EmailService } from '../../email-service/src/services/email.service.js';

describe('Email Service - EmailRepository Unit Tests', () => {
  let repo: EmailRepository;

  beforeEach(() => {
    repo = new EmailRepository();
    repo.clear();
  });

  it('deve salvar e recuperar e-mails na caixa de saída (outbox)', () => {
    const email = repo.save({
      id: 'email-test-1',
      to: 'atleta@voleiplay.com',
      recipientName: 'Atleta Vôlei',
      subject: 'Convite Etapa Elite 16',
      body: 'Você foi convidado para a etapa oficial.',
      type: 'SYSTEM_ALERT',
      status: 'SENT',
      sentAt: new Date().toISOString()
    });

    expect(email.id).toBe('email-test-1');
    const all = repo.findAll();
    expect(all.length).toBe(1);
    expect(all[0].to).toBe('atleta@voleiplay.com');

    const found = repo.findById('email-test-1');
    expect(found).toBeDefined();
    expect(found?.subject).toBe('Convite Etapa Elite 16');
  });

  it('deve calcular estatísticas agrupadas por tipo e status', () => {
    repo.save({
      id: '1',
      to: 'a@a.com',
      recipientName: 'A',
      subject: 'Sub 1',
      body: 'B',
      type: 'PRIZE_NOTIFICATION',
      status: 'SENT',
      sentAt: new Date().toISOString()
    });

    repo.save({
      id: '2',
      to: 'b@b.com',
      recipientName: 'B',
      subject: 'Sub 2',
      body: 'B',
      type: 'PRIZE_NOTIFICATION',
      status: 'SENT',
      sentAt: new Date().toISOString()
    });

    repo.save({
      id: '3',
      to: 'c@c.com',
      recipientName: 'C',
      subject: 'Sub 3',
      body: 'B',
      type: 'SYSTEM_ALERT',
      status: 'FAILED',
      sentAt: new Date().toISOString()
    });

    const stats = repo.getStats();
    expect(stats.totalSent).toBe(2);
    expect(stats.totalFailed).toBe(1);
    expect(stats.byType['PRIZE_NOTIFICATION']).toBe(2);
    expect(stats.byType['SYSTEM_ALERT']).toBe(1);
  });

  it('deve limpar todos os e-mails ao chamar clear()', () => {
    repo.save({
      id: 'clear-1',
      to: 'test@clear.com',
      recipientName: 'Clear',
      subject: 'Clear',
      body: 'Body',
      type: 'SYSTEM_ALERT',
      status: 'SENT',
      sentAt: new Date().toISOString()
    });
    expect(repo.findAll().length).toBe(1);

    repo.clear();
    expect(repo.findAll().length).toBe(0);
  });
});

describe('Email Service - EmailService Business Logic Unit Tests', () => {
  let repo: EmailRepository;
  let service: EmailService;

  beforeEach(() => {
    repo = new EmailRepository();
    repo.clear();
    service = new EmailService(repo);
  });

  it('deve enviar e-mail individual com sucesso e status SENT', async () => {
    const email = await service.sendEmail({
      to: 'duda.lisboa@voleiplay.com.br',
      recipientName: 'Duda Lisboa',
      subject: '🏐 Parabéns pelo Título!',
      body: 'Você conquistou a etapa de Saquarema!',
      type: 'PRIZE_NOTIFICATION'
    });

    expect(email.id).toMatch(/^email-/);
    expect(email.status).toBe('SENT');
    expect(email.to).toBe('duda.lisboa@voleiplay.com.br');

    const outbox = repo.findAll();
    expect(outbox.length).toBe(1);
    expect(outbox[0].id).toBe(email.id);
  });

  it('deve simular falha de envio quando simulateFailure for true', async () => {
    await expect(
      service.sendEmail({
        to: 'falha@voleiplay.com',
        recipientName: 'Erro',
        subject: 'Falhará',
        body: 'Teste',
        simulateFailure: true
      })
    ).rejects.toThrow('Servidor SMTP indisponível');

    // Verifica que foi registrado como FAILED na caixa de saída
    const outbox = repo.findAll();
    expect(outbox.length).toBe(1);
    expect(outbox[0].status).toBe('FAILED');
    expect(outbox[0].metadata?.failureReason).toBeDefined();
  });

  it('deve enviar lote de e-mails com sendBatch', async () => {
    const result = await service.sendBatch({
      batchId: 'batch-001',
      emails: [
        { to: 'atleta1@volei.com', recipientName: 'Atleta 1', subject: 'Aviso 1', body: 'Corpo 1' },
        { to: 'atleta2@volei.com', recipientName: 'Atleta 2', subject: 'Aviso 2', body: 'Corpo 2' },
        { to: 'atleta3@volei.com', recipientName: 'Atleta 3', subject: 'Aviso 3', body: 'Corpo 3' }
      ]
    });

    expect(result.count).toBe(3);
    expect(result.sent.length).toBe(3);
    expect(repo.findAll().length).toBe(3);
  });

  it('deve executar transação compensatória enviando e-mails de estorno (Saga Pattern)', async () => {
    const result = await service.compensateBatch({
      originalBatchId: 'batch-999',
      recipients: [
        { to: 'campeao1@volei.com', recipientName: 'Campeão 1' },
        { to: 'campeao2@volei.com', recipientName: 'Campeão 2' }
      ],
      reason: 'Cancelamento por tempestade de areia'
    });

    expect(result.compensatedEmails.length).toBe(2);
    expect(result.compensatedEmails[0].type).toBe('PRIZE_CANCELLATION');
    expect(result.compensatedEmails[0].subject).toContain('Estorno de Premiação');
    expect(result.compensatedEmails[0].body).toContain('tempestade de areia');
  });
});
