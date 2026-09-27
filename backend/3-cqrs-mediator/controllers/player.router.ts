import { Router } from 'express';
import { Mediator } from '../core/mediator.js';
import { LoggingBehavior } from '../core/pipeline/logging.behavior.js';
import { PlayerWriteRepository } from '../storage/player-write.repository.js';
import { PlayerReadRepository } from '../storage/player-read.repository.js';

import { CreatePlayerCommand } from '../commands/create-player/create-player.command.js';
import { CreatePlayerCommandHandler } from '../commands/create-player/create-player.handler.js';
import { UpdatePlayerCommand } from '../commands/update-player/update-player.command.js';
import { UpdatePlayerCommandHandler } from '../commands/update-player/update-player.handler.js';
import { DeletePlayerCommand } from '../commands/delete-player/delete-player.command.js';
import { DeletePlayerCommandHandler } from '../commands/delete-player/delete-player.handler.js';

import { GetPlayerByIdQuery } from '../queries/get-player-by-id/get-player-by-id.query.js';
import { GetPlayerByIdQueryHandler } from '../queries/get-player-by-id/get-player-by-id.handler.js';
import { ListPlayersQuery } from '../queries/list-players/list-players.query.js';
import { ListPlayersQueryHandler } from '../queries/list-players/list-players.handler.js';

import { CqrsPlayerController } from './player.controller.js';

export function createCqrsPlayerRouter(): Router {
  const router = Router();

  // 1. Instancia o Mediator e Registra Pipeline Behaviors
  const mediator = new Mediator();
  mediator.addPipelineBehavior(new LoggingBehavior());

  // 2. Instancia os repositórios separados (Write Model vs Read Model)
  const writeRepo = new PlayerWriteRepository();
  const readRepo = new PlayerReadRepository();

  // 3. Registra os Handlers de Commands
  mediator.registerHandler(CreatePlayerCommand, new CreatePlayerCommandHandler(writeRepo));
  mediator.registerHandler(UpdatePlayerCommand, new UpdatePlayerCommandHandler(writeRepo));
  mediator.registerHandler(DeletePlayerCommand, new DeletePlayerCommandHandler(writeRepo));

  // 4. Registra os Handlers de Queries
  mediator.registerHandler(GetPlayerByIdQuery, new GetPlayerByIdQueryHandler(readRepo));
  mediator.registerHandler(ListPlayersQuery, new ListPlayersQueryHandler(readRepo));

  // 5. Instancia o Controller
  const controller = new CqrsPlayerController(mediator);

  // 6. Configura as rotas
  router.post('/players', (req, res) => controller.create(req, res));
  router.get('/players', (req, res) => controller.list(req, res));
  router.get('/players/:id', (req, res) => controller.getById(req, res));
  router.put('/players/:id', (req, res) => controller.update(req, res));
  router.delete('/players/:id', (req, res) => controller.delete(req, res));

  return router;
}
