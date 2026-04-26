import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GoalsService } from './goals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { UpdateGoalProgressDto } from './dto/update-goal-progress.dto';

@ApiTags('Goals')
@Controller('goals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GoalsController {
  constructor(private goalsService: GoalsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all goals with progress' })
  async findAll(@Request() req: any) {
    return this.goalsService.findAll(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create goal' })
  async create(@Request() req: any, @Body() body: CreateGoalDto) {
    return this.goalsService.create(req.user.id, {
      name: body.name,
      targetAmount: BigInt(body.targetAmount),
      deadline: body.deadline ? new Date(body.deadline) : undefined,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update goal (name, target, deadline)' })
  async update(@Param('id') id: string, @Request() req: any, @Body() body: UpdateGoalDto) {
    const data: { name?: string; targetAmount?: bigint; deadline?: Date } = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.targetAmount !== undefined) data.targetAmount = BigInt(body.targetAmount);
    if (body.deadline !== undefined) data.deadline = new Date(body.deadline);
    return this.goalsService.update(id, req.user.id, data);
  }

  @Patch(':id/progress')
  @ApiOperation({ summary: 'Add progress to goal' })
  async updateProgress(@Param('id') id: string, @Request() req: any, @Body() body: UpdateGoalProgressDto) {
    return this.goalsService.updateProgress(id, req.user.id, BigInt(body.amount));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete goal' })
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.goalsService.delete(id, req.user.id);
  }
}
