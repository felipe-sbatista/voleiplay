import { PlayerData } from '../../../../shared/types/player.types.js';

export interface GetPlayerPort {
  execute(id: string): Promise<PlayerData>;
}
