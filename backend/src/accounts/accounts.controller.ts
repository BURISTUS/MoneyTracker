import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Get('public')
  @ApiOperation({ summary: 'Get public accounts info' })
  async getPublicInfo() {
    return {
      availableTypes: ['CASH', 'BANK', 'CREDIT', 'INVESTMENT', 'DEBT'],
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all accounts' })
  async findAll(@Request() req: any) {
    return this.accountsService.findAll(req.user.id);
  }

  @Get('total-balance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get total balance in user currency' })
  async getTotalBalance(@Request() req: any) {
    const user = await this.accountsService.findAll(req.user.id);
    return this.accountsService.getTotalBalance(
      req.user.id,
      req.user.currency || 'RUB',
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get account by id' })
  async findById(@Param('id') id: string, @Request() req: any) {
    return this.accountsService.findById(id, req.user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create account' })
  async create(@Request() req: any, @Body() body: { name: string; type: string; currency?: string }) {
    return this.accountsService.create(req.user.id, body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update account' })
  async update(@Param('id') id: string, @Request() req: any, @Body() body: Prisma.AccountUpdateInput) {
    return this.accountsService.update(id, req.user.id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete account' })
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.accountsService.delete(id, req.user.id);
  }
}
