export interface IRequest<TResponse = void> {
  readonly _responseType?: TResponse;
}

export type RequestConstructor<TRequest extends IRequest<any>> = new (...args: any[]) => TRequest;

export interface IRequestHandler<TRequest extends IRequest<TResponse>, TResponse = void> {
  handle(request: TRequest): Promise<TResponse>;
}

export type NextHandlerDelegate<TResponse> = () => Promise<TResponse>;

export interface IPipelineBehavior<TRequest extends IRequest<TResponse>, TResponse> {
  handle(request: TRequest, next: NextHandlerDelegate<TResponse>): Promise<TResponse>;
}

export interface IMediator {
  send<TResponse>(request: IRequest<TResponse>): Promise<TResponse>;
  registerHandler<TRequest extends IRequest<TResponse>, TResponse>(
    requestType: RequestConstructor<TRequest>,
    handler: IRequestHandler<TRequest, TResponse>
  ): void;
  addPipelineBehavior(behavior: IPipelineBehavior<any, any>): void;
}
