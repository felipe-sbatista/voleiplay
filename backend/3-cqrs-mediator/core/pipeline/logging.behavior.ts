import { IPipelineBehavior, IRequest, NextHandlerDelegate } from '../mediator.interface.js';

export class LoggingBehavior implements IPipelineBehavior<any, any> {
  async handle(request: IRequest<any>, next: NextHandlerDelegate<any>): Promise<any> {
    const requestName = request.constructor.name;
    const isCommand = requestName.endsWith('Command');
    const isQuery = requestName.endsWith('Query');
    const typeLabel = isCommand ? 'COMMAND ✍️' : isQuery ? 'QUERY 🔍' : 'REQUEST 📨';

    const start = performance.now();
    console.log(`[Mediator] 🟢 Executando ${typeLabel} [${requestName}]...`);

    try {
      const response = await next();
      const elapsed = (performance.now() - start).toFixed(2);
      console.log(`[Mediator] ✅ Concluído [${requestName}] em ${elapsed}ms`);
      return response;
    } catch (error: any) {
      const elapsed = (performance.now() - start).toFixed(2);
      console.error(`[Mediator] ❌ Falha em [${requestName}] após ${elapsed}ms: ${error.message}`);
      throw error;
    }
  }
}
