import { PlayerPosition } from '../../../../shared/types/player.types.js';

export interface CreatePlayerDTO {
  name: string;
  nickname?: string;
  gender: 'M' | 'F' | 'Misto';
  position: PlayerPosition;
  skillLevel: number;
  height?: number;
  dominantHand: 'Destro' | 'Canhoto' | 'Ambidestro';
  avatar?: string;
  teamId?: string | null;
  bio?: string;
}

export interface UpdatePlayerDTO {
  name?: string;
  nickname?: string;
  gender?: 'M' | 'F' | 'Misto';
  position?: PlayerPosition;
  skillLevel?: number;
  height?: number;
  dominantHand?: 'Destro' | 'Canhoto' | 'Ambidestro';
  avatar?: string;
  teamId?: string | null;
  bio?: string;
}
