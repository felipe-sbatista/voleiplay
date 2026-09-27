import { IRequest } from '../../core/mediator.interface.js';
import { PlayerData, PlayerPosition } from '../../../shared/types/player.types.js';

export interface UpdatePlayerData {
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

export class UpdatePlayerCommand implements IRequest<PlayerData> {
  readonly _responseType?: PlayerData;

  constructor(
    public readonly id: string,
    public readonly data: UpdatePlayerData
  ) {}
}
