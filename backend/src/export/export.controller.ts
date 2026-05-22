import {
  Controller,
  Get,
  Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PremiumGuard } from '../common/premium.guard';
import { RequirePremium } from '../common/require-premium.decorator';
import { ExportService } from './export.service';

@ApiTags('Export')
@Controller('export')
@UseGuards(JwtAuthGuard, PremiumGuard)
@ApiBearerAuth()
export class ExportController {
  constructor(private exportService: ExportService) {}

  @Get('transactions')
  @RequirePremium('EXPORT')
  @ApiOperation({ summary: 'Export transactions as CSV/XLSX/JSON' })
  @ApiQuery({ name: 'format', enum: ['csv', 'xlsx', 'json'] })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async exportTransactions(
    @Request() req: any,
    @Query('format') format: 'csv' | 'xlsx' | 'json' = 'csv',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Res() res?: Response,
  ) {
    const result = await this.exportService.exportTransactions(
      req.user.id,
      format,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    this.sendResult(res, result, format, 'transactions');
  }

  @Get('analytics')
  @RequirePremium('EXPORT')
  @ApiOperation({ summary: 'Export analytics as CSV/XLSX/JSON' })
  @ApiQuery({ name: 'format', enum: ['csv', 'xlsx', 'json'] })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  async exportAnalytics(
    @Request() req: any,
    @Query('format') format: 'csv' | 'xlsx' | 'json' = 'csv',
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res?: Response,
  ) {
    const result = await this.exportService.exportAnalytics(
      req.user.id,
      format,
      new Date(startDate),
      new Date(endDate),
    );

    this.sendResult(res, result, format, 'analytics');
  }

  private sendResult(
    res: Response | undefined,
    result: any,
    format: string,
    name: string,
  ) {
    if (!res) return;

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${name}.json"`);
      res.send(JSON.stringify(result, null, 2));
      return;
    }

    if (format === 'xlsx') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${name}.xlsx"`);
      res.send(result);
      return;
    }

    // CSV
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${name}.csv"`);
    res.send('\uFEFF' + result);
  }
}