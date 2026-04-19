import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CurrencyService } from '../currency/currency.service';

@Injectable()
export class AccountsService {
  constructor(
    private prisma: PrismaService,
    private currencyService: CurrencyService,
  ) {}

  async findAll(userId: string) {
    return this.prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, userId: string) {
    const account = await this.prisma.account.findFirst({
      where: { id, userId },
    });
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }

  async create(userId: string, data: { name: string; type: string; currency?: string }) {
    return this.prisma.account.create({
      data: {
        userId,
        name: data.name,
        type: data.type as any,
        currency: data.currency || 'RUB',
        balance: 0,
      },
    });
  }

  async update(id: string, userId: string, data: { name?: string }) {
    await this.findById(id, userId);
    return this.prisma.account.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, userId: string) {
    await this.findById(id, userId);
    return this.prisma.account.delete({ where: { id } });
  }

  async getTotalBalance(userId: string, targetCurrency: string = 'RUB') {
    const accounts = await this.prisma.account.findMany({
      where: { userId },
    });

    let total = 0;
    for (const acc of accounts) {
      if (acc.currency === targetCurrency) {
        total += Number(acc.balance);
      } else {
        const converted = await this.currencyService.convert(
          Number(acc.balance) / 100,
          acc.currency,
          targetCurrency,
        );
        total += Math.round(converted * 100);
      }
    }
    return { total, currency: targetCurrency, accountsCount: accounts.length };
  }

  async createDefaultsForUser(userId: string) {
    const defaultAccounts = [
      { name: 'Наличные', type: 'CASH' as const, isDefault: true },
      { name: 'Тинькофф', type: 'BANK' as const, isDefault: false },
      { name: 'Альфа', type: 'CREDIT' as const, isDefault: false },
    ];

    const created = [];
    for (const acc of defaultAccounts) {
      const createdAcc = await this.prisma.account.create({
        data: {
          userId,
          name: acc.name,
          type: acc.type,
          currency: 'RUB',
          balance: 0,
          isDefault: acc.isDefault,
        },
      });
      created.push(createdAcc);
    }

    return created;
  }
}
