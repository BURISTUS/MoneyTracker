import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, filters?: { startDate?: Date; endDate?: Date; categoryId?: string; type?: string }) {
    const where: any = { userId };
    
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

    return this.prisma.transaction.findMany({
      where,
      include: { account: true, category: true },
      orderBy: { date: 'desc' },
    });
  }

  async findById(id: string, userId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
      include: { account: true, category: true },
    });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }

  async create(userId: string, data: { accountId: string; categoryId: string; amount: bigint; type: string; description?: string; date?: Date }) {
    // Verify account belongs to user
    const account = await this.prisma.account.findFirst({
      where: { id: data.accountId, userId },
    });
    if (!account) {
      throw new BadRequestException('Invalid account');
    }

    // Verify category belongs to user
    const category = await this.prisma.category.findFirst({
      where: { id: data.categoryId, userId },
    });
    if (!category) {
      throw new BadRequestException('Invalid category');
    }

    // Create transaction
    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        accountId: data.accountId,
        categoryId: data.categoryId,
        amount: data.amount,
        type: data.type as any,
        description: data.description,
        date: data.date || new Date(),
      },
    });

    // Update account balance
    const balanceChange = data.type === 'INCOME' ? data.amount : -data.amount;
    await this.prisma.account.update({
      where: { id: data.accountId },
      data: { balance: { increment: balanceChange } },
    });

    return transaction;
  }

  async update(id: string, userId: string, data: { description?: string; date?: Date }) {
    const transaction = await this.findById(id, userId);
    return this.prisma.transaction.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, userId: string) {
    const transaction = await this.findById(id, userId);
    
    // Revert account balance
    const balanceChange = transaction.type === 'INCOME' ? -transaction.amount : transaction.amount;
    await this.prisma.account.update({
      where: { id: transaction.accountId },
      data: { balance: { increment: balanceChange } },
    });

    return this.prisma.transaction.delete({ where: { id } });
  }

  async getSummary(userId: string, startDate: Date, endDate: Date) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
    });

    const income = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const expenses = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      income,
      expenses,
      balance: income - expenses,
      transactionCount: transactions.length,
    };
  }
}
