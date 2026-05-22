import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GoalsService } from './goals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PremiumGuard } from '../common/premium.guard';
import { RequirePremium } from '../common/require-premium.decorator';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { UpdateGoalProgressDto } from './dto/update-goal-progress.dto';

@ApiTags('Goals')
@Controller('goals')
@UseGuards(JwtAuthGuard, PremiumGuard)
@ApiBearerAuth()
export class GoalsController {
  constructor(private goalsService: GoalsService) {}

  @Get()
  @RequirePremium('GOALS')
  @ApiOperation({ summary: 'Get all goals with progress and contributions' })
  async findAll(@Request() req: { user: { id: string } }) {
    return this.goalsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get goal by id with contributions' })
  async findById(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.goalsService.findById(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create goal' })
  async create(
    @Request() req: { user: { id: string } },
    @Body() body: CreateGoalDto,
  ) {
    return this.goalsService.create(req.user.id, {
      name: body.name,
      targetAmount: BigInt(body.targetAmount),
      deadline: body.deadline,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update goal (name, target, deadline)' })
  async update(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() body: UpdateGoalDto,
  ) {
    return this.goalsService.update(id, req.user.id, {
      name: body.name,
      targetAmount: body.targetAmount
        ? BigInt(body.targetAmount)
        : undefined,
      deadline: body.deadline,
    });
  }

  @Post(':id/contribution')
  @ApiOperation({ summary: 'Add contribution to goal' })
  async addContribution(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() body: UpdateGoalProgressDto,
  ) {
    return this.goalsService.addContribution(id, req.user.id, {
      amount: BigInt(body.amount),
      note: body.note,
      date: new Date(),
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete goal' })
  async delete(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.goalsService.delete(id, req.user.id);
  }
}
