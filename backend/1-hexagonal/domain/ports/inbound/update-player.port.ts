import { PlayerData } from '../../../../shared/types/player.types.js';

export interface UpdatePlayerCommand {
  id: string;
  data: Partial<Omit<PlayerData, 'id'>>;
}

export interface UpdatePlayerPort {
  execute(command: UpdatePlayerCommand): Promise<PlayerData>;
}
