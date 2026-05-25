import {
  Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PremiumGuard } from '../common/premium.guard';
import { DepositsService } from './deposits.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { UpdateDepositDto } from './dto/update-deposit.dto';

@ApiTags('Deposits')
@ApiBearerAuth()
@Controller('deposits')
@UseGuards(JwtAuthGuard, PremiumGuard)
export class DepositsController {
  constructor(private readonly depositsService: DepositsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all deposits' })
  findAll(@Request() req: { user: { id: string } }) {
    return this.depositsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get deposit by ID' })
  findById(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.depositsService.findById(id, req.user.id);
  }

  @Get(':id/projection')
  @ApiOperation({ summary: 'Get deposit projection (month-by-month)' })
  getProjection(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.depositsService.getProjection(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a deposit' })
  create(@Request() req: { user: { id: string } }, @Body() dto: CreateDepositDto) {
    return this.depositsService.create(req.user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a deposit' })
  update(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: UpdateDepositDto,
  ) {
    return this.depositsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a deposit' })
  delete(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.depositsService.delete(id, req.user.id);
  }
}
