import { Request, Response } from 'express';
import { emailService, EmailService } from './email.service.js';

export class EmailController {
  constructor(private service: EmailService = emailService) {}

  sendSingle = async (req: Request, res: Response) => {
    try {
      const email = await this.service.sendEmail(req.body);
      res.status(201).json({ success: true, email });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  sendBatch = async (req: Request, res: Response) => {
    try {
      const result = await this.service.sendBatch(req.body);
      res.status(201).json({ success: true, ...result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  compensate = async (req: Request, res: Response) => {
    try {
      const result = await this.service.compensateBatch(req.body);
      res.status(200).json({ success: true, message: 'Compensação de e-mails executada com sucesso', ...result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  list = (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const emails = this.service.listSent(limit);
    res.json({ success: true, total: emails.length, emails });
  };

  stats = (req: Request, res: Response) => {
    const stats = this.service.getStats();
    res.json({ success: true, stats });
  };

  clear = (req: Request, res: Response) => {
    this.service.clear();
    res.json({ success: true, message: 'Caixa de saída esvaziada com sucesso' });
  };

  health = (req: Request, res: Response) => {
    res.json({
      service: 'Email Microservice',
      status: 'UP',
      mocked: true,
      timestamp: new Date().toISOString()
    });
  };
}

export const emailController = new EmailController();
