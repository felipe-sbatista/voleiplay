import { IRequest } from '../../core/mediator.interface.js';
import { PlayerData } from '../../../shared/types/player.types.js';

export class ListPlayersQuery implements IRequest<PlayerData[]> {
  readonly _responseType?: PlayerData[];

  constructor(
    public readonly position?: string,
    public readonly gender?: string,
    public readonly search?: string
  ) {}
}
