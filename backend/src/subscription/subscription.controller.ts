import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('subscription')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get current subscription status with feature access' })
  async getStatus(@Request() req: any) {
    return this.subscriptionService.getSubscriptionStatus(req.user.id);
  }

  @Get('account-types')
  @ApiOperation({ summary: 'Get allowed account types for current plan' })
  async getAccountTypes(@Request() req: any) {
    return {
      types: await this.subscriptionService.getAllowedAccountTypes(req.user.id),
      limit: await this.subscriptionService.getAccountLimit(req.user.id),
    };
  }

  @Post('activate')
  @ApiOperation({ summary: 'Activate premium (manual or after payment validation)' })
  async activatePremium(
    @Request() req: any,
    @Body() body: { plan?: 'premium' | 'premium_family'; platform?: string; transactionId?: string; expiresAt?: string },
  ) {
    const expiresAt = body.expiresAt ? new Date(body.expiresAt) : undefined;
    return this.subscriptionService.activatePremium(req.user.id, {
      plan: body.plan,
      platform: body.platform,
      transactionId: body.transactionId,
      expiresAt,
    });
  }

  @Post('toggle')
  @ApiOperation({ summary: 'Toggle subscription plan: Free → Premium → Family → Free' })
  async togglePlan(@Request() req: any) {
    const result = await this.subscriptionService.togglePlan(req.user.id);
    return this.subscriptionService.getSubscriptionStatus(req.user.id);
  }

  @Post('cancel')
  @ApiOperation({ summary: 'Cancel premium subscription' })
  async cancelPremium(@Request() req: any) {
    return this.subscriptionService.cancelPremium(req.user.id);
  }
}