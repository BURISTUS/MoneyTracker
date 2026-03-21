import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GoalsService } from './goals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Goals')
@Controller('goals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GoalsController {
  constructor(private goalsService: GoalsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all goals' })
  async findAll(@Request() req: any) {
    return this.goalsService.findAll(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create goal' })
  async create(@Request() req: any, @Body() body: { name: string; targetAmount: number; deadline: string }) {
    return this.goalsService.create(req.user.id, {
      name: body.name,
      targetAmount: BigInt(body.targetAmount),
      deadline: new Date(body.deadline),
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update goal progress' })
  async updateProgress(@Param('id') id: string, @Request() req: any, @Body() body: { amount: number }) {
    return this.goalsService.updateProgress(id, req.user.id, BigInt(body.amount));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete goal' })
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.goalsService.delete(id, req.user.id);
  }
}
