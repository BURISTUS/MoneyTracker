import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

export type RateLimitFeature = 'chat' | 'voice' | 'receipt';

interface RateLimitConfig {
  feature: RateLimitFeature;
  maxRequests: number;
  windowSeconds: number;
}

/** Лимиты по умолчанию (free-план). Премиум — в 10 раз больше. */
const DEFAULT_LIMITS: Record<RateLimitFeature, RateLimitConfig> = {
  chat: { feature: 'chat', maxRequests: 5, windowSeconds: 86400 },       // 5/день
  voice: { feature: 'voice', maxRequests: 3, windowSeconds: 86400 },    // 3/день
  receipt: { feature: 'receipt', maxRequests: 2, windowSeconds: 86400 }, // 2/день
};

const PREMIUM_MULTIPLIER = 10;

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);

  constructor(private readonly redis: RedisService) {}

  /**
   * Проверить и инкрементировать лимит.
   * Возвращает { allowed, remaining, resetAt }.
   * Если allowed=false — вызывающий должен вернуть 429.
   */
  /**
   * Проверить и инкрементировать лимит.
   * maxRequests — максимальное количество запросов (из FEATURES config).
   */
  async checkLimit(
    userId: string,
    feature: RateLimitFeature,
    isPremium: boolean = false,
    maxRequests?: number,
  ): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
    const config = DEFAULT_LIMITS[feature];
    const limit = maxRequests ?? (isPremium ? config.maxRequests * PREMIUM_MULTIPLIER : config.maxRequests);

    // Ключ: rl:{userId}:{feature}:{YYYY-MM-DD}
    const today = new Date().toISOString().slice(0, 10);
    const key = `rl:${userId}:${feature}:${today}`;

    // TTL до конца суток (но минимум 60 секунд)
    const now = new Date();
    const resetAt = new Date(now);
    resetAt.setUTCHours(24, 0, 0, 0);
    const ttlSeconds = Math.max(Math.ceil((resetAt.getTime() - now.getTime()) / 1000), 60);

    const current = await this.redis.incr(key);

    // Установить TTL при первом запросе
    if (current === 1) {
      await this.redis.expire(key, ttlSeconds);
    }

    const remaining = Math.max(limit - current, 0);
    const allowed = current <= limit;

    if (!allowed) {
      this.logger.warn(`Rate limit exceeded: ${userId} / ${feature} (${current}/${limit})`);
    }

    return { allowed, remaining: allowed ? remaining : 0, resetAt };
  }

  /** Сбросить лимит для пользователя (например, при покупке премиума) */
  async resetLimit(userId: string, feature: RateLimitFeature): Promise<void> {
    const today = new Date().toISOString().slice(0, 10);
    const key = `rl:${userId}:${feature}:${today}`;
    await this.redis.del(key);
  }
}