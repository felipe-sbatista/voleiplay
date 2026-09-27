import { Request, Response, Router } from 'express';
import { DeletePlayerHandler } from './delete-player.handler.js';

export function registerDeletePlayerEndpoint(router: Router): void {
  const handler = new DeletePlayerHandler();

  router.delete('/players/:id', async (req: Request, res: Response) => {
    try {
      await handler.handle(req.params.id);
      res.status(200).json({
        architecture: 'Vertical Slice Architecture',
        feature: 'delete-player',
        message: `Jogador '${req.params.id}' removido com sucesso.`
      });
    } catch (err: any) {
      res.status(404).json({ error: err.message, feature: 'delete-player' });
    }
  });
}
