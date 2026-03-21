import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BudgetService } from './budget.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Budget')
@Controller('budgets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BudgetController {
  constructor(private budgetService: BudgetService) {}

  @Get()
  @ApiOperation({ summary: 'Get all budgets' })
  async findAll(@Request() req: any) {
    return this.budgetService.findAll(req.user.id);
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Get budget progress' })
  async getProgress(@Param('id') id: string, @Request() req: any) {
    return this.budgetService.getProgress(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create budget' })
  async create(@Request() req: any, @Body() body: { categoryId: string; amount: number; period: string; startDate: string; endDate: string; alertThreshold?: number }) {
    return this.budgetService.create(req.user.id, {
      ...body,
      amount: BigInt(body.amount),
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete budget' })
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.budgetService.delete(id, req.user.id);
  }
}
