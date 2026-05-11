import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LifeCostService } from './life-cost.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PremiumGuard } from '../common/premium.guard';
import { RequirePremium } from '../common/require-premium.decorator';

@ApiTags('Life Cost')
@Controller('life-cost')
@UseGuards(JwtAuthGuard, PremiumGuard)
@ApiBearerAuth()
export class LifeCostController {
  constructor(private lifeCostService: LifeCostService) {}

  @Get('rate')
  @RequirePremium('LIFE_COST')
  @ApiOperation({ summary: 'Get user hourly rate' })
  async getRate(@Request() req: any) {
    const rate = await this.lifeCostService.getHourlyRate(req.user.id);
    return { hourlyRate: rate };
  }

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate hours of life for amount' })
  async calculate(@Request() req: any, @Body() body: { amount: number }) {
    return this.lifeCostService.calculateHours(req.user.id, body.amount);
  }

  @Post('simulate')
  @ApiOperation({ summary: 'Simulate investment growth' })
  async simulate(@Request() req: any, @Body() body: { amount: number; years?: number }) {
    return this.lifeCostService.simulateInvestment(req.user.id, body.amount, body.years);
  }
}
