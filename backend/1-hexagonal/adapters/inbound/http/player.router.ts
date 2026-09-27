import { Router } from 'express';
import { InMemoryPlayerRepository } from '../../outbound/persistence/in-memory-player.repository.js';
import { CreatePlayerUseCase } from '../../../application/create-player.use-case.js';
import { GetPlayerUseCase } from '../../../application/get-player.use-case.js';
import { ListPlayersUseCase } from '../../../application/list-players.use-case.js';
import { UpdatePlayerUseCase } from '../../../application/update-player.use-case.js';
import { DeletePlayerUseCase } from '../../../application/delete-player.use-case.js';
import { PlayerController } from './player.controller.js';

export function createHexagonalPlayerRouter(): Router {
  const router = Router();

  // 1. Instancia o adaptador secundário (Outbound / Driven)
  const repository = new InMemoryPlayerRepository();

  // 2. Instancia a aplicação / casos de uso injetando as portas necessárias
  const createPlayerUseCase = new CreatePlayerUseCase(repository);
  const getPlayerUseCase = new GetPlayerUseCase(repository);
  const listPlayersUseCase = new ListPlayersUseCase(repository);
  const updatePlayerUseCase = new UpdatePlayerUseCase(repository);
  const deletePlayerUseCase = new DeletePlayerUseCase(repository);

  // 3. Instancia o adaptador primário (Inbound / Driving) injetando os casos de uso
  const controller = new PlayerController(
    createPlayerUseCase,
    getPlayerUseCase,
    listPlayersUseCase,
    updatePlayerUseCase,
    deletePlayerUseCase
  );

  // 4. Mapeia as rotas HTTP
  router.post('/', (req, res) => controller.create(req, res));
  router.get('/', (req, res) => controller.list(req, res));
  router.get('/:id', (req, res) => controller.getById(req, res));
  router.put('/:id', (req, res) => controller.update(req, res));
  router.delete('/:id', (req, res) => controller.delete(req, res));

  return router;
}
