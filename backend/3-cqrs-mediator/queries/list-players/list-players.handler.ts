import { IRequestHandler } from '../../core/mediator.interface.js';
import { ListPlayersQuery } from './list-players.query.js';
import { IPlayerReadRepository } from '../../storage/player-read.repository.js';
import { PlayerData } from '../../../shared/types/player.types.js';

export class ListPlayersQueryHandler implements IRequestHandler<ListPlayersQuery, PlayerData[]> {
  constructor(private readonly readRepo: IPlayerReadRepository) {}

  async handle(query: ListPlayersQuery): Promise<PlayerData[]> {
    return this.readRepo.search({
      position: query.position,
      gender: query.gender,
      search: query.search
    });
  }
}
