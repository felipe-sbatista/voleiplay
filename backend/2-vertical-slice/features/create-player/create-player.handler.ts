import { ICreatePlayerRepository, CreatePlayerRepository } from './create-player.repository.js';
import { CreatePlayerRequest, CreatePlayerResponse } from './create-player.dto.js';
import { PlayerData } from '../../../shared/types/player.types.js';

export class CreatePlayerHandler {
  constructor(private readonly repository: ICreatePlayerRepository = new CreatePlayerRepository()) { }

  async handle(req: CreatePlayerRequest): Promise<CreatePlayerResponse> {
    // 1. Validações da fatia
    if (!req.name || req.name.trim().length < 3) {
      throw new Error('Nome do jogador deve ter ao menos 3 caracteres.');
    }
    if (req.skillLevel < 1 || req.skillLevel > 5) {
      throw new Error('Nível de habilidade deve ser entre 1 e 5.');
    }

    const newId = `p-${Date.now()}`;
    const newPlayer: PlayerData = {
      id: newId,
      name: req.name.trim(),
      nickname: req.nickname?.trim(),
      gender: req.gender,
      position: req.position,
      skillLevel: req.skillLevel,
      height: req.height,
      dominantHand: req.dominantHand,
      avatar: req.avatar,
      teamId: req.teamId,
      bio: req.bio,
      stats: { matches: 0, wins: 0, pointsScored: 0, mvps: 0 }
    };

    // 2. Persistência via repositório exclusivo da fatia
    await this.repository.save(newPlayer);

    // 3. Resposta moldada para esta operação
    return {
      id: newPlayer.id,
      name: newPlayer.name,
      position: newPlayer.position,
      skillLevel: newPlayer.skillLevel,
      message: 'Jogador criado com sucesso pela fatia Vertical Slice.'
    };
  }

  private createPlayerRetired() {
    this.addFounding();
  }

  private createPlayerWoman() {
    this.addFounding();
  }

  private addFounding() {
    var value = 1000;
  }
}
