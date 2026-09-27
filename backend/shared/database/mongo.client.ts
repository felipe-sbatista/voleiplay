import { MongoClient, Db } from 'mongodb';
import { Observability } from '../observability/apm.js';

export interface MongoStatus {
  connected: boolean;
  latencyMs: number;
  database: string;
  version?: string;
  error?: string;
}

export interface MatchScoutDocument {
  matchId: string;
  tournament: string;
  teams: {
    teamA: { player1: string; player2: string; score: number };
    teamB: { player1: string; player2: string; score: number };
  };
  sets: Array<{
    setNumber: number;
    scoreA: number;
    scoreB: number;
    durationMinutes: number;
  }>;
  advancedStats: {
    aces: Record<string, number>;
    blocks: Record<string, number>;
    attackEfficiency: Record<string, number>;
    sandHeatmapPoints?: Array<{ x: number; y: number; type: 'spike' | 'block' | 'dig' }>;
  };
  recordedAt: Date;
}

export class MongoClientWrapper {
  private static instance: MongoClientWrapper;
  private client: MongoClient | null = null;
  private db: Db | null = null;

  private constructor() {
    this.initClient();
  }

  public static getInstance(): MongoClientWrapper {
    if (!MongoClientWrapper.instance) {
      MongoClientWrapper.instance = new MongoClientWrapper();
    }
    return MongoClientWrapper.instance;
  }

  private initClient(): void {
    const host = process.env.MONGO_HOST || 'localhost';
    const port = process.env.MONGO_PORT || '27017';
    const user = process.env.MONGO_USER || 'voleiplay';
    const password = process.env.MONGO_PASSWORD || 'voleiplay_pass';
    const dbName = process.env.MONGO_DB || 'voleiplay';

    const uri = `mongodb://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${dbName}?authSource=admin`;

    this.client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000
    });
    this.db = this.client.db(dbName);
  }

  /**
   * Testa conectividade com o MongoDB e mede a latência
   */
  public async ping(): Promise<MongoStatus> {
    if (!this.client) this.initClient();
    const start = performance.now();
    try {
      const adminDb = this.client!.db('admin');
      const buildInfo = await adminDb.command({ buildInfo: 1 });
      const latencyMs = Number((performance.now() - start).toFixed(2));

      return {
        connected: true,
        latencyMs,
        database: process.env.MONGO_DB || 'voleiplay',
        version: buildInfo.version
      };
    } catch (err: any) {
      const latencyMs = Number((performance.now() - start).toFixed(2));
      return {
        connected: false,
        latencyMs,
        database: process.env.MONGO_DB || 'voleiplay',
        error: err.message || 'Falha ao conectar no MongoDB'
      };
    }
  }

  /**
   * Insere um scout técnico de partida (documento NoSQL rico/aninhado) instrumentado no APM
   */
  public async insertMatchScout(scout: Partial<MatchScoutDocument>): Promise<any> {
    if (!this.client || !this.db) this.initClient();
    const span = Observability.startSpan('MongoDB: insertMatchScout', 'db', 'mongodb', 'insert');
    span?.setLabel('collection', 'match_scouts');

    try {
      const collection = this.db!.collection('match_scouts');
      const doc: MatchScoutDocument = {
        matchId: scout.matchId || `match-${Date.now()}`,
        tournament: scout.tournament || 'Circuito Brasileiro de Vôlei de Praia',
        teams: scout.teams || {
          teamA: { player1: 'Alison Mamute', player2: 'Bruno Schmidt', score: 2 },
          teamB: { player1: 'Evandro Gonçalves', player2: 'Arthur Lanci', score: 1 }
        },
        sets: scout.sets || [
          { setNumber: 1, scoreA: 21, scoreB: 18, durationMinutes: 22 },
          { setNumber: 2, scoreA: 19, scoreB: 21, durationMinutes: 24 },
          { setNumber: 3, scoreA: 15, scoreB: 12, durationMinutes: 16 }
        ],
        advancedStats: scout.advancedStats || {
          aces: { 'p-1': 4, 'p-2': 1 },
          blocks: { 'p-1': 7, 'p-3': 5 },
          attackEfficiency: { 'p-1': 0.68, 'p-2': 0.54 },
          sandHeatmapPoints: [
            { x: 12, y: 34, type: 'spike' },
            { x: 45, y: 80, type: 'block' },
            { x: 67, y: 22, type: 'dig' }
          ]
        },
        recordedAt: new Date()
      };

      const result = await collection.insertOne(doc);
      span?.setLabel('insertedId', String(result.insertedId));
      return { insertedId: result.insertedId, document: doc };
    } catch (err: any) {
      Observability.captureError(err, { context: 'MongoDB insertMatchScout' });
      throw err;
    } finally {
      span?.end();
    }
  }

  /**
   * Lista os últimos scouts registrados instrumentado no APM
   */
  public async listScouts(limit: number = 5): Promise<any[]> {
    if (!this.client || !this.db) this.initClient();
    const span = Observability.startSpan('MongoDB: listScouts', 'db', 'mongodb', 'find');
    span?.setLabel('collection', 'match_scouts');
    span?.setLabel('limit', limit);

    try {
      const collection = this.db!.collection('match_scouts');
      const docs = await collection.find({}).sort({ recordedAt: -1 }).limit(limit).toArray();
      span?.setLabel('resultsCount', docs.length);
      return docs;
    } catch (err: any) {
      Observability.captureError(err, { context: 'MongoDB listScouts' });
      throw err;
    } finally {
      span?.end();
    }
  }
}
