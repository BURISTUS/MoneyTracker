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
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

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
  async findAll(@Request() req: { user: { id: string } }) {
    return this.accountsService.findAll(req.user.id);
  }

  @Get('total-balance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get total balance in user currency' })
  async getTotalBalance(@Request() req: { user: { id: string; currency?: string } }) {
    return this.accountsService.getTotalBalance(
      req.user.id,
      req.user.currency || 'RUB',
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get account by id' })
  async findById(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.accountsService.findById(id, req.user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create account' })
  async create(
    @Request() req: { user: { id: string } },
    @Body() body: CreateAccountDto,
  ) {
    return this.accountsService.create(req.user.id, body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update account' })
  async update(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() body: UpdateAccountDto,
  ) {
    return this.accountsService.update(id, req.user.id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete account' })
  async delete(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.accountsService.delete(id, req.user.id);
  }
}
