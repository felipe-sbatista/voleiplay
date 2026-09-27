import { CqrsDatabase } from './cqrs-database.js';
import { PlayerData } from '../../shared/types/player.types.js';

export interface IPlayerWriteRepository {
  save(player: PlayerData): Promise<void>;
  update(id: string, player: Partial<PlayerData>): Promise<PlayerData | null>;
  delete(id: string): Promise<boolean>;
  getForUpdate(id: string): Promise<PlayerData | null>;
}

export class PlayerWriteRepository implements IPlayerWriteRepository {
  private db = CqrsDatabase.getInstance().getRawMap();

  async save(player: PlayerData): Promise<void> {
    this.db.set(player.id, player);
  }

  async getForUpdate(id: string): Promise<PlayerData | null> {
    const data = this.db.get(id);
    return data ? { ...data } : null;
  }

  async update(id: string, partial: Partial<PlayerData>): Promise<PlayerData | null> {
    const existing = this.db.get(id);
    if (!existing) return null;

    const updated = { ...existing, ...partial };
    this.db.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.db.delete(id);
  }
}
