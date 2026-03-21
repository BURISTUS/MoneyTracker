import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

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

  // Create default accounts for new user
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
