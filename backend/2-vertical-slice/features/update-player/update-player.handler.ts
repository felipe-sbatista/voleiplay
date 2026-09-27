import { IUpdatePlayerRepository, UpdatePlayerRepository } from './update-player.repository.js';
import { UpdatePlayerRequest } from './update-player.dto.js';
import { PlayerData } from '../../../shared/types/player.types.js';

export class UpdatePlayerHandler {
  constructor(private readonly repository: IUpdatePlayerRepository = new UpdatePlayerRepository()) {}

  async handle(id: string, req: UpdatePlayerRequest): Promise<PlayerData> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error(`Jogador com id '${id}' não encontrado.`);
    }

    if (req.name !== undefined) {
      if (req.name.trim().length < 3) {
        throw new Error('Nome do jogador deve ter ao menos 3 caracteres.');
      }
      req.name = req.name.trim();
    }

    if (req.skillLevel !== undefined) {
      if (req.skillLevel < 1 || req.skillLevel > 5) {
        throw new Error('Nível de habilidade deve ser entre 1 e 5.');
      }
    }

    if (req.nickname !== undefined) req.nickname = req.nickname?.trim();

    const updated = await this.repository.update(id, req);
    if (!updated) {
      throw new Error(`Falha ao atualizar jogador '${id}'.`);
    }

    return updated;
  }
}
