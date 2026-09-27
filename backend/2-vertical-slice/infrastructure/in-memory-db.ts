import { PlayerData } from '../../shared/types/player.types.js';
import { getInitialPlayersClone } from '../../shared/data/initial-players.js';

export class VerticalSliceDatabase {
  private static instance: VerticalSliceDatabase;
  private players: Map<string, PlayerData> = new Map();

  private constructor() {
    const seed = getInitialPlayersClone();
    for (const item of seed) {
      this.players.set(item.id, item);
    }
  }

  public static getInstance(): VerticalSliceDatabase {
    if (!VerticalSliceDatabase.instance) {
      VerticalSliceDatabase.instance = new VerticalSliceDatabase();
    }
    return VerticalSliceDatabase.instance;
  }

  public getTable(): Map<string, PlayerData> {
    return this.players;
  }
}
