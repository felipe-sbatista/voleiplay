import express from 'express';
import cors from 'cors';
import { createEmailRouter } from './email.router.js';

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

app.use('/api/emails', createEmailRouter());

app.get('/', (req, res) => {
  res.json({
    service: 'Email Microservice (Mocked)',
    role: 'Educational Microservice for Saga Demonstrations',
    port: PORT,
    endpoints: {
      health: 'GET /api/emails/health',
      listSent: 'GET /api/emails',
      stats: 'GET /api/emails/stats',
      sendSingle: 'POST /api/emails/send',
      sendBatch: 'POST /api/emails/send-batch',
      compensate: 'POST /api/emails/compensate',
      clear: 'DELETE /api/emails'
    }
  });
});

app.listen(PORT, () => {
  console.log(`📧 [Email Service] Microservice running at http://localhost:${PORT}`);
});
