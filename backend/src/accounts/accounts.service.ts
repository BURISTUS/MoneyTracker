import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CurrencyService } from '../currency/currency.service';
import { AppException } from '../common/app-exception';
import { SubscriptionService } from '../subscription/subscription.service';
import { ACCOUNT_TYPE_ACCESS, ACCOUNT_LIMITS, PlanType } from '../common/features.config';

@Injectable()
export class AccountsService {
  constructor(
    private prisma: PrismaService,
    private currencyService: CurrencyService,
    private subscriptionService: SubscriptionService,
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
      throw new AppException('errors.accountNotFound', 404);
    }
    return account;
  }

  async create(userId: string, data: { name: string; type: string; currency?: string }) {
    // Проверяем тип счёта по плану
    const allowedTypes = await this.subscriptionService.getAllowedAccountTypes(userId);
    if (!allowedTypes.includes(data.type)) {
      throw new AppException('errors.accountTypeNotAllowed', 403, { type: data.type });
    }

    // Проверяем лимит счётов
    const existing = await this.prisma.account.count({ where: { userId } });
    const limit = await this.subscriptionService.getAccountLimit(userId);
    if (limit !== Infinity && existing >= limit) {
      throw new AppException('errors.accountLimitReached', 403, { limit });
    }

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

  async update(id: string, userId: string, data: Prisma.AccountUpdateInput) {
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
    let includedCount = 0;
    for (const acc of accounts) {
      if (!acc.includeInTotal) continue;
      includedCount++;
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
    return { total, currency: targetCurrency, accountsCount: includedCount };
  }

  async createDefaultsForUser(userId: string) {
    const defaultAccounts = [
      { name: 'Наличные', type: 'CASH' as const, isDefault: true },
      { name: 'Банковский счёт', type: 'BANK' as const, isDefault: false },
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
