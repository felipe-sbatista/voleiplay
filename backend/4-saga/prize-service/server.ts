import express from 'express';
import cors from 'cors';
import { createPrizeRouter } from './prize.router.js';

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

app.use('/api/prizes', createPrizeRouter());

app.get('/', (req, res) => {
  res.json({
    service: 'Prize Batch Processing Microservice',
    role: 'Batch payments and tournament budget management',
    port: PORT,
    endpoints: {
      health: 'GET /api/prizes/health',
      tournaments: 'GET /api/prizes/tournaments',
      listBatches: 'GET /api/prizes/batches',
      getBatch: 'GET /api/prizes/batches/:batchId',
      createBatch: 'POST /api/prizes/batches',
      processBatch: 'POST /api/prizes/batches/:batchId/process',
      compensateBatch: 'POST /api/prizes/batches/:batchId/compensate'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🏆 [Prize Service] Microservice running at http://localhost:${PORT}`);
});
