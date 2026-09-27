import { Router } from 'express';
import { sagaController } from './saga.controller.js';

export function createSagaRouter(): Router {
  const router = Router();

  router.get('/health', sagaController.health);
  router.get('/executions', sagaController.listExecutions);
  router.get('/executions/:sagaId', sagaController.getExecution);
  router.delete('/executions', sagaController.clearHistory);

  router.post('/prize-distribution/execute', sagaController.executePrizeDistribution);

  return router;
}
