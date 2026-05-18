import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FamilyService } from './family.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PremiumGuard } from '../common/premium.guard';
import { RequirePremium } from '../common/require-premium.decorator';
import { CreateFamilyDto } from './dto/create-family.dto';
import { JoinFamilyDto } from './dto/join-family.dto';

@ApiTags('Family')
@Controller('family')
@UseGuards(JwtAuthGuard, PremiumGuard)
@ApiBearerAuth()
export class FamilyController {
  constructor(private familyService: FamilyService) {}

  @Post()
  @RequirePremium('FAMILY')
  @ApiOperation({ summary: 'Create a new family' })
  async create(
    @Request() req: { user: { id: string } },
    @Body() body: CreateFamilyDto,
  ) {
    return this.familyService.create(req.user.id, body.name);
  }

  @Post('join')
  @RequirePremium('FAMILY')
  @ApiOperation({ summary: 'Join family by invite code' })
  async join(
    @Request() req: { user: { id: string } },
    @Body() body: JoinFamilyDto,
  ) {
    return this.familyService.join(req.user.id, body.inviteCode);
  }

  @Get()
  @ApiOperation({ summary: 'Get my family' })
  async getMyFamily(@Request() req: { user: { id: string } }) {
    return this.familyService.getMyFamily(req.user.id);
  }

  @Get('members')
  @ApiOperation({ summary: 'Get family members' })
  async getMembers(@Request() req: { user: { id: string } }) {
    return this.familyService.getMembers(req.user.id);
  }

  @Get('budget')
  @ApiOperation({ summary: 'Get family budget overview' })
  async getBudget(@Request() req: { user: { id: string } }) {
    return this.familyService.getBudget(req.user.id);
  }
}
