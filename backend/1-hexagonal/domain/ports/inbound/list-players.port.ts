import { PlayerData } from '../../../../shared/types/player.types.js';

export interface ListPlayersFilter {
  position?: string;
  gender?: string;
  search?: string;
}

export interface ListPlayersPort {
  execute(filter?: ListPlayersFilter): Promise<PlayerData[]>;
}
