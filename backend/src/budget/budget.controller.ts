import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PremiumGuard } from '../common/premium.guard';
import { BudgetService } from './budget.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@ApiTags('Budgets')
@ApiBearerAuth()
@Controller('budgets')
@UseGuards(JwtAuthGuard, PremiumGuard)
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Get()
  @ApiOperation({ summary: 'Get budgets for a month with spent amounts' })
  findByMonth(@Request() req: { user: { id: string } }, @Query('month') month?: string) {
    const currentMonth =
      month ||
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    return this.budgetService.findByMonth(req.user.id, currentMonth);
  }

  @Post()
  @ApiOperation({ summary: 'Create a budget' })
  create(@Request() req: { user: { id: string } }, @Body() dto: CreateBudgetDto) {
    return this.budgetService.create(req.user.id, dto);
  }

  @Post('carry-forward')
  @ApiOperation({ summary: 'Carry budgets from previous month to current' })
  carryForward(@Request() req: { user: { id: string } }) {
    return this.budgetService.carryForward(req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update budget amount' })
  update(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: UpdateBudgetDto,
  ) {
    return this.budgetService.update(req.user.id, id, dto.amount);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a budget' })
  delete(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.budgetService.delete(req.user.id, id);
  }
}
