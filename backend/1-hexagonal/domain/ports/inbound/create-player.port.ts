import { PlayerData } from '../../../../shared/types/player.types.js';

export interface CreatePlayerCommand {
  name: string;
  nickname?: string;
  gender: 'M' | 'F' | 'Misto';
  position: PlayerData['position'];
  skillLevel: number;
  height?: number;
  dominantHand: 'Destro' | 'Canhoto' | 'Ambidestro';
  avatar?: string;
  teamId?: string | null;
  bio?: string;
}

export interface CreatePlayerPort {
  execute(command: CreatePlayerCommand): Promise<PlayerData>;
}
