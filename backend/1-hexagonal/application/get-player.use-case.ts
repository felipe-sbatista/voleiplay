import { GetPlayerPort } from '../domain/ports/inbound/get-player.port.js';
import { PlayerRepositoryPort } from '../domain/ports/outbound/player-repository.port.js';
import { PlayerData } from '../../shared/types/player.types.js';
import { PlayerNotFoundError } from '../domain/player.errors.js';

export class GetPlayerUseCase implements GetPlayerPort {
  constructor(private readonly playerRepository: PlayerRepositoryPort) {}

  async execute(id: string): Promise<PlayerData> {
    const player = await this.playerRepository.findById(id);
    if (!player) {
      throw new PlayerNotFoundError(id);
    }
    return player.toDTO();
  }
}
