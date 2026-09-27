import { VerticalSliceDatabase } from '../../infrastructure/in-memory-db.js';
import { PlayerData } from '../../../shared/types/player.types.js';

export interface IGetPlayerByIdRepository {
  findById(id: string): Promise<PlayerData | null>;
}

export class GetPlayerByIdRepository implements IGetPlayerByIdRepository {
  private db = VerticalSliceDatabase.getInstance().getTable();

  async findById(id: string): Promise<PlayerData | null> {
    const player = this.db.get(id);
    return player ? { ...player } : null;
  }
}
