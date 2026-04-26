import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BudgetService {
  constructor(private prisma: PrismaService) {}

  private getMonthBounds(date: Date) {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  }

  private async calculateProgress(budget: { categoryId: string; amount: bigint; alertThreshold: number; period: string }, userId: string) {
    let startDate: Date;
    let endDate: Date;
    const now = new Date();

    if (budget.period === 'MONTHLY') {
      const bounds = this.getMonthBounds(now);
      startDate = bounds.start;
      endDate = bounds.end;
    } else if (budget.period === 'WEEKLY') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      startDate = new Date(now.getFullYear(), now.getMonth(), diff);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (budget.period === 'YEARLY') {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else {
      const bounds = this.getMonthBounds(now);
      startDate = bounds.start;
      endDate = bounds.end;
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        categoryId: budget.categoryId,
        type: 'EXPENSE',
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const spent = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const amountNum = Number(budget.amount);
    const remaining = amountNum - spent;
    const percentUsed = amountNum > 0 ? (spent / amountNum) * 100 : 0;

    return {
      spent,
      remaining,
      percentUsed,
      isOverBudget: spent > amountNum,
      isNearLimit: percentUsed >= budget.alertThreshold,
      currentStartDate: startDate,
      currentEndDate: endDate,
    };
  }

  async findAll(userId: string) {
    const budgets = await this.prisma.budget.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    const budgetsWithProgress = await Promise.all(
      budgets.map(async (budget) => {
        const progress = await this.calculateProgress(budget, userId);
        return {
          ...budget,
          amount: budget.amount.toString(),
          ...progress,
        };
      }),
    );

    return budgetsWithProgress;
  }

  async create(userId: string, data: { categoryId: string; amount: bigint; alertThreshold?: number }) {
    const now = new Date();
    const { start, end } = this.getMonthBounds(now);

    return this.prisma.budget.create({
      data: {
        userId,
        categoryId: data.categoryId,
        amount: data.amount,
        period: 'MONTHLY',
        startDate: start,
        endDate: end,
        alertThreshold: data.alertThreshold ?? 80,
      },
      include: { category: true },
    });
  }

  async update(id: string, userId: string, data: { amount?: bigint; alertThreshold?: number }) {
    const budget = await this.prisma.budget.findFirst({ where: { id, userId } });
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }
    return this.prisma.budget.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async delete(id: string, userId: string) {
    const budget = await this.prisma.budget.findFirst({ where: { id, userId } });
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }
    return this.prisma.budget.delete({ where: { id } });
  }

  async getProgress(id: string, userId: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, userId },
      include: { category: true },
    });
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    const progress = await this.calculateProgress(budget, userId);
    return {
      ...budget,
      amount: budget.amount.toString(),
      ...progress,
    };
  }
}
