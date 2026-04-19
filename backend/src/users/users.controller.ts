import { Controller, Get, Patch, Body, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Request() req: any) {
    const user = await this.usersService.findById(req.user.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      currency: user.currency,
      language: user.language,
      hourlyRate: user.hourlyRate,
      monthlyHours: user.monthlyHours,
      gamification: user.gamification,
    };
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(
    @Request() req: any,
    @Body() body: { name?: string; monthlyHours?: number; currency?: string; language?: string },
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
  async setHourlyRate(@Request() req: any, @Body() body: { hourlyRate: number }) {
    return this.usersService.updateHourlyRate(req.user.id, body.hourlyRate);
  }
}
