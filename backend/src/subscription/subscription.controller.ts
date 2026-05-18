import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActivateSubscriptionDto } from './dto/activate-subscription.dto';

@ApiTags('subscription')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get current subscription status with feature access' })
  async getStatus(@Request() req: { user: { id: string } }) {
    return this.subscriptionService.getSubscriptionStatus(req.user.id);
  }

  @Get('account-types')
  @ApiOperation({ summary: 'Get allowed account types for current plan' })
  async getAccountTypes(@Request() req: { user: { id: string } }) {
    return {
      types: await this.subscriptionService.getAllowedAccountTypes(req.user.id),
      limit: await this.subscriptionService.getAccountLimit(req.user.id),
    };
  }

  @Post('activate')
  @ApiOperation({ summary: 'Activate premium (after payment validation)' })
  async activatePremium(
    @Request() req: { user: { id: string } },
    @Body() body: ActivateSubscriptionDto,
  ) {
    const expiresAt = body.expiresAt ? new Date(body.expiresAt) : undefined;
    return this.subscriptionService.activatePremium(req.user.id, {
      plan: body.plan as 'premium' | 'premium_family' | undefined,
      platform: body.platform,
      transactionId: body.transactionId,
      expiresAt,
    });
  }

  @Post('cancel')
  @ApiOperation({ summary: 'Cancel premium subscription' })
  async cancelPremium(@Request() req: { user: { id: string } }) {
    return this.subscriptionService.cancelPremium(req.user.id);
  }

  @Post('toggle')
  @ApiOperation({ summary: 'Toggle subscription plan (dev/test only)' })
  async togglePlan(@Request() req: { user: { id: string } }) {
    await this.subscriptionService.togglePlan(req.user.id);
    return this.subscriptionService.getSubscriptionStatus(req.user.id);
  }
}
