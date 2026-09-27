import { DeletePlayerPort } from '../domain/ports/inbound/delete-player.port.js';
import { PlayerRepositoryPort } from '../domain/ports/outbound/player-repository.port.js';
import { PlayerNotFoundError } from '../domain/player.errors.js';

export class DeletePlayerUseCase implements DeletePlayerPort {
  constructor(private readonly playerRepository: PlayerRepositoryPort) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.playerRepository.delete(id);
    if (!deleted) {
      throw new PlayerNotFoundError(id);
    }
  }
}
