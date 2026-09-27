import { Router } from 'express';
import { prizeController } from './prize.controller.js';

export function createPrizeRouter(): Router {
  const router = Router();

  router.get('/health', prizeController.health);
  router.get('/tournaments', prizeController.listTournaments);
  router.get('/batches', prizeController.listBatches);
  router.get('/batches/:batchId', prizeController.getBatch);

  router.post('/batches', prizeController.createBatch);
  router.post('/batches/:batchId/process', prizeController.processBatch);
  router.post('/batches/:batchId/compensate', prizeController.compensateBatch);

  return router;
}
