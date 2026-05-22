import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionPlan } from '@prisma/client';
import {
  FEATURES,
  FeatureKey,
  FeatureConfig,
  FeatureTier,
  PlanType,
  ACCOUNT_TYPE_ACCESS,
  ACCOUNT_LIMITS,
} from '../common/features.config';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async getEffectivePlan(userId: string): Promise<PlanType> {
    const sub = await this.prisma.subscription.findUnique({
      where: { userId },
    });
    const ownPlan = sub ? this.mapPlan(sub.plan) : 'free';

    if (ownPlan !== 'free') return ownPlan;

    const familyMember = await this.prisma.familyMember.findUnique({
      where: { userId },
    });
    if (!familyMember) return 'free';

    const family = await this.prisma.family.findUnique({
      where: { id: familyMember.familyId },
      include: { members: true },
    });
    if (!family) return 'free';

    const owner = family.members.find((m) => m.role === 'OWNER');
    if (!owner) return 'free';

    const ownerSub = await this.prisma.subscription.findUnique({
      where: { userId: owner.userId },
    });
    if (!ownerSub || ownerSub.plan !== SubscriptionPlan.PREMIUM_FAMILY)
      return 'free';

    return 'premium_family';
  }

  async getOrCreate(userId: string) {
    let sub = await this.prisma.subscription.findUnique({
      where: { userId },
    });
    if (!sub) {
      sub = await this.prisma.subscription.create({
        data: { userId, plan: SubscriptionPlan.FREE },
      });
      this.logger.log(`Created FREE subscription for user ${userId}`);
    }

    if (
      sub.plan !== SubscriptionPlan.FREE &&
      sub.expiresAt &&
      new Date() > sub.expiresAt
    ) {
      sub = await this.prisma.subscription.update({
        where: { id: sub.id },
        data: { plan: SubscriptionPlan.FREE },
      });
      this.logger.log(
        `Subscription expired for user ${userId}, downgraded to FREE`,
      );
    }

    return sub;
  }

  async getPlan(userId: string): Promise<PlanType> {
    return this.getEffectivePlan(userId);
  }

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

  async activatePremium(
    userId: string,
    data: {
      plan?: 'premium' | 'premium_family';
      platform?: string;
      transactionId?: string;
      expiresAt?: Date;
    },
  ) {
    const prismaPlan =
      data.plan === 'premium_family'
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

  async cancelPremium(userId: string) {
    const sub = await this.getOrCreate(userId);
    return this.prisma.subscription.update({
      where: { id: sub.id },
      data: { cancelledAt: new Date() },
    });
  }

  async togglePlan(userId: string) {
    const sub = await this.getOrCreate(userId);
    const currentPlan = this.mapPlan(sub.plan);

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

  async checkAccess(
    userId: string,
    feature: FeatureKey,
  ): Promise<{
    allowed: boolean;
    remaining?: number;
    limit?: number;
    limitUnit?: string;
    plan: PlanType;
  }> {
    const plan = await this.getPlan(userId);
    const config = FEATURES[feature][plan] as FeatureTier;
    const featureDef = FEATURES[feature] as FeatureConfig;

    if (!config.allowed) {
      return { allowed: false, plan };
    }

    const limit = config.limit;
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

  async getAllowedAccountTypes(userId: string): Promise<string[]> {
    const plan = await this.getPlan(userId);
    return ACCOUNT_TYPE_ACCESS[plan];
  }

  async getAccountLimit(userId: string): Promise<number> {
    const plan = await this.getPlan(userId);
    return ACCOUNT_LIMITS[plan];
  }

  async getSubscriptionStatus(userId: string) {
    const sub = await this.getOrCreate(userId);
    const effectivePlan = await this.getEffectivePlan(userId);
    const isPremium = effectivePlan !== 'free';

    const familyMember = await this.prisma.familyMember.findUnique({
      where: { userId },
    });

    const features: Record<
      string,
      { allowed: boolean; limit?: number; limitUnit?: string }
    > = {};
    for (const [key, config] of Object.entries(FEATURES)) {
      const planConfig = config[effectivePlan] as FeatureTier;
      features[key] = {
        allowed: planConfig.allowed,
        ...(planConfig.limit ? { limit: planConfig.limit } : {}),
        ...(('limitUnit' in config && config.limitUnit ? { limitUnit: config.limitUnit } : {})),
      };
    }

    const result: Record<string, unknown> = {
      plan: effectivePlan,
      isPremium,
      expiresAt: sub.expiresAt,
      startedAt: sub.startedAt,
      cancelledAt: sub.cancelledAt,
      allowedAccountTypes: ACCOUNT_TYPE_ACCESS[effectivePlan],
      accountLimit: ACCOUNT_LIMITS[effectivePlan],
      features,
    };

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
