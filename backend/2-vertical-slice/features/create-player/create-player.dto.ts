import { PlayerPosition } from '../../../shared/types/player.types.js';

export interface CreatePlayerRequest {
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

export interface CreatePlayerResponse {
  id: string;
  name: string;
  position: PlayerPosition;
  skillLevel: number;
  message: string;
}
