import { Module } from '@nestjs/common';
import { LifeCostService } from './life-cost.service';
import { LifeCostController } from './life-cost.controller';

@Module({
  controllers: [LifeCostController],
  providers: [LifeCostService],
  exports: [LifeCostService],
})
export class LifeCostModule {}
