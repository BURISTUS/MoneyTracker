import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionPlan } from '@prisma/client';
import { FEATURES, FeatureKey, FeatureConfig, FeatureTier, PlanType, ACCOUNT_TYPE_ACCESS, ACCOUNT_LIMITS } from '../common/features.config';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Проверить эффективный план с учётом членства в семье */
  private async getEffectivePlan(userId: string): Promise<PlanType> {
    const sub = await this.prisma.subscription.findUnique({ where: { userId } });
    const ownPlan = sub ? this.mapPlan(sub.plan) : 'free';

    // Если уже на premium/premium_family — возвращаем как есть
    if (ownPlan !== 'free') return ownPlan;

    // Проверяем, состоит ли пользователь в семье
    const familyMember = await this.prisma.familyMember.findUnique({ where: { userId } });
    if (!familyMember) return 'free';

    // Проверяем, что владелец семьи действительно на PREMIUM_FAMILY
    const family = await this.prisma.family.findUnique({
      where: { id: familyMember.familyId },
      include: { members: true },
    });
    if (!family) return 'free';

    const owner = family.members.find((m) => m.role === 'OWNER');
    if (!owner) return 'free';

    const ownerSub = await this.prisma.subscription.findUnique({ where: { userId: owner.userId } });
    if (!ownerSub || ownerSub.plan !== SubscriptionPlan.PREMIUM_FAMILY) return 'free';

    // Владелец на PREMIUM_FAMILY — наследуем
    return 'premium_family';
  }

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
    if (sub.plan !== SubscriptionPlan.FREE && sub.expiresAt && new Date() > sub.expiresAt) {
      sub = await this.prisma.subscription.update({
        where: { id: sub.id },
        data: { plan: SubscriptionPlan.FREE },
      });
      this.logger.log(`Subscription expired for user ${userId}, downgraded to FREE`);
    }

    return sub;
  }

  /** Текущий план пользователя (с учётом семьи) */
  async getPlan(userId: string): Promise<PlanType> {
    return this.getEffectivePlan(userId);
  }

  /** Маппинг Prisma enum → PlanType */
  private mapPlan(plan: SubscriptionPlan): PlanType {
    switch (plan) {
      case SubscriptionPlan.PREMIUM:
        return 'premium';
      case SubscriptionPlan.PREMIUM_FAMILY:
        return 'premium_family';
      default:
        return 'free';
    }
  }

  /** Активировать подписку */
  async activatePremium(
    userId: string,
    data: { plan?: 'premium' | 'premium_family'; platform?: string; transactionId?: string; expiresAt?: Date },
  ) {
    const prismaPlan = data.plan === 'premium_family'
      ? SubscriptionPlan.PREMIUM_FAMILY
      : SubscriptionPlan.PREMIUM;

    return this.prisma.subscription.upsert({
      where: { userId },
      update: {
        plan: prismaPlan,
        expiresAt: data.expiresAt,
        platform: data.platform,
        transactionId: data.transactionId,
        cancelledAt: null,
      },
      create: {
        userId,
        plan: prismaPlan,
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

  /** Переключить план (для тогла в профиле) */
  async togglePlan(userId: string) {
    const sub = await this.getOrCreate(userId);
    const currentPlan = this.mapPlan(sub.plan);

    // Free → Premium → Premium Family → Free
    let newPlan: SubscriptionPlan;
    if (currentPlan === 'free') {
      newPlan = SubscriptionPlan.PREMIUM;
    } else if (currentPlan === 'premium') {
      newPlan = SubscriptionPlan.PREMIUM_FAMILY;
    } else {
      newPlan = SubscriptionPlan.FREE;
    }

    return this.prisma.subscription.update({
      where: { id: sub.id },
      data: { plan: newPlan, cancelledAt: null },
    });
  }

  /** Проверить доступ к фиче */
  async checkAccess(userId: string, feature: FeatureKey): Promise<{ allowed: boolean; remaining?: number; limit?: number; limitUnit?: string; plan: PlanType }> {
    const plan = await this.getPlan(userId);
    const config = FEATURES[feature][plan] as FeatureTier;
    const featureDef = FEATURES[feature] as FeatureConfig;
    const description = featureDef.description;

    if (!config.allowed) {
      return { allowed: false, plan };
    }

    const limit = (config as any).limit as number | undefined;
    const limitUnit = featureDef.limitUnit;

    if (!limit) {
      return { allowed: true, remaining: Infinity, plan };
    }

    return {
      allowed: true,
      remaining: limit,
      limit,
      ...(limitUnit ? { limitUnit } : {}),
      plan,
    };
  }

  /** Получить допустимые типы счетов для пользователя */
  async getAllowedAccountTypes(userId: string): Promise<string[]> {
    const plan = await this.getPlan(userId);
    return ACCOUNT_TYPE_ACCESS[plan];
  }

  /** Получить лимит счетов для пользователя */
  async getAccountLimit(userId: string): Promise<number> {
    const plan = await this.getPlan(userId);
    return ACCOUNT_LIMITS[plan];
  }

  /** Полный статус подписки для мобильного клиента */
  async getSubscriptionStatus(userId: string) {
    const sub = await this.getOrCreate(userId);
    const effectivePlan = await this.getEffectivePlan(userId);
    const isPremium = effectivePlan !== 'free';

    // Проверяем членство в семье
    const familyMember = await this.prisma.familyMember.findUnique({ where: { userId } });
    const isFamily = effectivePlan === 'premium_family';

    const features: Record<string, { allowed: boolean; limit?: number; limitUnit?: string }> = {};
    for (const [key, config] of Object.entries(FEATURES)) {
      const planConfig = config[effectivePlan] as FeatureTier;
      features[key] = {
        allowed: planConfig.allowed,
        ...((planConfig as any).limit ? { limit: (planConfig as any).limit } : {}),
        ...((config as any).limitUnit ? { limitUnit: (config as any).limitUnit } : {}),
      };
    }

    const result: any = {
      plan: effectivePlan,
      isPremium,
      expiresAt: sub.expiresAt,
      startedAt: sub.startedAt,
      cancelledAt: sub.cancelledAt,
      allowedAccountTypes: ACCOUNT_TYPE_ACCESS[effectivePlan],
      accountLimit: ACCOUNT_LIMITS[effectivePlan],
      features,
    };

    // Если пользователь в семье — добавляем информацию
    if (familyMember) {
      const family = await this.prisma.family.findUnique({
        where: { id: familyMember.familyId },
        include: { members: { include: { user: true } } },
      });
      result.familyId = family?.id;
      result.familyName = family?.name;
      result.familyCode = family?.inviteCode;
      result.familyRole = familyMember.role;
    }

    return result;
  }
}