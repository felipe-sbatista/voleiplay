import { VerticalSliceDatabase } from '../../infrastructure/in-memory-db.js';
import { PlayerData } from '../../../shared/types/player.types.js';

export interface ListFilter {
  position?: string;
  gender?: string;
  search?: string;
}

export interface IListPlayersRepository {
  search(filter?: ListFilter): Promise<PlayerData[]>;
}

export class ListPlayersRepository implements IListPlayersRepository {
  private db = VerticalSliceDatabase.getInstance().getTable();

  async search(filter?: ListFilter): Promise<PlayerData[]> {
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
