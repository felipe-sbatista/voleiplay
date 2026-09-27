import { IRequest } from '../../core/mediator.interface.js';
import { PlayerPosition } from '../../../shared/types/player.types.js';

export interface CreatePlayerResult {
  id: string;
  name: string;
  position: PlayerPosition;
}

export class CreatePlayerCommand implements IRequest<CreatePlayerResult> {
  readonly _responseType?: CreatePlayerResult;

  constructor(
    public readonly name: string,
    public readonly nickname: string | undefined,
    public readonly gender: 'M' | 'F' | 'Misto',
    public readonly position: PlayerPosition,
    public readonly skillLevel: number,
    public readonly dominantHand: 'Destro' | 'Canhoto' | 'Ambidestro',
    public readonly height?: number,
    public readonly avatar?: string,
    public readonly teamId?: string | null,
    public readonly bio?: string
  ) {}
}
