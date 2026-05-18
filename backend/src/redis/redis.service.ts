import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
      db: this.configService.get<number>('REDIS_DB', 0),
      maxRetriesPerRequest: 3,
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis error:', err);
    });

    this.client.on('connect', () => {
      this.logger.log('Redis connected');
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch {
      this.logger.warn(`Redis GET failed for key: ${key}`);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
    } catch {
      this.logger.warn(`Redis SET failed for key: ${key}`);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch {
      this.logger.warn(`Redis DEL failed for key: ${key}`);
    }
  }

  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch {
      this.logger.warn(`Redis INCR failed for key: ${key}`);
      return 0;
    }
  }

  async expire(key: string, seconds: number): Promise<void> {
    try {
      await this.client.expire(key, seconds);
    } catch {
      this.logger.warn(`Redis EXPIRE failed for key: ${key}`);
    }
  }

  async hset(key: string, field: string, value: string): Promise<void> {
    try {
      await this.client.hset(key, field, value);
    } catch {
      this.logger.warn(`Redis HSET failed for key: ${key}`);
    }
  }

  async hget(key: string, field: string): Promise<string | null> {
    try {
      return await this.client.hget(key, field);
    } catch {
      this.logger.warn(`Redis HGET failed for key: ${key}`);
      return null;
    }
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    try {
      return await this.client.hgetall(key);
    } catch {
      this.logger.warn(`Redis HGETALL failed for key: ${key}`);
      return {};
    }
  }

  async setCache<T>(key: string, data: T, ttlSeconds = 300): Promise<void> {
    await this.set(key, JSON.stringify(data), ttlSeconds);
  }

  async getCache<T>(key: string): Promise<T | null> {
    const data = await this.get(key);
    return data ? JSON.parse(data) : null;
  }
}
