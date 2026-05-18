import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_PREMIUM_KEY } from '../common/require-premium.decorator';
import { SubscriptionService } from '../subscription/subscription.service';
import { FEATURES, FeatureKey } from '../common/features.config';
import { AppException } from '../common/app-exception';

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
    const userId: string | undefined = request.user?.id;
    if (!userId) {
      throw new AppException('errors.authenticationRequired', 401);
    }

    const plan = await this.subscriptionService.getPlan(userId);
    const planConfig = FEATURES[feature][plan];

    if (!planConfig.allowed) {
      throw new AppException('errors.featureNotAvailable', 403, {
        feature: FEATURES[feature].description,
      });
    }

    return true;
  }
}
