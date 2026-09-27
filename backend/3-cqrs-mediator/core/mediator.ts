import {
  IMediator,
  IRequest,
  IRequestHandler,
  IPipelineBehavior,
  RequestConstructor,
  NextHandlerDelegate
} from './mediator.interface.js';

export class Mediator implements IMediator {
  private handlers = new Map<string, IRequestHandler<any, any>>();
  private pipelineBehaviors: IPipelineBehavior<any, any>[] = [];

  public registerHandler<TRequest extends IRequest<TResponse>, TResponse>(
    requestType: RequestConstructor<TRequest>,
    handler: IRequestHandler<TRequest, TResponse>
  ): void {
    const key = requestType.name;
    if (this.handlers.has(key)) {
      throw new Error(`Handler para '${key}' já foi registrado no Mediator.`);
    }
    this.handlers.set(key, handler);
  }

  public addPipelineBehavior(behavior: IPipelineBehavior<any, any>): void {
    this.pipelineBehaviors.push(behavior);
  }

  public async send<TResponse>(request: IRequest<TResponse>): Promise<TResponse> {
    const requestName = request.constructor.name;
    const handler = this.handlers.get(requestName);

    if (!handler) {
      throw new Error(`Nenhum Handler registrado no Mediator para o comando/consulta: '${requestName}'.`);
    }

    // Composição do pipeline de behaviors (estilo MediatR / onion / middleware)
    const runPipeline = (index: number): Promise<TResponse> => {
      if (index < this.pipelineBehaviors.length) {
        const behavior = this.pipelineBehaviors[index];
        const next: NextHandlerDelegate<TResponse> = () => runPipeline(index + 1);
        return behavior.handle(request, next);
      }
      return handler.handle(request);
    };

    return runPipeline(0);
  }
}
