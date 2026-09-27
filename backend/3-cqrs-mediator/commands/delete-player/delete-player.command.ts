import { IRequest } from '../../core/mediator.interface.js';

export class DeletePlayerCommand implements IRequest<boolean> {
  readonly _responseType?: boolean;

  constructor(public readonly id: string) {}
}
