import { Request, Response } from 'express';
import { prizeBatchService, PrizeBatchService } from './prize-batch.service.js';

export class PrizeController {
  constructor(private service: PrizeBatchService = prizeBatchService) {}

  createBatch = async (req: Request, res: Response) => {
    try {
      const batch = await this.service.createBatch(req.body);
      res.status(201).json({ success: true, batch });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  };

  processBatch = async (req: Request, res: Response) => {
    try {
      const { batchId } = req.params;
      const batch = await this.service.processBatch(batchId, req.body);
      res.status(200).json({ success: true, batch });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  };

  compensateBatch = async (req: Request, res: Response) => {
    try {
      const { batchId } = req.params;
      const batch = await this.service.compensateBatch(batchId, req.body);
      res.status(200).json({ success: true, message: 'Lote estornado com sucesso (Compensação)', batch });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  };

  listBatches = (req: Request, res: Response) => {
    const batches = this.service.listBatches();
    res.json({ success: true, total: batches.length, batches });
  };

  getBatch = (req: Request, res: Response) => {
    const batch = this.service.getBatch(req.params.batchId);
    if (!batch) {
      return res.status(404).json({ success: false, error: 'Lote não encontrado' });
    }
    res.json({ success: true, batch });
  };

  listTournaments = (req: Request, res: Response) => {
    const tournaments = this.service.listTournaments();
    res.json({ success: true, tournaments });
  };

  health = (req: Request, res: Response) => {
    res.json({
      service: 'Prize Batch Processing Microservice',
      status: 'UP',
      timestamp: new Date().toISOString()
    });
  };
}

export const prizeController = new PrizeController();
