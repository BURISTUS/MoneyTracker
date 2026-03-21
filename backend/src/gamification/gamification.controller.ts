import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Gamification')
@Controller('gamification')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GamificationController {
  constructor(private gamificationService: GamificationService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get user gamification profile' })
  async getProfile(@Request() req: any) {
    return this.gamificationService.getProfile(req.user.id);
  }

  @Get('levels')
  @ApiOperation({ summary: 'Get all levels info' })
  async getLevels() {
    return this.gamificationService.getLevelInfo();
  }
}
