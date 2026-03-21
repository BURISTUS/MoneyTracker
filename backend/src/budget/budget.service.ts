import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BudgetService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.budget.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, data: { categoryId: string; amount: bigint; period: string; startDate: Date; endDate: Date; alertThreshold?: number }) {
    return this.prisma.budget.create({
      data: {
        userId,
        categoryId: data.categoryId,
        amount: data.amount,
        period: data.period as any,
        startDate: data.startDate,
        endDate: data.endDate,
        alertThreshold: data.alertThreshold || 80,
      },
    });
  }

  async getProgress(id: string, userId: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, userId },
      include: { category: true },
    });
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        categoryId: budget.categoryId,
        type: 'EXPENSE',
        date: {
          gte: budget.startDate,
          lte: budget.endDate,
        },
      },
    });

    const spent = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const remaining = Number(budget.amount) - spent;
    const percentUsed = (spent / Number(budget.amount)) * 100;

    return {
      ...budget,
      spent,
      remaining,
      percentUsed,
      isOverBudget: spent > Number(budget.amount),
      isNearLimit: percentUsed >= budget.alertThreshold,
    };
  }

  async delete(id: string, userId: string) {
    const budget = await this.prisma.budget.findFirst({ where: { id, userId } });
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }
    return this.prisma.budget.delete({ where: { id } });
  }
}
