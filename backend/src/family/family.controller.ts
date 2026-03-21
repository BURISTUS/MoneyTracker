import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FamilyService } from './family.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Family')
@Controller('family')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FamilyController {
  constructor(private familyService: FamilyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new family' })
  async create(@Request() req: any, @Body() body: { name: string }) {
    return this.familyService.create(req.user.id, body.name);
  }

  @Post('join')
  @ApiOperation({ summary: 'Join family by invite code' })
  async join(@Request() req: any, @Body() body: { inviteCode: string }) {
    return this.familyService.join(req.user.id, body.inviteCode);
  }

  @Get()
  @ApiOperation({ summary: 'Get my family' })
  async getMyFamily(@Request() req: any) {
    return this.familyService.getMyFamily(req.user.id);
  }

  @Get('members')
  @ApiOperation({ summary: 'Get family members' })
  async getMembers(@Request() req: any) {
    return this.familyService.getMembers(req.user.id);
  }

  @Get('budget')
  @ApiOperation({ summary: 'Get family budget overview' })
  async getBudget(@Request() req: any) {
    return this.familyService.getBudget(req.user.id);
  }
}
