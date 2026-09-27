import { PostgresClient, PostgresStatus } from './postgres.client.js';
import { MongoClientWrapper, MongoStatus } from './mongo.client.js';
import { RedisClientWrapper, RedisStatus } from './redis.client.js';

export interface DatabaseHealthReport {
  timestamp: string;
  postgres: PostgresStatus & { role: string; type: string };
  mongodb: MongoStatus & { role: string; type: string };
  redis: RedisStatus & { role: string; type: string };
  elasticsearch: {
    connected: boolean;
    latencyMs: number;
    clusterName?: string;
    version?: string;
    error?: string;
    role: string;
    type: string;
  };
}

export interface BenchmarkResult {
  engine: 'PostgreSQL' | 'MongoDB' | 'Redis';
  category: 'Relacional (ACID)' | 'NoSQL Documental' | 'In-Memory Key-Value';
  writeMs: number;
  readMs: number;
  totalMs: number;
  status: 'SUCCESS' | 'SKIPPED_OFFLINE';
  error?: string;
}

export class DatabaseManager {
  private static instance: DatabaseManager;
  private pgClient = PostgresClient.getInstance();
  private mongoClient = MongoClientWrapper.getInstance();
  private redisClient = RedisClientWrapper.getInstance();

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Inicializa esquemas e tabelas de bancos disponíveis
   */
  public async initDatabases(): Promise<void> {
    try {
      await this.pgClient.initSchema();
    } catch {
      // Falha silenciosa permitida para resiliência
    }
  }

  /**
   * Realiza verificação de saúde unificada dos 4 motores de dados
   */
  public async getHealthReport(): Promise<DatabaseHealthReport> {
    const esHost = process.env.ELASTICSEARCH_HOST || 'http://localhost:9200';

    // Checagem em paralelo de todos os serviços
    const [pgStatus, mongoStatus, redisStatus, esStatus] = await Promise.all([
      this.pgClient.ping(),
      this.mongoClient.ping(),
      this.redisClient.ping(),
      this.pingElasticsearch(esHost)
    ]);

    return {
      timestamp: new Date().toISOString(),
      postgres: {
        ...pgStatus,
        role: 'Transacional, Carteiras e Relacionamentos Estritos (ACID)',
        type: 'Relacional SQL (PostgreSQL 16 Alpine)'
      },
      mongodb: {
        ...mongoStatus,
        role: 'Scouts Técnicos, Lances de Partidas e Documentos Flexíveis (BASE)',
        type: 'NoSQL Orientado a Documentos (MongoDB 7)'
      },
      redis: {
        ...redisStatus,
        role: 'Cache-Aside, Sessões Rápidas e Invalidação (<1ms de latência)',
        type: 'In-Memory Key-Value & Cache (Redis 7 Alpine)'
      },
      elasticsearch: {
        ...esStatus,
        role: 'Busca Textual Full-Text de Atletas e Agregação de Telemetria APM',
        type: 'Search Engine & Log Analytics (Elasticsearch 7.17)'
      }
    };
  }

  private async pingElasticsearch(url: string) {
    const start = performance.now();
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
      const latencyMs = Number((performance.now() - start).toFixed(2));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: any = await res.json();
      return {
        connected: true,
        latencyMs,
        clusterName: data.cluster_name,
        version: data.version?.number
      };
    } catch (err: any) {
      const latencyMs = Number((performance.now() - start).toFixed(2));
      return {
        connected: false,
        latencyMs,
        error: err.message || 'Elasticsearch offline'
      };
    }
  }

  /**
   * Executa um benchmark comparativo de escrita e leitura
   * nos 3 bancos de dados com o mesmo payload didático
   */
  public async runComparativeBenchmark(): Promise<{
    results: BenchmarkResult[];
    analysis: string;
  }> {
    const testId = `bench-${Date.now()}`;
    const testPayload = {
      id: testId,
      name: 'Benchmark Atleta Teste',
      position: 'Defensor',
      skillLevel: 5,
      timestamp: new Date().toISOString()
    };

    const results: BenchmarkResult[] = [];

    // 1. Benchmark Redis (In-Memory)
    try {
      const startWrite = performance.now();
      const setOk = await this.redisClient.set(`bench:${testId}`, testPayload, 60);
      const writeMs = Number((performance.now() - startWrite).toFixed(2));

      if (setOk) {
        const startRead = performance.now();
        await this.redisClient.get(`bench:${testId}`);
        const readMs = Number((performance.now() - startRead).toFixed(2));
        results.push({
          engine: 'Redis',
          category: 'In-Memory Key-Value',
          writeMs,
          readMs,
          totalMs: Number((writeMs + readMs).toFixed(2)),
          status: 'SUCCESS'
        });
        await this.redisClient.del(`bench:${testId}`);
      } else {
        results.push({
          engine: 'Redis',
          category: 'In-Memory Key-Value',
          writeMs: 0,
          readMs: 0,
          totalMs: 0,
          status: 'SKIPPED_OFFLINE',
          error: 'Redis offline'
        });
      }
    } catch (err: any) {
      results.push({
        engine: 'Redis',
        category: 'In-Memory Key-Value',
        writeMs: 0,
        readMs: 0,
        totalMs: 0,
        status: 'SKIPPED_OFFLINE',
        error: err.message
      });
    }

    // 2. Benchmark MongoDB (NoSQL Documental)
    try {
      const startWrite = performance.now();
      const insertRes = await this.mongoClient.insertMatchScout({
        matchId: testId,
        tournament: 'Benchmark Test Cup',
        advancedStats: {
          aces: { test: 1 },
          blocks: { test: 2 },
          attackEfficiency: { test: 0.8 }
        }
      });
      const writeMs = Number((performance.now() - startWrite).toFixed(2));

      const startRead = performance.now();
      await this.mongoClient.listScouts(1);
      const readMs = Number((performance.now() - startRead).toFixed(2));

      results.push({
        engine: 'MongoDB',
        category: 'NoSQL Documental',
        writeMs,
        readMs,
        totalMs: Number((writeMs + readMs).toFixed(2)),
        status: 'SUCCESS'
      });
    } catch (err: any) {
      results.push({
        engine: 'MongoDB',
        category: 'NoSQL Documental',
        writeMs: 0,
        readMs: 0,
        totalMs: 0,
        status: 'SKIPPED_OFFLINE',
        error: err.message
      });
    }

    // 3. Benchmark PostgreSQL (Relacional ACID com Journaling/WAL)
    try {
      await this.pgClient.initSchema();
      const startWrite = performance.now();
      await this.pgClient.query(
        `INSERT INTO players (id, name, gender, position, skill_level, height, dominant_hand)
         VALUES ($1, $2, 'M', 'Defensor', 5, 190, 'Destro')
         ON CONFLICT (id) DO UPDATE SET name = $2`,
        [testId, testPayload.name]
      );
      const writeMs = Number((performance.now() - startWrite).toFixed(2));

      const startRead = performance.now();
      await this.pgClient.query('SELECT * FROM players WHERE id = $1', [testId]);
      const readMs = Number((performance.now() - startRead).toFixed(2));

      // Limpa dado de teste
      await this.pgClient.query('DELETE FROM players WHERE id = $1', [testId]);

      results.push({
        engine: 'PostgreSQL',
        category: 'Relacional (ACID)',
        writeMs,
        readMs,
        totalMs: Number((writeMs + readMs).toFixed(2)),
        status: 'SUCCESS'
      });
    } catch (err: any) {
      results.push({
        engine: 'PostgreSQL',
        category: 'Relacional (ACID)',
        writeMs: 0,
        readMs: 0,
        totalMs: 0,
        status: 'SKIPPED_OFFLINE',
        error: err.message
      });
    }

    const analysis = 
      'O Redis opera em memória RAM (<1ms), eliminando I/O de disco. O MongoDB otimiza escritas com journaling em lote. O PostgreSQL garante durabilidade total com WAL (Write-Ahead Logging) e conformidade ACID, o que adiciona pequeno overhead de I/O em troca de consistência estrita.';

    return { results, analysis };
  }
}
