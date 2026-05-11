import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_PREMIUM_KEY } from '../common/require-premium.decorator';
import { SubscriptionService } from '../subscription/subscription.service';
import { FEATURES, FeatureKey } from '../common/features.config';

@Injectable()
export class PremiumGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const feature = this.reflector.get<FeatureKey>(REQUIRE_PREMIUM_KEY, context.getHandler());
    if (!feature) return true;

    const request = context.switchToHttp().getRequest();
    const userId: string = request.user?.id;
    if (!userId) return true;

    const plan = await this.subscriptionService.getPlan(userId);
    const planConfig = FEATURES[feature][plan];
    const description = FEATURES[feature].description;

    if (!planConfig.allowed) {
      throw new HttpException(
        {
          statusCode: 403,
          message: `${description} доступна на Premium-подписке`,
          error: 'Forbidden',
          feature: description,
          featureKey: feature,
          premiumOnly: true,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}