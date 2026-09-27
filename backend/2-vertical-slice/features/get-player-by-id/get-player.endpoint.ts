import { Request, Response, Router } from 'express';
import { GetPlayerByIdHandler } from './get-player.handler.js';

export function registerGetPlayerByIdEndpoint(router: Router): void {
  const handler = new GetPlayerByIdHandler();

  router.get('/players/:id', async (req: Request, res: Response) => {
    try {
      const result = await handler.handle(req.params.id);
      res.status(200).json({
        architecture: 'Vertical Slice Architecture',
        feature: 'get-player-by-id',
        data: result
      });
    } catch (err: any) {
      res.status(404).json({ error: err.message, feature: 'get-player-by-id' });
    }
  });
}
