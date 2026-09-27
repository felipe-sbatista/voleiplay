import express from 'express';
import cors from 'cors';
import { createCqrsPlayerRouter } from './controllers/player.router.js';

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

app.use('/api', createCqrsPlayerRouter());

app.get('/', (req, res) => {
  res.json({
    name: 'VoleiPlay API - CQRS with Mediator Pattern',
    pattern: 'Command Query Responsibility Segregation + Mediator Pipeline',
    endpoints: {
      list: 'GET /api/players (Query)',
      get: 'GET /api/players/:id (Query)',
      create: 'POST /api/players (Command)',
      update: 'PUT /api/players/:id (Command)',
      delete: 'DELETE /api/players/:id (Command)'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🟢 [CQRS + Mediator] Server running at http://localhost:${PORT}`);
});
