import { Module, Global } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PremiumGuard } from '../common/premium.guard';

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, PremiumGuard],
  exports: [SubscriptionService, PremiumGuard],
})
export class SubscriptionModule {}