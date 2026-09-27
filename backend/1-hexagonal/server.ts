import express from 'express';
import cors from 'cors';
import { createHexagonalPlayerRouter } from './adapters/inbound/http/player.router.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/players', createHexagonalPlayerRouter());

app.get('/', (req, res) => {
  res.json({
    name: 'VoleiPlay API - Hexagonal Architecture',
    pattern: 'Ports and Adapters',
    endpoints: {
      list: 'GET /api/players',
      get: 'GET /api/players/:id',
      create: 'POST /api/players',
      update: 'PUT /api/players/:id',
      delete: 'DELETE /api/players/:id'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🔷 [Hexagonal Architecture] Server running at http://localhost:${PORT}`);
});
