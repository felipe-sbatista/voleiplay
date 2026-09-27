import { CqrsDatabase } from './cqrs-database.js';
import { PlayerData } from '../../shared/types/player.types.js';

export interface PlayerReadFilter {
  position?: string;
  gender?: string;
  search?: string;
}

export interface IPlayerReadRepository {
  findById(id: string): Promise<PlayerData | null>;
  search(filter?: PlayerReadFilter): Promise<PlayerData[]>;
}

export class PlayerReadRepository implements IPlayerReadRepository {
  private db = CqrsDatabase.getInstance().getRawMap();

  async findById(id: string): Promise<PlayerData | null> {
    const data = this.db.get(id);
    return data ? { ...data } : null;
  }

  async search(filter?: PlayerReadFilter): Promise<PlayerData[]> {
    let list = Array.from(this.db.values());

    if (filter?.position) {
      list = list.filter(p => p.position.toLowerCase() === filter.position?.toLowerCase());
    }
    if (filter?.gender) {
      list = list.filter(p => p.gender.toUpperCase() === filter.gender?.toUpperCase());
    }
    if (filter?.search) {
      const term = filter.search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.nickname?.toLowerCase().includes(term)
      );
    }

    return list.map(item => ({ ...item }));
  }
}
