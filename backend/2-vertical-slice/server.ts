import express from 'express';
import cors from 'cors';
import { createVerticalSliceRouter } from './router.js';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.use('/api', createVerticalSliceRouter());

app.get('/', (req, res) => {
  res.json({
    name: 'VoleiPlay API - Vertical Slice Architecture',
    pattern: 'Feature Slices (Self-contained endpoints & handlers)',
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
  console.log(`🔶 [Vertical Slice] Server running at http://localhost:${PORT}`);
});
