import pg from 'pg';
import { INITIAL_PLAYERS } from '../data/initial-players.js';
import { Observability } from '../observability/apm.js';

const { Pool } = pg;

export interface PostgresStatus {
  connected: boolean;
  latencyMs: number;
  database: string;
  version?: string;
  error?: string;
}

export class PostgresClient {
  private static instance: PostgresClient;
  private pool: pg.Pool | null = null;
  private isInitialized = false;

  private constructor() {
    this.initPool();
  }

  public static getInstance(): PostgresClient {
    if (!PostgresClient.instance) {
      PostgresClient.instance = new PostgresClient();
    }
    return PostgresClient.instance;
  }

  private initPool(): void {
    const host = process.env.POSTGRES_HOST || 'localhost';
    const port = Number(process.env.POSTGRES_PORT) || 5432;
    const user = process.env.POSTGRES_USER || 'voleiplay';
    const password = process.env.POSTGRES_PASSWORD || 'voleiplay_pass';
    const database = process.env.POSTGRES_DB || 'voleiplay';

    this.pool = new Pool({
      host,
      port,
      user,
      password,
      database,
      connectionTimeoutMillis: 2000,
      max: 10,
      idleTimeoutMillis: 10000
    });

    this.pool.on('error', (err) => {
      // Evita unhandled error crash em caso de disconnect
      console.warn('⚠️ [PostgreSQL Pool Warning]:', err.message);
    });
  }

  /**
   * Testa conectividade e mede a latência em milissegundos
   */
  public async ping(): Promise<PostgresStatus> {
    if (!this.pool) this.initPool();
    const start = performance.now();
    try {
      const client = await this.pool!.connect();
      try {
        const res = await client.query('SELECT version()');
        const latencyMs = Number((performance.now() - start).toFixed(2));
        return {
          connected: true,
          latencyMs,
          database: process.env.POSTGRES_DB || 'voleiplay',
          version: res.rows[0]?.version?.split(' ')[0] + ' ' + res.rows[0]?.version?.split(' ')[1]
        };
      } finally {
        client.release();
      }
    } catch (err: any) {
      const latencyMs = Number((performance.now() - start).toFixed(2));
      return {
        connected: false,
        latencyMs,
        database: process.env.POSTGRES_DB || 'voleiplay',
        error: err.message || 'Falha ao conectar no PostgreSQL'
      };
    }
  }

  /**
   * Inicializa esquema relacional (Tabela players e DDL)
   */
  public async initSchema(): Promise<void> {
    if (this.isInitialized) return;
    try {
      const client = await this.pool!.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS players (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            nickname VARCHAR(100),
            gender VARCHAR(10) NOT NULL,
            position VARCHAR(50) NOT NULL,
            skill_level INT NOT NULL CHECK (skill_level BETWEEN 1 AND 5),
            height INT NOT NULL,
            dominant_hand VARCHAR(20) NOT NULL,
            bio TEXT,
            avatar_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS tournament_wallets (
            id VARCHAR(50) PRIMARY KEY,
            tournament_name VARCHAR(150) NOT NULL,
            balance_cents BIGINT NOT NULL CHECK (balance_cents >= 0),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);

        // Seed inicial de carteira para demonstrar transações ACID
        const walletCheck = await client.query('SELECT count(*) FROM tournament_wallets');
        if (Number(walletCheck.rows[0]?.count) === 0) {
          await client.query(`
            INSERT INTO tournament_wallets (id, tournament_name, balance_cents)
            VALUES ('wallet-circuito-2026', 'Circuito Brasileiro de Vôlei de Praia', 5000000);
          `);
        }

        // Seed inicial de jogadores se a tabela estiver vazia
        const countRes = await client.query('SELECT count(*) FROM players');
        if (Number(countRes.rows[0]?.count) === 0) {
          for (const p of INITIAL_PLAYERS) {
            await client.query(
              `INSERT INTO players (id, name, nickname, gender, position, skill_level, height, dominant_hand, bio, avatar_url)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
               ON CONFLICT (id) DO NOTHING`,
              [p.id, p.name, p.nickname, p.gender, p.position, p.skillLevel, p.height, p.dominantHand, p.bio, p.avatar]
            );
          }
        }
        this.isInitialized = true;
      } finally {
        client.release();
      }
    } catch (err: any) {
      // Não trava a aplicação caso o container não esteja ativo
      // console.warn('ℹ️ PostgreSQL offline ou não acessível ainda.');
    }
  }

  /**
   * Executa uma consulta SQL genérica instrumentada no Elastic APM
   */
  public async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.pool) this.initPool();
    const span = Observability.startSpan(`PostgreSQL Query: ${sql.slice(0, 35)}...`, 'db', 'postgresql', 'query');
    const client = await this.pool!.connect();
    try {
      const res = await client.query(sql, params);
      span?.setLabel('rowCount', res.rowCount || 0);
      return res.rows;
    } catch (err: any) {
      Observability.captureError(err, { sql, params });
      throw err;
    } finally {
      span?.end();
      client.release();
    }
  }

  /**
   * Demonstração didática de Transação ACID com BEGIN / COMMIT / ROLLBACK instrumentada no Elastic APM
   * Simula o débito de premiação e crédito em atleta.
   */
  public async demoAcidTransaction(params: {
    walletId: string;
    amountCents: number;
    simulateError?: boolean;
  }): Promise<{
    success: boolean;
    acidStep: string;
    message: string;
    currentBalance?: number;
    rollbackOccurred: boolean;
  }> {
    if (!this.pool) this.initPool();
    const span = Observability.startSpan('PostgreSQL ACID Transaction', 'db', 'postgresql', 'transaction');
    span?.setLabel('walletId', params.walletId);
    span?.setLabel('amountCents', params.amountCents);
    span?.setLabel('simulateError', Boolean(params.simulateError));

    const client = await this.pool!.connect();
    try {
      await client.query('BEGIN'); // Início da transação atômica

      // 1. Debita o valor da carteira do torneio
      const debitRes = await client.query(
        `UPDATE tournament_wallets 
         SET balance_cents = balance_cents - $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING balance_cents`,
        [params.amountCents, params.walletId]
      );

      if (debitRes.rowCount === 0) {
        throw new Error(`Carteira ${params.walletId} não encontrada.`);
      }

      const newBalance = debitRes.rows[0].balance_cents;

      // 2. Simulação de falha no meio da transação (para aula de ACID)
      if (params.simulateError) {
        throw new Error('Falha simulada no meio do fluxo (ex: timeout de rede ou violação de regra)!');
      }

      await client.query('COMMIT'); // Persistência durável garantida
      span?.setLabel('acid_result', 'COMMIT');

      return {
        success: true,
        acidStep: 'COMMIT',
        message: 'Transação ACID confirmada com sucesso! Consistência e isolamento preservados.',
        currentBalance: Number(newBalance),
        rollbackOccurred: false
      };
    } catch (err: any) {
      await client.query('ROLLBACK'); // Desfaz todas as alterações de forma atômica
      span?.setLabel('acid_result', 'ROLLBACK');
      span?.setLabel('acid_error', err.message);
      Observability.captureError(err, { context: 'PostgreSQL ACID Rollback', params });

      return {
        success: false,
        acidStep: 'ROLLBACK',
        message: `Transação revertida integralmente via ROLLBACK: ${err.message}`,
        rollbackOccurred: true
      };
    } finally {
      span?.end();
      client.release();
    }
  }
}
