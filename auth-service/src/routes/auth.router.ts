import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';

export function createAuthRouter(): Router {
  const router = Router();

  router.get('/health', authController.health);
  router.post('/login', authController.login);
  router.post('/register', authController.register);
  router.get('/me', authController.me);
  router.post('/logout', authController.logout);
  router.get('/users', authController.listUsers);
  router.get('/stats', authController.stats);

  return router;
}
