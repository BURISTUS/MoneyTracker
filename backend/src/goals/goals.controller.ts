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
  @ApiOperation({ summary: 'Get all goals with progress and contributions' })
  async findAll(@Request() req: any) {
    return this.goalsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get goal by id with contributions' })
  async findById(@Param('id') id: string, @Request() req: any) {
    return this.goalsService.findById(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create goal' })
  async create(@Request() req: any, @Body() body: { name: string; targetAmount: number; currency?: string; deadline?: string }) {
    return this.goalsService.create(req.user.id, {
      name: body.name,
      targetAmount: BigInt(body.targetAmount),
      currency: body.currency,
      deadline: body.deadline,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update goal (name, target, deadline)' })
  async update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { name?: string; targetAmount?: number; deadline?: string },
  ) {
    return this.goalsService.update(id, req.user.id, {
      name: body.name,
      targetAmount: body.targetAmount !== undefined ? BigInt(body.targetAmount) : undefined,
      deadline: body.deadline,
    });
  }

  @Post(':id/contribution')
  @ApiOperation({ summary: 'Add contribution to goal' })
  async addContribution(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { amount: number; note?: string; date?: string },
  ) {
    return this.goalsService.addContribution(id, req.user.id, {
      amount: BigInt(body.amount),
      note: body.note,
      date: body.date ? new Date(body.date) : undefined,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete goal' })
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.goalsService.delete(id, req.user.id);
  }
}