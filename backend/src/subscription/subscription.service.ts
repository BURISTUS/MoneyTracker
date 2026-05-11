import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionPlan } from '@prisma/client';
import { FEATURES, FeatureKey, getLimit, isAllowed } from '../common/features.config';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Получить или создать подписку пользователя */
  async getOrCreate(userId: string) {
    let sub = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!sub) {
      sub = await this.prisma.subscription.create({
        data: { userId, plan: SubscriptionPlan.FREE },
      });
      this.logger.log(`Created FREE subscription for user ${userId}`);
    }

    // Проверяем просрочку
    if (sub.plan === SubscriptionPlan.PREMIUM && sub.expiresAt && new Date() > sub.expiresAt) {
      sub = await this.prisma.subscription.update({
        where: { id: sub.id },
        data: { plan: SubscriptionPlan.FREE },
      });
      this.logger.log(`Subscription expired for user ${userId}, downgraded to FREE`);
    }

    return sub;
  }

  /** Текущий план пользователя */
  async getPlan(userId: string): Promise<'free' | 'premium'> {
    const sub = await this.getOrCreate(userId);
    return sub.plan === SubscriptionPlan.PREMIUM ? 'premium' : 'free';
  }

  /** Активировать премиум */
  async activatePremium(
    userId: string,
    data: { platform?: string; transactionId?: string; expiresAt?: Date },
  ) {
    return this.prisma.subscription.upsert({
      where: { userId },
      update: {
        plan: SubscriptionPlan.PREMIUM,
        expiresAt: data.expiresAt,
        platform: data.platform,
        transactionId: data.transactionId,
        cancelledAt: null,
      },
      create: {
        userId,
        plan: SubscriptionPlan.PREMIUM,
        expiresAt: data.expiresAt,
        platform: data.platform,
        transactionId: data.transactionId,
      },
    });
  }

  /** Отменить подписку (премиум работает до expiresAt) */
  async cancelPremium(userId: string) {
    const sub = await this.getOrCreate(userId);
    return this.prisma.subscription.update({
      where: { id: sub.id },
      data: { cancelledAt: new Date() },
    });
  }

  /** Проверить доступ к фиче */
  async checkAccess(userId: string, feature: FeatureKey): Promise<{ allowed: boolean; remaining?: number; limit?: number; limitUnit?: string; plan: 'free' | 'premium' }> {
    const plan = await this.getPlan(userId);
    const config = FEATURES[feature][plan];
    const featureDef = FEATURES[feature];

    if (!config.allowed) {
      return { allowed: false, plan };
    }

    if (!config.limit) {
      return { allowed: true, remaining: Infinity, plan };
    }

    return {
      allowed: true,
      remaining: config.limit,
      limit: config.limit,
      limitUnit: featureDef.limitUnit,
      plan,
    };
  }

  /** Полный статус подписки для мобильного клиента */
  async getSubscriptionStatus(userId: string) {
    const sub = await this.getOrCreate(userId);
    const plan = sub.plan === SubscriptionPlan.PREMIUM ? 'premium' : 'free';
    const isPremium = sub.plan === SubscriptionPlan.PREMIUM;

    const features: Record<string, { allowed: boolean; limit?: number; limitUnit?: string }> = {};
    for (const [key, config] of Object.entries(FEATURES)) {
      const planConfig = config[plan as 'free' | 'premium'];
      features[key] = {
        allowed: planConfig.allowed,
        ...(planConfig.limit ? { limit: planConfig.limit } : {}),
        ...(config.limitUnit ? { limitUnit: config.limitUnit } : {}),
      };
    }

    return {
      plan,
      isPremium,
      expiresAt: sub.expiresAt,
      startedAt: sub.startedAt,
      cancelledAt: sub.cancelledAt,
      features,
    };
  }
}