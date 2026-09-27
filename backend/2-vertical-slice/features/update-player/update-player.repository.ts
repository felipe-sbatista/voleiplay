import { VerticalSliceDatabase } from '../../infrastructure/in-memory-db.js';
import { PlayerData } from '../../../shared/types/player.types.js';

export interface IUpdatePlayerRepository {
  findById(id: string): Promise<PlayerData | null>;
  update(id: string, updates: Partial<PlayerData>): Promise<PlayerData | null>;
}

export class UpdatePlayerRepository implements IUpdatePlayerRepository {
  private db = VerticalSliceDatabase.getInstance().getTable();

  async findById(id: string): Promise<PlayerData | null> {
    const player = this.db.get(id);
    return player ? { ...player } : null;
  }

  async update(id: string, updates: Partial<PlayerData>): Promise<PlayerData | null> {
    const existing = this.db.get(id);
    if (!existing) return null;

    const updated = { ...existing, ...updates };
    this.db.set(id, updated);
    return { ...updated };
  }
}
