import { IRequestHandler } from '../../core/mediator.interface.js';
import { UpdatePlayerCommand } from './update-player.command.js';
import { IPlayerWriteRepository } from '../../storage/player-write.repository.js';
import { PlayerData } from '../../../shared/types/player.types.js';

export class UpdatePlayerCommandHandler implements IRequestHandler<UpdatePlayerCommand, PlayerData> {
  constructor(private readonly writeRepo: IPlayerWriteRepository) {}

  async handle(command: UpdatePlayerCommand): Promise<PlayerData> {
    const existing = await this.writeRepo.getForUpdate(command.id);
    if (!existing) {
      throw new Error(`Jogador com id '${command.id}' não encontrado.`);
    }

    if (command.data.name !== undefined) {
      if (command.data.name.trim().length < 3) {
        throw new Error('Comando inválido: Nome deve ter ao menos 3 caracteres.');
      }
      command.data.name = command.data.name.trim();
    }

    if (command.data.skillLevel !== undefined) {
      if (command.data.skillLevel < 1 || command.data.skillLevel > 5) {
        throw new Error('Comando inválido: Nível de habilidade deve ser entre 1 e 5.');
      }
    }

    const updated = await this.writeRepo.update(command.id, command.data);
    if (!updated) {
      throw new Error(`Falha ao atualizar jogador '${command.id}'.`);
    }

    return updated;
  }
}
