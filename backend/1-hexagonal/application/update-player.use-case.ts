import { UpdatePlayerCommand, UpdatePlayerPort } from '../domain/ports/inbound/update-player.port.js';
import { PlayerRepositoryPort } from '../domain/ports/outbound/player-repository.port.js';
import { PlayerData } from '../../shared/types/player.types.js';
import { PlayerNotFoundError } from '../domain/player.errors.js';

export class UpdatePlayerUseCase implements UpdatePlayerPort {
  constructor(private readonly playerRepository: PlayerRepositoryPort) {}

  async execute(command: UpdatePlayerCommand): Promise<PlayerData> {
    const player = await this.playerRepository.findById(command.id);
    if (!player) {
      throw new PlayerNotFoundError(command.id);
    }

    player.updateInfo(command.data);
    await this.playerRepository.update(player);

    return player.toDTO();
  }
}
