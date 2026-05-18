import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/app-exception';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(
    userId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      categoryId?: string;
      type?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 50;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId };

    if (filters?.startDate && filters?.endDate) {
      where.date = {
        gte: filters.startDate,
        lte: filters.endDate,
      };
    }
    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }
    if (filters?.type) {
      where.type = filters.type;
    }

    const [items, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: { account: true, category: true },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, userId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
      include: { account: true, category: true },
    });
    if (!transaction) {
      throw new AppException('errors.transactionNotFound', 404);
    }
    return transaction;
  }

  async create(
    userId: string,
    data: {
      accountId: string;
      categoryId: string;
      amount: bigint;
      type: string;
      description?: string;
      date?: Date;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const account = await tx.account.findFirst({
        where: { id: data.accountId, userId },
      });
      if (!account) {
        throw new AppException('errors.accountNotFound', 400);
      }

      const category = await tx.category.findFirst({
        where: {
          id: data.categoryId,
          OR: [{ userId }, { userId: null }],
        },
      });
      if (!category) {
        throw new AppException('errors.categoryNotFound', 400);
      }

      const transaction = await tx.transaction.create({
        data: {
          userId,
          accountId: data.accountId,
          categoryId: data.categoryId,
          amount: data.amount,
          type: data.type as 'INCOME' | 'EXPENSE' | 'TRANSFER',
          description: data.description,
          date: data.date || new Date(),
        },
      });

      const balanceChange = data.type === 'INCOME' ? data.amount : -data.amount;
      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: { increment: balanceChange } },
      });

      return tx.transaction.findUnique({
        where: { id: transaction.id },
        include: { account: true, category: true },
      });
    });
  }

  async update(
    id: string,
    userId: string,
    data: {
      description?: string;
      date?: Date;
      amount?: bigint;
      accountId?: string;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findFirst({
        where: { id, userId },
        include: { account: true, category: true },
      });
      if (!transaction) {
        throw new AppException('errors.transactionNotFound', 404);
      }

      const oldAmount = transaction.amount;
      const oldAccountId = transaction.accountId;
      const newAmount = data.amount !== undefined ? data.amount : oldAmount;
      const newAccountId = data.accountId || oldAccountId;

      if (data.accountId && data.accountId !== oldAccountId) {
        const account = await tx.account.findFirst({
          where: { id: data.accountId, userId },
        });
        if (!account) throw new AppException('errors.accountNotFound', 400);
      }

      const oldBalanceChange =
        transaction.type === 'INCOME' ? -oldAmount : oldAmount;
      await tx.account.update({
        where: { id: oldAccountId },
        data: { balance: { increment: oldBalanceChange } },
      });

      const newBalanceChange =
        transaction.type === 'INCOME' ? newAmount : -newAmount;
      await tx.account.update({
        where: { id: newAccountId },
        data: { balance: { increment: newBalanceChange } },
      });

      return tx.transaction.update({
        where: { id },
        data: {
          description: data.description,
          date: data.date,
          amount: data.amount,
          accountId: data.accountId,
        },
        include: { account: true, category: true },
      });
    });
  }

  async delete(id: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findFirst({
        where: { id, userId },
      });
      if (!transaction) {
        throw new AppException('errors.transactionNotFound', 404);
      }

      const balanceChange =
        transaction.type === 'INCOME'
          ? -transaction.amount
          : transaction.amount;
      await tx.account.update({
        where: { id: transaction.accountId },
        data: { balance: { increment: balanceChange } },
      });

      return tx.transaction.delete({ where: { id } });
    });
  }

  async getSummary(userId: string, startDate: Date, endDate: Date) {
    const result = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
      _count: true,
    });

    let income = 0;
    let expenses = 0;
    let transactionCount = 0;

    for (const row of result) {
      const amount = Number(row._sum.amount ?? 0);
      transactionCount += row._count;
      if (row.type === 'INCOME') income = amount;
      else if (row.type === 'EXPENSE') expenses = amount;
    }

    return {
      income,
      expenses,
      balance: income - expenses,
      transactionCount,
    };
  }

  async transfer(
    userId: string,
    data: {
      fromAccountId: string;
      toAccountId: string;
      amount: bigint;
      description?: string;
      date?: Date;
    },
  ) {
    if (data.fromAccountId === data.toAccountId) {
      throw new AppException('errors.sameAccount');
    }

    const [fromAccount, toAccount] = await Promise.all([
      this.prisma.account.findFirst({
        where: { id: data.fromAccountId, userId },
      }),
      this.prisma.account.findFirst({
        where: { id: data.toAccountId, userId },
      }),
    ]);

    if (!fromAccount) throw new AppException('errors.accountNotFound', 404);
    if (!toAccount) throw new AppException('errors.accountNotFound', 404);

    const cannotGoNegative = ['CASH', 'BANK', 'INVESTMENT'].includes(
      fromAccount.type,
    );
    if (cannotGoNegative) {
      const currentBalance = Number(fromAccount.balance);
      const transferAmount = Number(data.amount);

      if (currentBalance <= 0) {
        throw new AppException('errors.negativeBalance', 400, {
          account: fromAccount.name,
          balance: (currentBalance / 100).toFixed(2),
        });
      }

      if (currentBalance < transferAmount) {
        throw new AppException('errors.insufficientFunds', 400, {
          available: (currentBalance / 100).toFixed(0),
          needed: (transferAmount / 100).toFixed(0),
        });
      }
    }

    let transferCategory = await this.prisma.category.findFirst({
      where: { name: 'Transfer', userId: null },
    });

    if (!transferCategory) {
      transferCategory = await this.prisma.category.create({
        data: {
          name: 'Transfer',
          type: 'EXPENSE',
          icon: 'swap-horizontal',
          color: '#6366F1',
          excludeFromTotal: true,
        },
      });
    }

    const transferDate = data.date || new Date();

    const result = await this.prisma.$transaction(async (tx) => {
      const fromTx = await tx.transaction.create({
        data: {
          userId,
          accountId: data.fromAccountId,
          categoryId: transferCategory.id,
          amount: data.amount,
          type: 'TRANSFER',
          description: data.description || `→ ${toAccount.name}`,
          date: transferDate,
        },
      });

      const toTx = await tx.transaction.create({
        data: {
          userId,
          accountId: data.toAccountId,
          categoryId: transferCategory.id,
          amount: data.amount,
          type: 'TRANSFER',
          description: data.description || `← ${fromAccount.name}`,
          date: transferDate,
        },
      });

      await tx.account.update({
        where: { id: data.fromAccountId },
        data: { balance: { decrement: data.amount } },
      });

      await tx.account.update({
        where: { id: data.toAccountId },
        data: { balance: { increment: data.amount } },
      });

      return { fromTx, toTx };
    });

    return {
      fromTransaction: {
        ...result.fromTx,
        amount: result.fromTx.amount.toString(),
      },
      toTransaction: {
        ...result.toTx,
        amount: result.toTx.amount.toString(),
      },
    };
  }

  async getAnalytics(userId: string, startDate: Date, endDate: Date) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
        type: { not: 'TRANSFER' },
      },
      include: { category: true },
      orderBy: { date: 'asc' },
    });

    const income = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const categoryMap = new Map<
      string,
      {
        category: {
          id: string;
          name: string;
          icon: string | null;
          color: string | null;
        };
        amount: number;
        count: number;
      }
    >();

    transactions.forEach((t) => {
      const cat = t.category;
      if (!cat) return;
      const key = cat.id;
      const entry = categoryMap.get(key) || {
        category: {
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
        },
        amount: 0,
        count: 0,
      };
      entry.amount += Number(t.amount);
      entry.count += 1;
      categoryMap.set(key, entry);
    });

    const totalForPercent = expense > 0 ? expense : income;
    const byCategory = Array.from(categoryMap.values())
      .map((c) => ({
        ...c,
        percentage:
          totalForPercent > 0 ? (c.amount / totalForPercent) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const dayMap = new Map<
      string,
      { date: string; income: number; expense: number }
    >();
    transactions.forEach((t) => {
      const dateKey = t.date.toISOString().split('T')[0];
      const entry = dayMap.get(dateKey) || {
        date: dateKey,
        income: 0,
        expense: 0,
      };
      if (t.type === 'INCOME') entry.income += Number(t.amount);
      else entry.expense += Number(t.amount);
      dayMap.set(dateKey, entry);
    });

    const byDay = Array.from(dayMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    const periodMs = endDate.getTime() - startDate.getTime();
    const prevEndDate = new Date(startDate.getTime() - 1);
    const prevStartDate = new Date(prevEndDate.getTime() - periodMs);

    const prevTransactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: prevStartDate, lte: prevEndDate },
        type: { not: 'TRANSFER' },
      },
    });

    const prevIncome = prevTransactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const prevExpense = prevTransactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const incomeChange =
      prevIncome > 0
        ? ((income - prevIncome) / prevIncome) * 100
        : income > 0
          ? 100
          : 0;
    const expenseChange =
      prevExpense > 0
        ? ((expense - prevExpense) / prevExpense) * 100
        : expense > 0
          ? 100
          : 0;
    const prevBalance = prevIncome - prevExpense;
    const balance = income - expense;
    const balanceChange =
      prevBalance !== 0
        ? ((balance - prevBalance) / Math.abs(prevBalance)) * 100
        : balance > 0
          ? 100
          : 0;

    return {
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      totals: { income, expense, balance },
      byCategory,
      byDay,
      comparison: {
        prevPeriod: {
          startDate: prevStartDate.toISOString(),
          endDate: prevEndDate.toISOString(),
        },
        incomeChange: Math.round(incomeChange * 10) / 10,
        expenseChange: Math.round(expenseChange * 10) / 10,
        balanceChange: Math.round(balanceChange * 10) / 10,
      },
    };
  }
}
