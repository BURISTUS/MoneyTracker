import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { RateLimitService, RateLimitFeature } from './rate-limit.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { FEATURES, FeatureKey, FeatureTier, getLimit } from '../common/features.config';

const PATH_TO_FEATURE: Record<string, FeatureKey> = {
  '/api/chat/message': 'AI_CHAT',
  '/api/ai/voice-transaction': 'AI_VOICE',
  '/api/ai/receipt-transaction': 'AI_RECEIPT',
};

const FEATURE_TO_RATE: Record<string, RateLimitFeature> = {
  AI_CHAT: 'chat',
  AI_VOICE: 'voice',
  AI_RECEIPT: 'receipt',
};

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly rateLimitService: RateLimitService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId: string = request.user?.id;
    if (!userId) return true;

    const path: string = request.path || request.route?.path || '';
    const featureKey = this.detectFeature(path);
    if (!featureKey) return true;

    const plan = await this.subscriptionService.getPlan(userId);
    const planConfig = FEATURES[featureKey][plan] as FeatureTier;
    const description = FEATURES[featureKey].description;

    if (!planConfig.allowed) {
      throw new HttpException(
        {
          statusCode: 403,
          message: `${description} доступна на Premium-подписке`,
          error: 'Forbidden',
          feature: featureKey,
          premiumOnly: true,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    if (!((planConfig as any).limit)) return true;

    const maxLimit = getLimit(featureKey, plan);
    const rateFeature: RateLimitFeature = FEATURE_TO_RATE[featureKey] || 'chat';
    const result = await this.rateLimitService.checkLimit(userId, rateFeature, plan === 'premium', maxLimit);

    const response = context.switchToHttp().getResponse();
    response.setHeader('X-RateLimit-Remaining', result.remaining);
    response.setHeader('X-RateLimit-Reset', result.resetAt.toISOString());
    response.setHeader('X-RateLimit-Limit', maxLimit);
    response.setHeader('X-Plan', plan);

    if (!result.allowed) {
      throw new HttpException(
        {
          statusCode: 429,
          message: 'Слишком много запросов. Попробуйте позже или обновите до Premium.',
          error: 'Too Many Requests',
          resetAt: result.resetAt,
          feature: FEATURES[featureKey].description,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private detectFeature(path: string): FeatureKey | null {
    for (const [prefix, key] of Object.entries(PATH_TO_FEATURE)) {
      if (path.startsWith(prefix)) return key;
    }
    return null;
  }
}