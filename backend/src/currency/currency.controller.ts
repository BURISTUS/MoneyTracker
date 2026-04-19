import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CurrencyService } from './currency.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Currency')
@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get('list')
  @ApiOperation({ summary: 'Paginated currency list with search (for mobile picker)' })
  async getCurrencyList(
    @Query('search') search?: string,
    @Query('type') type?: 'FIAT' | 'CRYPTO' | 'METAL',
    @Query('popular') popular?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.currencyService.getCurrencyList({
      search,
      type,
      popular: popular === 'true' ? true : popular === 'false' ? false : undefined,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }

  @Get('rates')
  @ApiOperation({ summary: 'Get all currencies with optional filters' })
  async getRates(
    @Query('type') type?: 'FIAT' | 'CRYPTO' | 'METAL',
    @Query('popular') popular?: string,
  ) {
    const isPopular = popular === 'true' ? true : popular === 'false' ? false : undefined;
    return this.currencyService.getAllRates(type, isPopular);
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular currencies (first tab)' })
  async getPopular() {
    return this.currencyService.getPopular();
  }

  @Get('fiat')
  @ApiOperation({ summary: 'Get all fiat currencies' })
  async getFiat() {
    return this.currencyService.getByType('FIAT');
  }

  @Get('crypto')
  @ApiOperation({ summary: 'Get all cryptocurrencies' })
  async getCrypto() {
    return this.currencyService.getByType('CRYPTO');
  }

  @Get('metals')
  @ApiOperation({ summary: 'Get precious metals' })
  async getMetals() {
    return this.currencyService.getByType('METAL');
  }

  @Get('convert')
  @ApiOperation({ summary: 'Convert amount between currencies' })
  async convert(
    @Query('amount') amount: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    const result = await this.currencyService.convert(
      parseFloat(amount),
      from.toUpperCase(),
      to.toUpperCase(),
    );
    return { amount: result, from, to };
  }

  @UseGuards(JwtAuthGuard)
  @Get('fetch')
  @ApiOperation({ summary: 'Force refresh rates from API' })
  async fetchExternal() {
    const updated = await this.currencyService.fetchFromExternal();
    return { updated, message: `Updated ${updated} rates from exchange-api` };
  }
}
