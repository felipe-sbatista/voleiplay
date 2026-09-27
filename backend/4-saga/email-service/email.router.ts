import { Router } from 'express';
import { emailController } from './email.controller.js';

export function createEmailRouter(): Router {
  const router = Router();

  router.get('/health', emailController.health);
  router.get('/', emailController.list);
  router.get('/stats', emailController.stats);
  router.delete('/', emailController.clear);

  router.post('/send', emailController.sendSingle);
  router.post('/send-batch', emailController.sendBatch);
  router.post('/compensate', emailController.compensate);

  return router;
}
