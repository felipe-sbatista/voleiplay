import { SagaExecution } from './saga.types.js';

export class SagaLogRepository {
  private executions: Map<string, SagaExecution> = new Map();

  save(execution: SagaExecution): SagaExecution {
    this.executions.set(execution.sagaId, JSON.parse(JSON.stringify(execution)));
    return execution;
  }

  findById(sagaId: string): SagaExecution | undefined {
    const item = this.executions.get(sagaId);
    return item ? JSON.parse(JSON.stringify(item)) : undefined;
  }

  findAll(): SagaExecution[] {
    return Array.from(this.executions.values()).sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  }

  clear(): void {
    this.executions.clear();
  }
}

export const sagaLogRepository = new SagaLogRepository();
