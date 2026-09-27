import { PlayerData } from '../../shared/types/player.types.js';
import { getInitialPlayersClone } from '../../shared/data/initial-players.js';

export class CqrsDatabase {
  private static instance: CqrsDatabase;
  private players: Map<string, PlayerData> = new Map();

  private constructor() {
    const seed = getInitialPlayersClone();
    for (const item of seed) {
      this.players.set(item.id, item);
    }
  }

  public static getInstance(): CqrsDatabase {
    if (!CqrsDatabase.instance) {
      CqrsDatabase.instance = new CqrsDatabase();
    }
    return CqrsDatabase.instance;
  }

  public getRawMap(): Map<string, PlayerData> {
    return this.players;
  }
}
