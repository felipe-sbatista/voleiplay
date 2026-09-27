import { Request, Response } from 'express';
import { CreatePlayerPort } from '../../../domain/ports/inbound/create-player.port.js';
import { GetPlayerPort } from '../../../domain/ports/inbound/get-player.port.js';
import { ListPlayersPort } from '../../../domain/ports/inbound/list-players.port.js';
import { UpdatePlayerPort } from '../../../domain/ports/inbound/update-player.port.js';
import { DeletePlayerPort } from '../../../domain/ports/inbound/delete-player.port.js';
import { PlayerNotFoundError, DomainError } from '../../../domain/player.errors.js';
import { CreatePlayerDTO, UpdatePlayerDTO } from './player.dto.js';

export class PlayerController {
  constructor(
    // playerApplication ou playerDomain
    private readonly createPlayerUseCase: CreatePlayerPort,
    private readonly getPlayerUseCase: GetPlayerPort,
    private readonly listPlayersUseCase: ListPlayersPort,
    private readonly updatePlayerUseCase: UpdatePlayerPort,
    private readonly deletePlayerUseCase: DeletePlayerPort
  ) { }

  async create(req: Request<{}, {}, CreatePlayerDTO>, res: Response): Promise<void> {
    try {
      const result = await this.createPlayerUseCase.execute(req.body);
      res.status(201).json({
        architecture: 'Hexagonal (Ports & Adapters)',
        data: result
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  async getById(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const result = await this.getPlayerUseCase.execute(req.params.id);
      res.status(200).json({
        architecture: 'Hexagonal (Ports & Adapters)',
        data: result
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  async list(req: Request<{}, {}, {}, { position?: string; gender?: string; search?: string }>, res: Response): Promise<void> {
    try {
      const result = await this.listPlayersUseCase.execute(req.query);
      res.status(200).json({
        architecture: 'Hexagonal (Ports & Adapters)',
        total: result.length,
        data: result
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  async update(req: Request<{ id: string }, {}, UpdatePlayerDTO>, res: Response): Promise<void> {
    try {
      const result = await this.updatePlayerUseCase.execute({
        id: req.params.id,
        data: req.body
      });
      res.status(200).json({
        architecture: 'Hexagonal (Ports & Adapters)',
        data: result
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  async delete(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      await this.deletePlayerUseCase.execute(req.params.id);
      res.status(200).json({
        architecture: 'Hexagonal (Ports & Adapters)',
        message: `Jogador '${req.params.id}' removido com sucesso.`
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  private handleError(error: any, res: Response): void {
    if (error instanceof PlayerNotFoundError) {
      res.status(404).json({ error: error.message, type: error.name });
      return;
    }
    if (error instanceof DomainError) {
      res.status(400).json({ error: error.message, type: error.name });
      return;
    }
    console.error('Unhandled error in Hexagonal Controller:', error);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
}
