import { Request, Response, Router } from 'express';
import { UpdatePlayerHandler } from './update-player.handler.js';

export function registerUpdatePlayerEndpoint(router: Router): void {
  const handler = new UpdatePlayerHandler();

  router.put('/players/:id', async (req: Request, res: Response) => {
    try {
      const result = await handler.handle(req.params.id, req.body);
      res.status(200).json({
        architecture: 'Vertical Slice Architecture',
        feature: 'update-player',
        data: result
      });
    } catch (err: any) {
      const status = err.message.includes('não encontrado') ? 404 : 400;
      res.status(status).json({ error: err.message, feature: 'update-player' });
    }
  });
}
