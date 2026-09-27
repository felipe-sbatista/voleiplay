import { ListPlayersFilter, ListPlayersPort } from '../domain/ports/inbound/list-players.port.js';
import { PlayerRepositoryPort } from '../domain/ports/outbound/player-repository.port.js';
import { PlayerData } from '../../shared/types/player.types.js';

export class ListPlayersUseCase implements ListPlayersPort {
  constructor(private readonly playerRepository: PlayerRepositoryPort) {}

  async execute(filter?: ListPlayersFilter): Promise<PlayerData[]> {
    const players = await this.playerRepository.findAll(filter);
    return players.map(p => p.toDTO());
  }
}
