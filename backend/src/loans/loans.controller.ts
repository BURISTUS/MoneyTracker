import {
  Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PremiumGuard } from '../common/premium.guard';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';

@ApiTags('Loans')
@ApiBearerAuth()
@Controller('loans')
@UseGuards(JwtAuthGuard, PremiumGuard)
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Get()
  @ApiOperation({ summary: 'Get all loans' })
  findAll(@Request() req: { user: { id: string } }) {
    return this.loansService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get loan by ID with payments' })
  findById(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.loansService.findById(id, req.user.id);
  }

  @Get(':id/schedule')
  @ApiOperation({ summary: 'Get amortization schedule' })
  getSchedule(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.loansService.getSchedule(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a loan' })
  create(@Request() req: { user: { id: string } }, @Body() dto: CreateLoanDto) {
    return this.loansService.create(req.user.id, dto);
  }

  @Post(':id/pay')
  @ApiOperation({ summary: 'Record next loan payment' })
  recordPayment(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.loansService.recordPayment(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a loan' })
  update(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: UpdateLoanDto,
  ) {
    return this.loansService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a loan' })
  delete(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.loansService.delete(id, req.user.id);
  }
}
