import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all transactions' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'type', required: false })
  async findAll(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('categoryId') categoryId?: string,
    @Query('type') type?: string,
  ) {
    return this.transactionsService.findAll(req.user.id, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      categoryId,
      type,
    });
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get transaction summary' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  async getSummary(
    @Request() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.transactionsService.getSummary(req.user.id, new Date(startDate), new Date(endDate));
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get analytics for a period' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  async getAnalytics(
    @Request() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.transactionsService.getAnalytics(
      req.user.id,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by id' })
  async findById(@Param('id') id: string, @Request() req: any) {
    return this.transactionsService.findById(id, req.user.id);
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transfer money between accounts' })
  async transfer(
    @Request() req: any,
    @Body() body: { fromAccountId: string; toAccountId: string; amount: number; description?: string; date?: string },
  ) {
    return this.transactionsService.transfer(req.user.id, {
      fromAccountId: body.fromAccountId,
      toAccountId: body.toAccountId,
      amount: BigInt(body.amount),
      description: body.description,
      date: body.date ? new Date(body.date) : undefined,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create transaction' })
  async create(@Request() req: any, @Body() body: { accountId: string; categoryId: string; amount: number; type: string; description?: string; date?: string }) {
    return this.transactionsService.create(req.user.id, {
      ...body,
      amount: BigInt(body.amount),
      date: body.date ? new Date(body.date) : undefined,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update transaction' })
  async update(@Param('id') id: string, @Request() req: any, @Body() body: { description?: string; date?: string; amount?: number; accountId?: string }) {
    return this.transactionsService.update(id, req.user.id, {
      description: body.description,
      date: body.date ? new Date(body.date) : undefined,
      amount: body.amount !== undefined ? BigInt(body.amount) : undefined,
      accountId: body.accountId,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete transaction' })
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.transactionsService.delete(id, req.user.id);
  }
}
