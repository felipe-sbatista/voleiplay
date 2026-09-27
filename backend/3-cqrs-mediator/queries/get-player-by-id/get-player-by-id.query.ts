import { IRequest } from '../../core/mediator.interface.js';
import { PlayerData } from '../../../shared/types/player.types.js';

export class GetPlayerByIdQuery implements IRequest<PlayerData> {
  readonly _responseType?: PlayerData;

  constructor(public readonly id: string) {}
}
