import { IRequestHandler } from '../../core/mediator.interface.js';
import { DeletePlayerCommand } from './delete-player.command.js';
import { IPlayerWriteRepository } from '../../storage/player-write.repository.js';

export class DeletePlayerCommandHandler implements IRequestHandler<DeletePlayerCommand, boolean> {
  constructor(private readonly writeRepo: IPlayerWriteRepository) {}

  async handle(command: DeletePlayerCommand): Promise<boolean> {
    const success = await this.writeRepo.delete(command.id);
    if (!success) {
      throw new Error(`Jogador com id '${command.id}' não encontrado para exclusão.`);
    }
    return true;
  }
}
