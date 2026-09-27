import { IRequestHandler } from '../../core/mediator.interface.js';
import { GetPlayerByIdQuery } from './get-player-by-id.query.js';
import { IPlayerReadRepository } from '../../storage/player-read.repository.js';
import { PlayerData } from '../../../shared/types/player.types.js';

export class GetPlayerByIdQueryHandler implements IRequestHandler<GetPlayerByIdQuery, PlayerData> {
  constructor(private readonly readRepo: IPlayerReadRepository) {}

  async handle(query: GetPlayerByIdQuery): Promise<PlayerData> {
    const player = await this.readRepo.findById(query.id);
    if (!player) {
      throw new Error(`Jogador com id '${query.id}' não encontrado.`);
    }
    return player;
  }
}
