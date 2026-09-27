import { Request, Response, Router } from 'express';
import { CreatePlayerHandler } from './create-player.handler.js';

export function registerCreatePlayerEndpoint(router: Router): void {
  const handler = new CreatePlayerHandler();

  router.post('/players', async (req: Request, res: Response) => {
    try {
      const result = await handler.handle(req.body);
      res.status(201).json({
        architecture: 'Vertical Slice Architecture',
        feature: 'create-player',
        data: result
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message, feature: 'create-player' });
    }
  });
}
