import { VerticalSliceDatabase } from '../../infrastructure/in-memory-db.js';

export interface IDeletePlayerRepository {
  exists(id: string): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}

export class DeletePlayerRepository implements IDeletePlayerRepository {
  private db = VerticalSliceDatabase.getInstance().getTable();

  async exists(id: string): Promise<boolean> {
    return this.db.has(id);
  }

  async delete(id: string): Promise<boolean> {
    return this.db.delete(id);
  }
}
