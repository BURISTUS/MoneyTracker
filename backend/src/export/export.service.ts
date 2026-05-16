import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionsService } from '../transactions/transactions.service';
import * as XLSX from 'xlsx';
import { parse } from 'json2csv';

@Injectable()
export class ExportService {
  constructor(
    private prisma: PrismaService,
    private transactionsService: TransactionsService,
  ) {}

  async exportTransactions(
    userId: string,
    format: 'csv' | 'xlsx' | 'json',
    startDate?: Date,
    endDate?: Date,
  ) {
    const where: any = {
      userId,
      type: { not: 'TRANSFER' },
    };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      include: { account: true, category: true },
      orderBy: { date: 'desc' },
    });

    const rows = transactions.map((t) => ({
      Дата: t.date.toISOString().split('T')[0],
      Тип: t.type === 'INCOME' ? 'Доход' : 'Расход',
      Категория: t.category?.name ?? '—',
      Счёт: t.account?.name ?? '—',
      Сумма: Number(t.amount) / 100,
      Описание: t.description ?? '',
    }));

    return this.format(rows, format, 'transactions');
  }

  async exportAnalytics(
    userId: string,
    format: 'csv' | 'xlsx' | 'json',
    startDate: Date,
    endDate: Date,
  ) {
    const analytics = await this.transactionsService.getAnalytics(userId, startDate, endDate);

    const byCategoryRows = analytics.byCategory.map((c: any) => ({
      Категория: c.category.name,
      Тип: c.category.type === 'INCOME' ? 'Доход' : 'Расход',
      Сумма: c.amount / 100,
      Процент: c.percentage.toFixed(1),
      Количество: c.count,
    }));

    const byDayRows = analytics.byDay.map((d: any) => ({
      Дата: d.date,
      Доход: d.income / 100,
      Расход: d.expense / 100,
    }));

    const summary = {
      Период: `${startDate.toISOString().split('T')[0]} — ${endDate.toISOString().split('T')[0]}`,
      Доходы: analytics.totals.income / 100,
      Расходы: analytics.totals.expense / 100,
      Баланс: analytics.totals.balance / 100,
    };

    if (format === 'json') {
      return { summary, byCategory: byCategoryRows, byDay: byDayRows };
    }

    // For CSV/XLSX combine sheets
    return this.formatAnalytics(byCategoryRows, byDayRows, summary, format);
  }

  private format(rows: any[], format: 'csv' | 'xlsx' | 'json', name: string) {
    if (format === 'json') return rows;

    if (format === 'csv') {
      return parse(rows, { delimiter: ',', quote: '"' });
    }

    // XLSX
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, name);
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return buf;
  }

  private formatAnalytics(
    byCategory: any[],
    byDay: any[],
    summary: any,
    format: 'csv' | 'xlsx',
  ) {
    if (format === 'csv') {
      const csv1 = parse(byCategory, { delimiter: ',', quote: '"' });
      const csv2 = parse(byDay, { delimiter: ',', quote: '"' });
      const csv3 = parse([summary], { delimiter: ',', quote: '"' });
      return `--- Сводка ---\n${csv3}\n\n--- По категориям ---\n${csv1}\n\n--- По дням ---\n${csv2}`;
    }

    // XLSX — multiple sheets
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([summary]), 'Сводка');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(byCategory), 'Категории');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(byDay), 'По дням');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }
}