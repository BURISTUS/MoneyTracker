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

  @Get('check/:feature')
  @ApiOperation({ summary: 'Check if user has access to a feature' })
  async checkFeature(@Request() req: any, feature: string) {
    return this.subscriptionService.checkAccess(req.user.id, feature as any);
  }

  @Post('activate')
  @ApiOperation({ summary: 'Activate premium (manual or after payment validation)' })
  async activatePremium(
    @Request() req: any,
    @Body() body: { platform?: string; transactionId?: string; expiresAt?: string },
  ) {
    const expiresAt = body.expiresAt ? new Date(body.expiresAt) : undefined;
    return this.subscriptionService.activatePremium(req.user.id, {
      platform: body.platform,
      transactionId: body.transactionId,
      expiresAt,
    });
  }

  @Post('cancel')
  @ApiOperation({ summary: 'Cancel premium subscription' })
  async cancelPremium(@Request() req: any) {
    return this.subscriptionService.cancelPremium(req.user.id);
  }
}