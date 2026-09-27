import { Request, Response } from 'express';
import { IMediator } from '../core/mediator.interface.js';
import { CreatePlayerCommand } from '../commands/create-player/create-player.command.js';
import { UpdatePlayerCommand } from '../commands/update-player/update-player.command.js';
import { DeletePlayerCommand } from '../commands/delete-player/delete-player.command.js';
import { GetPlayerByIdQuery } from '../queries/get-player-by-id/get-player-by-id.query.js';
import { ListPlayersQuery } from '../queries/list-players/list-players.query.js';

export class CqrsPlayerController {
  constructor(private readonly mediator: IMediator) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const command = new CreatePlayerCommand(
        req.body.name,
        req.body.nickname,
        req.body.gender,
        req.body.position,
        req.body.skillLevel,
        req.body.dominantHand,
        req.body.height,
        req.body.avatar,
        req.body.teamId,
        req.body.bio
      );

      const result = await this.mediator.send(command);
      res.status(201).json({
        architecture: 'CQRS with Mediator Pattern',
        pattern: 'Command (Write Model)',
        data: result
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message, type: 'CommandExecutionError' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const query = new GetPlayerByIdQuery(req.params.id);
      const result = await this.mediator.send(query);
      res.status(200).json({
        architecture: 'CQRS with Mediator Pattern',
        pattern: 'Query (Read Model)',
        data: result
      });
    } catch (err: any) {
      res.status(404).json({ error: err.message, type: 'QueryExecutionError' });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const query = new ListPlayersQuery(
        req.query.position as string | undefined,
        req.query.gender as string | undefined,
        req.query.search as string | undefined
      );

      const result = await this.mediator.send(query);
      res.status(200).json({
        architecture: 'CQRS with Mediator Pattern',
        pattern: 'Query (Read Model)',
        total: result.length,
        data: result
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message, type: 'QueryExecutionError' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const command = new UpdatePlayerCommand(req.params.id, req.body);
      const result = await this.mediator.send(command);
      res.status(200).json({
        architecture: 'CQRS with Mediator Pattern',
        pattern: 'Command (Write Model)',
        data: result
      });
    } catch (err: any) {
      const status = err.message.includes('não encontrado') ? 404 : 400;
      res.status(status).json({ error: err.message, type: 'CommandExecutionError' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const command = new DeletePlayerCommand(req.params.id);
      await this.mediator.send(command);
      res.status(200).json({
        architecture: 'CQRS with Mediator Pattern',
        pattern: 'Command (Write Model)',
        message: `Jogador '${req.params.id}' excluído com sucesso via Mediator.`
      });
    } catch (err: any) {
      res.status(404).json({ error: err.message, type: 'CommandExecutionError' });
    }
  }
}
