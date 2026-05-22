import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/app-exception';

@Injectable()
export class BudgetService {
  private readonly logger = new Logger(BudgetService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findByMonth(userId: string, month: string) {
    const budgets = await this.prisma.budget.findMany({
      where: { userId, month },
      include: {
        category: {
          select: { id: true, name: true, icon: true, color: true, type: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await this.calculateSpent(userId, budget.categoryId, month);
        const amount = Number(budget.amount);
        const percentUsed = amount > 0 ? Math.round((spent / amount) * 100) : 0;
        return {
          id: budget.id,
          categoryId: budget.categoryId,
          category: budget.category,
          amount: budget.amount,
          month: budget.month,
          spent,
          percentUsed,
          isOverBudget: spent > amount,
          createdAt: budget.createdAt,
          updatedAt: budget.updatedAt,
        };
      }),
    );

    return result;
  }

  async create(userId: string, data: { categoryId: string; amount: number; month?: string }) {
    const month = data.month || this.getCurrentMonth();

    if (!this.isValidMonth(month)) {
      throw new AppException('budget.invalidMonth', 400);
    }

    const category = await this.prisma.category.findFirst({
      where: {
        id: data.categoryId,
        OR: [{ userId }, { userId: null }],
      },
    });

    if (!category) {
      throw new AppException('errors.categoryNotFound', 404);
    }

    try {
      const budget = await this.prisma.budget.create({
        data: {
          userId,
          categoryId: data.categoryId,
          amount: BigInt(Math.round(data.amount)),
          month,
        },
        include: {
          category: {
            select: { id: true, name: true, icon: true, color: true, type: true },
          },
        },
      });

      return budget;
    } catch (error: unknown) {
      const prismaError = error as { code?: string };
      if (prismaError?.code === 'P2002') {
        throw new AppException('budget.alreadyExists', 409);
      }
      throw error;
    }
  }

  async update(userId: string, budgetId: string, amount: number) {
    const budget = await this.prisma.budget.findFirst({
      where: { id: budgetId, userId },
    });

    if (!budget) {
      throw new AppException('budget.notFound', 404);
    }

    return this.prisma.budget.update({
      where: { id: budgetId },
      data: { amount: BigInt(Math.round(amount)) },
      include: {
        category: {
          select: { id: true, name: true, icon: true, color: true, type: true },
        },
      },
    });
  }

  async delete(userId: string, budgetId: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id: budgetId, userId },
    });

    if (!budget) {
      throw new AppException('budget.notFound', 404);
    }

    await this.prisma.budget.delete({ where: { id: budgetId } });
    return { success: true };
  }

  async carryForward(userId: string) {
    const currentMonth = this.getCurrentMonth();
    const previousMonth = this.getPreviousMonth(currentMonth);

    const previousBudgets = await this.prisma.budget.findMany({
      where: { userId, month: previousMonth },
    });

    if (previousBudgets.length === 0) {
      return { carried: 0 };
    }

    const existing = await this.prisma.budget.findMany({
      where: { userId, month: currentMonth },
      select: { categoryId: true },
    });
    const existingCategoryIds = new Set(existing.map((b) => b.categoryId));

    let carried = 0;
    for (const prev of previousBudgets) {
      if (existingCategoryIds.has(prev.categoryId)) continue;
      await this.prisma.budget.create({
        data: {
          userId,
          categoryId: prev.categoryId,
          amount: prev.amount,
          month: currentMonth,
        },
      });
      carried++;
    }

    return { carried };
  }

  @Cron('0 0 1 * *') // Every 1st of month at 00:00
  async scheduledCarryForward() {
    this.logger.log('Running scheduled budget carry-forward...');
    const currentMonth = this.getCurrentMonth();
    const previousMonth = this.getPreviousMonth(currentMonth);

    // Get all users who had budgets last month
    const usersWithBudgets = await this.prisma.budget.findMany({
      where: { month: previousMonth },
      select: { userId: true },
      distinct: ['userId'],
    });

    let totalCarried = 0;
    for (const { userId } of usersWithBudgets) {
      const result = await this.carryForward(userId);
      totalCarried += result.carried;
    }

    this.logger.log(`Carried forward ${totalCarried} budgets for ${usersWithBudgets.length} users`);
  }

  async calculateSpent(userId: string, categoryId: string, month: string): Promise<number> {
    const [year, mon] = month.split('-').map(Number);
    const startDate = new Date(year, mon - 1, 1);
    const endDate = new Date(year, mon, 1);

    const result = await this.prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        userId,
        categoryId,
        type: 'EXPENSE',
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    return Number(result._sum.amount || 0);
  }

  private getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  private getPreviousMonth(month: string): string {
    const [year, mon] = month.split('-').map(Number);
    if (mon === 1) {
      return `${year - 1}-12`;
    }
    return `${year}-${String(mon - 1).padStart(2, '0')}`;
  }

  private isValidMonth(month: string): boolean {
    return /^\d{4}-(0[1-9]|1[0-2])$/.test(month);
  }
}
