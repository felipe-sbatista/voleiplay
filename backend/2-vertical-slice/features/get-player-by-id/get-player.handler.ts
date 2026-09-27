import { IGetPlayerByIdRepository, GetPlayerByIdRepository } from './get-player.repository.js';
import { PlayerData } from '../../../shared/types/player.types.js';

export class GetPlayerByIdHandler {
  constructor(private readonly repository: IGetPlayerByIdRepository = new GetPlayerByIdRepository()) {}

  async handle(id: string): Promise<PlayerData> {
    const player = await this.repository.findById(id);
    if (!player) {
      throw new Error(`Jogador com id '${id}' não encontrado.`);
    }
    return player;
  }
}
