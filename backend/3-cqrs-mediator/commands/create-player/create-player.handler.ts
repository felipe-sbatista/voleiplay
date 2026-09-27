import { IRequestHandler } from '../../core/mediator.interface.js';
import { CreatePlayerCommand, CreatePlayerResult } from './create-player.command.js';
import { IPlayerWriteRepository } from '../../storage/player-write.repository.js';
import { PlayerData } from '../../../shared/types/player.types.js';

export class CreatePlayerCommandHandler implements IRequestHandler<CreatePlayerCommand, CreatePlayerResult> {
  constructor(private readonly writeRepo: IPlayerWriteRepository) {}

  async handle(command: CreatePlayerCommand): Promise<CreatePlayerResult> {
    if (!command.name || command.name.trim().length < 3) {
      throw new Error('Comando inválido: Nome do jogador deve ter no mínimo 3 caracteres.');
    }
    if (command.skillLevel < 1 || command.skillLevel > 5) {
      throw new Error('Comando inválido: Nível de habilidade deve ser entre 1 e 5.');
    }

    const newId = `p-${Date.now()}`;
    const player: PlayerData = {
      id: newId,
      name: command.name.trim(),
      nickname: command.nickname?.trim(),
      gender: command.gender,
      position: command.position,
      skillLevel: command.skillLevel,
      height: command.height,
      dominantHand: command.dominantHand,
      avatar: command.avatar,
      teamId: command.teamId,
      bio: command.bio,
      stats: { matches: 0, wins: 0, pointsScored: 0, mvps: 0 }
    };

    await this.writeRepo.save(player);

    return {
      id: player.id,
      name: player.name,
      position: player.position
    };
  }
}
