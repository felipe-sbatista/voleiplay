import express from 'express';
import cors from 'cors';
import { createSagaRouter } from './saga.router.js';

const app = express();
const PORT = process.env.PORT || 3006;

app.use(cors());
app.use(express.json());

app.use('/api/saga', createSagaRouter());

app.get('/', (req, res) => {
  res.json({
    service: 'Saga Orchestrator Service',
    pattern: 'Orchestrated Distributed Transactions (Saga Pattern)',
    port: PORT,
    endpoints: {
      health: 'GET /api/saga/health',
      execute: 'POST /api/saga/prize-distribution/execute',
      executions: 'GET /api/saga/executions',
      getExecution: 'GET /api/saga/executions/:sagaId',
      clear: 'DELETE /api/saga/executions'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🔄 [Saga Orchestrator] Service running at http://localhost:${PORT}`);
});
