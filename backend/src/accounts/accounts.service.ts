import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CurrencyService } from '../currency/currency.service';
import { AppException } from '../common/app-exception';
import { SubscriptionService } from '../subscription/subscription.service';
import { ACCOUNT_TYPE_ACCESS, ACCOUNT_LIMITS } from '../common/features.config';
import { AccountType } from '@prisma/client';

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

  async create(
    userId: string,
    data: { name: string; type: string; currency?: string },
  ) {
    const allowedTypes =
      await this.subscriptionService.getAllowedAccountTypes(userId);
    if (!allowedTypes.includes(data.type)) {
      throw new AppException('errors.accountTypeNotAllowed', 403, {
        type: data.type,
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.account.count({ where: { userId } });
      const limit = await this.subscriptionService.getAccountLimit(userId);
      if (limit !== Infinity && existing >= limit) {
        throw new AppException('errors.accountLimitReached', 403, { limit });
      }

      return tx.account.create({
        data: {
          userId,
          name: data.name,
          type: data.type as AccountType,
          currency: data.currency || 'RUB',
          balance: 0,
        },
      });
    });
  }

  async update(
    id: string,
    userId: string,
    data: { name?: string; includeInTotal?: boolean; balance?: number },
  ) {
    await this.findById(id, userId);
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.includeInTotal !== undefined)
      updateData.includeInTotal = data.includeInTotal;
    if (data.balance !== undefined) updateData.balance = BigInt(data.balance);
    return this.prisma.account.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string, userId: string) {
    await this.findById(id, userId);
    return this.prisma.account.delete({ where: { id } });
  }

  async getTotalBalance(
    userId: string,
    targetCurrency: string = 'RUB',
  ) {
    const accounts = await this.prisma.account.findMany({
      where: { userId, includeInTotal: true },
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
    return {
      total,
      currency: targetCurrency,
      accountsCount: accounts.length,
    };
  }

  async createDefaultsForUser(userId: string) {
    const defaultAccounts = [
      {
        name: 'Cash',
        type: 'CASH' as const,
        isDefault: true,
      },
      {
        name: 'Bank Account',
        type: 'BANK' as const,
        isDefault: false,
      },
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
