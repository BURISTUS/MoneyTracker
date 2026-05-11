import { SetMetadata } from '@nestjs/common';
import { FeatureKey } from '../common/features.config';

export const REQUIRE_PREMIUM_KEY = 'requirePremium';

/**
 * Декоратор для защиты эндпоинта по фиче.
 * Если фича не доступна на текущем плане — 403.
 * 
 * @example
 * @RequirePremium('GOALS')
 * @Get('goals')
 * async getGoals() { ... }
 */
export const RequirePremium = (feature: FeatureKey) =>
  SetMetadata(REQUIRE_PREMIUM_KEY, feature);