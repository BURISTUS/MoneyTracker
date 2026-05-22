import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/app-exception';
import * as crypto from 'crypto';

@Injectable()
export class FamilyService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, name: string) {
    const inviteCode = crypto
      .randomBytes(6)
      .toString('hex')
      .toUpperCase();

    const family = await this.prisma.family.create({
      data: {
        name,
        inviteCode,
        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
      include: { members: { include: { user: true } } },
    });

    return family;
  }

  async join(userId: string, inviteCode: string) {
    const family = await this.prisma.family.findUnique({
      where: { inviteCode: inviteCode.toUpperCase() },
    });

    if (!family) {
      throw new AppException('errors.familyNotFound', 404);
    }

    const existingMember = await this.prisma.familyMember.findUnique({
      where: { userId },
    });

    if (existingMember) {
      throw new AppException('errors.alreadyInFamily', 400);
    }

    return this.prisma.familyMember.create({
      data: {
        familyId: family.id,
        userId,
        role: 'MEMBER',
      },
    });
  }

  async getMyFamily(userId: string) {
    const member = await this.prisma.familyMember.findUnique({
      where: { userId },
      include: {
        family: { include: { members: { include: { user: true } } } },
      },
    });

    return member?.family;
  }

  async getMembers(userId: string) {
    const member = await this.prisma.familyMember.findUnique({
      where: { userId },
    });

    if (!member) {
      throw new AppException('errors.notInFamily', 404);
    }

    return this.prisma.familyMember.findMany({
      where: { familyId: member.familyId },
      include: { user: true },
    });
  }

  async getBudget(userId: string) {
    const member = await this.prisma.familyMember.findUnique({
      where: { userId },
    });

    if (!member) {
      throw new AppException('errors.notInFamily', 404);
    }

    const familyMembers = await this.prisma.familyMember.findMany({
      where: { familyId: member.familyId },
      select: { userId: true },
    });

    const userIds = familyMembers.map((m) => m.userId);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId: { in: userIds },
        type: 'EXPENSE',
        date: { gte: startOfMonth },
      },
      include: { category: true },
    });

    const userSpending = familyMembers.map((fm) => {
      const userTx = transactions.filter((t) => t.userId === fm.userId);
      const total = userTx.reduce((sum, t) => sum + Number(t.amount), 0);
      return {
        userId: fm.userId,
        totalSpent: total / 100,
        transactionCount: userTx.length,
      };
    });

    return {
      totalSpent:
        transactions.reduce((sum, t) => sum + Number(t.amount), 0) / 100,
      memberSpending: userSpending,
      startOfMonth: startOfMonth.toISOString(),
    };
  }
}
