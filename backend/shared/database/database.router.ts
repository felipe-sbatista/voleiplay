import { Router, Request, Response } from 'express';
import { DatabaseManager } from './database-manager.js';
import { PostgresClient } from './postgres.client.js';
import { MongoClientWrapper } from './mongo.client.js';
import { RedisClientWrapper } from './redis.client.js';
import { INITIAL_PLAYERS } from '../data/initial-players.js';
import { Observability } from '../observability/apm.js';

export function createDatabaseRouter(): Router {
  const router = Router();
  const dbManager = DatabaseManager.getInstance();
  const pgClient = PostgresClient.getInstance();
  const mongoClient = MongoClientWrapper.getInstance();
  const redisClient = RedisClientWrapper.getInstance();

  /**
   * Status e Saúde unificada de todos os bancos de dados
   */
  router.get('/status', async (req: Request, res: Response) => {
    try {
      const report = await dbManager.getHealthReport();
      res.json(report);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * Benchmark Comparativo de Latência entre os Motores
   */
  router.get('/benchmark', async (req: Request, res: Response) => {
    Observability.setLabel('labModule', 'database-benchmark');
    try {
      const benchmark = await dbManager.runComparativeBenchmark();
      res.json(benchmark);
    } catch (err: any) {
      Observability.captureError(err, { route: '/database/benchmark' });
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * Demonstração Prática do Padrão Cache-Aside com Redis
   */
  router.get('/cache-demo/player/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const cacheKey = `cache:player:${id}`;
    const start = performance.now();

    Observability.setLabel('labModule', 'cache-aside');
    Observability.setLabel('player_id', id);
    Observability.setLabel('cache_key', cacheKey);

    // 1. Tenta buscar no Redis (Cache)
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      const latencyMs = Number((performance.now() - start).toFixed(2));
      Observability.setLabel('cache_status', 'HIT');
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Response-Time', `${latencyMs}ms`);
      return res.json({
        cacheStatus: 'HIT ⚡ (Retornado instantaneamente da Memória RAM)',
        source: 'Redis',
        latencyMs,
        ttlSecondsRemaining: 'Ativo (TTL padrão 45s)',
        data: cachedData
      });
    }

    // 2. Cache MISS: Busca no banco de dados (PostgreSQL ou Fallback In-Memory)
    Observability.setLabel('cache_status', 'MISS');
    let player: any = null;
    let source = 'PostgreSQL';

    try {
      const pgRows = await pgClient.query('SELECT * FROM players WHERE id = $1', [id]);
      if (pgRows && pgRows.length > 0) {
        const row = pgRows[0];
        player = {
          id: row.id,
          name: row.name,
          nickname: row.nickname,
          gender: row.gender,
          position: row.position,
          skillLevel: row.skill_level,
          height: row.height,
          dominantHand: row.dominant_hand,
          bio: row.bio
        };
      }
    } catch {
      // Fallback gracioso se o PostgreSQL estiver offline
    }

    if (!player) {
      source = 'Fallback In-Memory';
      player = INITIAL_PLAYERS.find((p) => p.id === id) || null;
    }

    if (!player) {
      return res.status(404).json({ error: `Jogador com ID '${id}' não encontrado.` });
    }

    // 3. Salva no Redis com TTL de 45 segundos para as próximas requisições
    await redisClient.set(cacheKey, player, 45);

    const latencyMs = Number((performance.now() - start).toFixed(2));
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('X-Response-Time', `${latencyMs}ms`);

    return res.json({
      cacheStatus: 'MISS 💾 (Dado lido do banco de dados e agora armazenado no Redis com TTL de 45s)',
      source,
      latencyMs,
      data: player
    });
  });

  /**
   * Invalidação Manual de Cache (demonstração de ciclo de vida de dados)
   */
  router.delete('/cache-demo/player/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const cacheKey = `cache:player:${id}`;
    Observability.setLabel('labModule', 'cache-invalidation');
    Observability.setLabel('player_id', id);

    const deleted = await redisClient.del(cacheKey);

    res.json({
      message: deleted
        ? `Chave '${cacheKey}' invalidada do Redis com sucesso.`
        : `Chave '${cacheKey}' não estava presente no Redis.`,
      key: cacheKey,
      invalidated: deleted
    });
  });

  /**
   * Demonstração de Transação ACID com PostgreSQL
   */
  router.post('/relational/transaction', async (req: Request, res: Response) => {
    const { amountCents = 50000, simulateError = false } = req.body || {};
    Observability.setLabel('labModule', 'acid-transaction');
    Observability.setLabel('acid_amount_cents', Number(amountCents));
    Observability.setLabel('acid_simulate_error', Boolean(simulateError));

    try {
      await pgClient.initSchema();
      const result = await pgClient.demoAcidTransaction({
        walletId: 'wallet-circuito-2026',
        amountCents: Number(amountCents),
        simulateError: Boolean(simulateError)
      });
      Observability.setLabel('acid_result', result.acidStep);
      res.json(result);
    } catch (err: any) {
      Observability.captureError(err, { route: '/database/relational/transaction' });
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * Demonstração de Documento NoSQL Flexível no MongoDB (Scout de Partida)
   */
  router.post('/nosql/scout', async (req: Request, res: Response) => {
    Observability.setLabel('labModule', 'nosql-scout');
    try {
      const result = await mongoClient.insertMatchScout(req.body || {});
      res.status(201).json({
        message: 'Scout de partida registrado com sucesso no MongoDB (coleção match_scouts)',
        result
      });
    } catch (err: any) {
      Observability.captureError(err, { route: '/database/nosql/scout' });
      res.status(500).json({
        error: 'Falha ao salvar scout no MongoDB',
        details: err.message
      });
    }
  });

  /**
   * Listagem de Scouts do MongoDB
   */
  router.get('/nosql/scouts', async (req: Request, res: Response) => {
    try {
      const scouts = await mongoClient.listScouts(10);
      res.json({ total: scouts.length, scouts });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
