import Redis from 'ioredis';
import { Observability } from '../observability/apm.js';

export interface RedisStatus {
  connected: boolean;
  latencyMs: number;
  memoryUsedHuman?: string;
  totalKeys?: number;
  version?: string;
  error?: string;
}

export class RedisClientWrapper {
  private static instance: RedisClientWrapper;
  private redis: Redis | null = null;
  private isConnecting = false;

  private constructor() {
    this.initRedis();
  }

  public static getInstance(): RedisClientWrapper {
    if (!RedisClientWrapper.instance) {
      RedisClientWrapper.instance = new RedisClientWrapper();
    }
    return RedisClientWrapper.instance;
  }

  private initRedis(): void {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = Number(process.env.REDIS_PORT) || 6379;

    this.redis = new Redis({
      host,
      port,
      connectTimeout: 2000,
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      retryStrategy: (times) => {
        if (times > 3) return null; // Para de tentar reconectar agressivamente em caso de offline
        return Math.min(times * 200, 1000);
      }
    });

    this.redis.on('error', (err) => {
      // Previne unhandled exception no Node se o Redis não estiver no ar
    });
  }

  private async ensureConnected(): Promise<boolean> {
    if (!this.redis) this.initRedis();
    if (this.redis!.status === 'ready') return true;
    if (this.redis!.status === 'connecting') return false;

    try {
      await this.redis!.connect();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Testa conectividade com o Redis e mede a latência em microssegundos / milissegundos
   */
  public async ping(): Promise<RedisStatus> {
    const start = performance.now();
    try {
      const ok = await this.ensureConnected();
      if (!ok && this.redis?.status !== 'ready') {
        throw new Error('Serviço Redis indisponível ou offline');
      }

      const pong = await this.redis!.ping();
      const latencyMs = Number((performance.now() - start).toFixed(2));

      // Extrai estatísticas de memória do comando INFO
      const info = await this.redis!.info('server', 'memory');
      const versionMatch = info.match(/redis_version:([^\r\n]+)/);
      const memMatch = info.match(/used_memory_human:([^\r\n]+)/);
      const dbsize = await this.redis!.dbsize();

      return {
        connected: pong === 'PONG',
        latencyMs,
        version: versionMatch ? versionMatch[1] : '7.x',
        memoryUsedHuman: memMatch ? memMatch[1] : undefined,
        totalKeys: dbsize
      };
    } catch (err: any) {
      const latencyMs = Number((performance.now() - start).toFixed(2));
      return {
        connected: false,
        latencyMs,
        error: err.message || 'Falha ao conectar no Redis'
      };
    }
  }

  /**
   * Obtém um valor do cache instrumentado no APM
   */
  public async get<T = any>(key: string): Promise<T | null> {
    const span = Observability.startSpan(`Redis GET: ${key}`, 'cache', 'redis', 'get');
    span?.setLabel('cache_key', key);
    try {
      const ok = await this.ensureConnected();
      if (!ok) {
        span?.setLabel('cache_hit', false);
        return null;
      }
      const raw = await this.redis!.get(key);
      span?.setLabel('cache_hit', Boolean(raw));
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch {
        return raw as unknown as T;
      }
    } catch (err: any) {
      Observability.captureError(err, { context: 'Redis get', key });
      return null;
    } finally {
      span?.end();
    }
  }

  /**
   * Salva um valor no cache com tempo de expiração opcional (TTL em segundos) instrumentado no APM
   */
  public async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    const span = Observability.startSpan(`Redis SET: ${key}`, 'cache', 'redis', 'set');
    span?.setLabel('cache_key', key);
    if (ttlSeconds) span?.setLabel('cache_ttl_seconds', ttlSeconds);

    try {
      const ok = await this.ensureConnected();
      if (!ok) return false;
      const payload = typeof value === 'string' ? value : JSON.stringify(value);
      if (ttlSeconds && ttlSeconds > 0) {
        await this.redis!.set(key, payload, 'EX', ttlSeconds);
      } else {
        await this.redis!.set(key, payload);
      }
      return true;
    } catch (err: any) {
      Observability.captureError(err, { context: 'Redis set', key });
      return false;
    } finally {
      span?.end();
    }
  }

  /**
   * Remove uma chave do cache (Invalidação) instrumentado no APM
   */
  public async del(key: string): Promise<boolean> {
    const span = Observability.startSpan(`Redis DEL: ${key}`, 'cache', 'redis', 'del');
    span?.setLabel('cache_key', key);
    try {
      const ok = await this.ensureConnected();
      if (!ok) return false;
      const res = await this.redis!.del(key);
      span?.setLabel('deletedCount', res);
      return res > 0;
    } catch (err: any) {
      Observability.captureError(err, { context: 'Redis del', key });
      return false;
    } finally {
      span?.end();
    }
  }

  /**
   * Limpa todas as chaves do Redis
   */
  public async flushall(): Promise<boolean> {
    try {
      const ok = await this.ensureConnected();
      if (!ok) return false;
      await this.redis!.flushall();
      return true;
    } catch {
      return false;
    }
  }
}
