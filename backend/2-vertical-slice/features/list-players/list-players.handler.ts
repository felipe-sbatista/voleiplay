import { IListPlayersRepository, ListPlayersRepository } from './list-players.repository.js';
import { PlayerData } from '../../../shared/types/player.types.js';

export interface ListPlayersQuery {
  position?: string;
  gender?: string;
  search?: string;
}

export class ListPlayersHandler {
  constructor(private readonly repository: IListPlayersRepository = new ListPlayersRepository()) {}

  async handle(query: ListPlayersQuery): Promise<PlayerData[]> {
    return this.repository.search({
      position: query.position,
      gender: query.gender,
      search: query.search
    });
  }
}
