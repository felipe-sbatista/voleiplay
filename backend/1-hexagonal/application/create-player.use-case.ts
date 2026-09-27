import { CreatePlayerCommand, CreatePlayerPort } from '../domain/ports/inbound/create-player.port.js';
import { PlayerRepositoryPort } from '../domain/ports/outbound/player-repository.port.js';
import { Player } from '../domain/player.entity.js';
import { PlayerData } from '../../shared/types/player.types.js';

export class CreatePlayerUseCase implements CreatePlayerPort {
  constructor(private readonly playerRepository: PlayerRepositoryPort) { }

  async execute(command: CreatePlayerCommand): Promise<PlayerData> {
    const id = `p-${Date.now()}`;
    const player = Player.create({
      id,
      name: command.name,
      nickname: command.nickname,
      gender: command.gender,
      position: command.position,
      skillLevel: command.skillLevel,
      height: command.height,
      dominantHand: command.dominantHand,
      avatar: command.avatar,
      teamId: command.teamId,
      bio: command.bio,
      stats: { matches: 0, wins: 0, pointsScored: 0, mvps: 0 }
    });

    await this.playerRepository.save(player);
    return player.toDTO();
  }

  private validatePersonExist(): void {
    //Valida se a pessoa existe
  }

  private validateTournmentIsOpen(): void {

  }

  private validateTeamIsOpen(): void {

  }
}
