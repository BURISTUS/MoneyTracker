import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BudgetService } from './budget.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@ApiTags('Budget')
@Controller('budgets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BudgetController {
  constructor(private budgetService: BudgetService) {}

  @Get()
  @ApiOperation({ summary: 'Get all budgets with current month progress' })
  async findAll(@Request() req: any) {
    return this.budgetService.findAll(req.user.id);
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Get budget progress' })
  async getProgress(@Param('id') id: string, @Request() req: any) {
    return this.budgetService.getProgress(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create monthly budget' })
  async create(@Request() req: any, @Body() body: CreateBudgetDto) {
    return this.budgetService.create(req.user.id, {
      categoryId: body.categoryId,
      amount: BigInt(body.amount),
      alertThreshold: body.alertThreshold,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update budget amount or alert threshold' })
  async update(@Param('id') id: string, @Request() req: any, @Body() body: UpdateBudgetDto) {
    const data: { amount?: bigint; alertThreshold?: number } = {};
    if (body.amount !== undefined) {
      data.amount = BigInt(body.amount);
    }
    if (body.alertThreshold !== undefined) {
      data.alertThreshold = body.alertThreshold;
    }
    return this.budgetService.update(id, req.user.id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete budget' })
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.budgetService.delete(id, req.user.id);
  }
}
