import { Redis } from 'ioredis';
import { config } from '../config.js';

export class RedisQueueService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(config.redisUrl, {
      maxRetriesPerRequest: null,
      lazyConnect: true,
    });
  }

  public async connect(): Promise<void> {
    try {
      await this.redis.connect();
      console.info('[Redis] Connected successfully');
    } catch (err) {
      console.warn('[Redis] Connection failed (running in fallback mock mode):', err);
    }
  }

  public async pushTask(queueName: string, payload: Record<string, unknown>): Promise<void> {
    if (this.redis.status === 'ready') {
      await this.redis.rpush(queueName, JSON.stringify(payload));
    } else {
      console.info(`[MockQueue] Pushed task to ${queueName}:`, payload);
    }
  }
}

export const redisQueue = new RedisQueueService();
