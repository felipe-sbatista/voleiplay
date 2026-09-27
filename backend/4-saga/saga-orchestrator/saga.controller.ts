import { Request, Response } from 'express';
import { prizeDistributionSaga, PrizeDistributionSagaOrchestrator } from './prize-distribution.saga.js';

export class SagaController {
  constructor(private orchestrator: PrizeDistributionSagaOrchestrator = prizeDistributionSaga) {}

  executePrizeDistribution = async (req: Request, res: Response) => {
    try {
      const execution = await this.orchestrator.execute(req.body);
      const httpStatus = execution.status === 'COMPLETED' ? 200 : 202;
      res.status(httpStatus).json({
        success: execution.status === 'COMPLETED',
        sagaStatus: execution.status,
        execution
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  listExecutions = (req: Request, res: Response) => {
    const executions = this.orchestrator.listExecutions();
    res.json({ success: true, total: executions.length, executions });
  };

  getExecution = (req: Request, res: Response) => {
    const execution = this.orchestrator.getExecution(req.params.sagaId);
    if (!execution) {
      return res.status(404).json({ success: false, error: 'Saga não encontrada' });
    }
    res.json({ success: true, execution });
  };

  clearHistory = (req: Request, res: Response) => {
    this.orchestrator.clearHistory();
    res.json({ success: true, message: 'Histórico de execuções de Sagas limpo com sucesso' });
  };

  health = (req: Request, res: Response) => {
    res.json({
      service: 'Saga Orchestrator Service',
      pattern: 'Orchestrated Saga with Compensating Transactions',
      status: 'UP',
      timestamp: new Date().toISOString()
    });
  };
}

export const sagaController = new SagaController();
