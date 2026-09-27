import { VerticalSliceDatabase } from '../../infrastructure/in-memory-db.js';
import { PlayerData } from '../../../shared/types/player.types.js';

export interface ICreatePlayerRepository {
  save(player: PlayerData): Promise<PlayerData>;
}

export class CreatePlayerRepository implements ICreatePlayerRepository {
  private db = VerticalSliceDatabase.getInstance().getTable();

  async save(player: PlayerData): Promise<PlayerData> {
    this.db.set(player.id, player);
    return { ...player };
  }
}
