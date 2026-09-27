import { Request, Response, Router } from 'express';
import { ListPlayersHandler } from './list-players.handler.js';

export function registerListPlayersEndpoint(router: Router): void {
  const handler = new ListPlayersHandler();

  router.get('/players', async (req: Request, res: Response) => {
    try {
      const result = await handler.handle(req.query);
      res.status(200).json({
        architecture: 'Vertical Slice Architecture',
        feature: 'list-players',
        total: result.length,
        data: result
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message, feature: 'list-players' });
    }
  });
}
