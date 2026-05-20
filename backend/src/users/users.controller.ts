import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionService } from '../subscription/subscription.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateHourlyRateDto } from './dto/update-hourly-rate.dto';
import { AppException } from '../common/app-exception';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private subscriptionService: SubscriptionService,
  ) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Request() req: { user: { id: string } }) {
    const user = await this.usersService.findById(req.user.id);
    if (!user) {
      throw new AppException('errors.userNotFound', 404);
    }
    const subscription = await this.subscriptionService.getOrCreate(req.user.id);
    const effectivePlan = await this.subscriptionService.getPlan(req.user.id);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      currency: user.currency,
      language: user.language,
      hourlyRate: user.hourlyRate,
      monthlyHours: user.monthlyHours,
      plan: subscription.plan,
      isPremium: effectivePlan !== 'free',
      subscriptionExpiresAt: subscription.expiresAt,
    };
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(
    @Request() req: { user: { id: string } },
    @Body() body: UpdateProfileDto,
  ) {
    return this.usersService.update(req.user.id, {
      name: body.name,
      monthlyHours: body.monthlyHours,
      currency: body.currency,
      language: body.language,
    });
  }

  @Patch('hourly-rate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set hourly rate' })
  async setHourlyRate(
    @Request() req: { user: { id: string } },
    @Body() body: UpdateHourlyRateDto,
  ) {
    return this.usersService.updateHourlyRate(req.user.id, body.hourlyRate * 100);
  }
}
