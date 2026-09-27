import { Router } from 'express';
import { registerCreatePlayerEndpoint } from './features/create-player/create-player.endpoint.js';
import { registerGetPlayerByIdEndpoint } from './features/get-player-by-id/get-player.endpoint.js';
import { registerListPlayersEndpoint } from './features/list-players/list-players.endpoint.js';
import { registerUpdatePlayerEndpoint } from './features/update-player/update-player.endpoint.js';
import { registerDeletePlayerEndpoint } from './features/delete-player/delete-player.endpoint.js';

export function createVerticalSliceRouter(): Router {
  const router = Router();

  // Cada fatia vertical registra seu próprio endpoint de forma autônoma
  registerCreatePlayerEndpoint(router);
  registerGetPlayerByIdEndpoint(router);
  registerListPlayersEndpoint(router);
  registerUpdatePlayerEndpoint(router);
  registerDeletePlayerEndpoint(router);

  return router;
}
