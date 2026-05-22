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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransferTransactionDto } from './dto/transfer-transaction.dto';

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
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Request() req: { user: { id: string } },
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('categoryId') categoryId?: string,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.transactionsService.findAll(req.user.id, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      categoryId,
      type,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get transaction summary' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  async getSummary(
    @Request() req: { user: { id: string } },
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.transactionsService.getSummary(
      req.user.id,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get analytics for a period' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  async getAnalytics(
    @Request() req: { user: { id: string } },
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
  async findById(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.transactionsService.findById(id, req.user.id);
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transfer money between accounts' })
  async transfer(
    @Request() req: { user: { id: string } },
    @Body() body: TransferTransactionDto,
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
  async create(
    @Request() req: { user: { id: string } },
    @Body() body: CreateTransactionDto,
  ) {
    return this.transactionsService.create(req.user.id, {
      accountId: body.accountId,
      categoryId: body.categoryId,
      amount: BigInt(body.amount),
      type: body.type,
      description: body.description,
      date: body.date ? new Date(body.date) : undefined,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update transaction' })
  async update(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() body: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(id, req.user.id, {
      description: body.description,
      date: body.date ? new Date(body.date) : undefined,
      amount: body.amount !== undefined ? BigInt(body.amount) : undefined,
      accountId: body.accountId,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete transaction' })
  async delete(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.transactionsService.delete(id, req.user.id);
  }
}
