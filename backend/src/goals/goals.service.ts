import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/app-exception';

const DEFAULT_DEADLINE_MONTHS = 6;

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  private serializeGoal(goal: Record<string, unknown>) {
    const current = Number(goal.currentAmount);
    const target = Number(goal.targetAmount);
    return {
      ...goal,
      targetAmount: (goal.targetAmount as bigint).toString(),
      currentAmount: (goal.currentAmount as bigint).toString(),
      percentComplete: target > 0 ? (current / target) * 100 : 0,
      remaining: target - current,
      isCompleted: goal.isCompleted || current >= target,
    };
  }

  async findAll(userId: string) {
    const goals = await this.prisma.goal.findMany({
      where: { userId },
      include: {
        contributions: { orderBy: { date: 'desc' }, take: 10 },
        _count: { select: { contributions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return goals.map((g) => this.serializeGoal(g));
  }

  async findById(id: string, userId: string) {
    const goal = await this.prisma.goal.findFirst({
      where: { id, userId },
      include: {
        contributions: { orderBy: { date: 'desc' } },
        _count: { select: { contributions: true } },
      },
    });
    if (!goal) throw new AppException('errors.goalNotFound', 404);
    return this.serializeGoal(goal);
  }

  async create(
    userId: string,
    data: {
      name: string;
      targetAmount: bigint;
      currency?: string;
      deadline?: Date | string;
    },
  ) {
    const defaultDeadline = new Date();
    defaultDeadline.setMonth(
      defaultDeadline.getMonth() + DEFAULT_DEADLINE_MONTHS,
    );

    const goal = await this.prisma.goal.create({
      data: {
        userId,
        name: data.name,
        targetAmount: data.targetAmount,
        currency: data.currency || 'RUB',
        currentAmount: 0,
        deadline: data.deadline ? new Date(data.deadline) : defaultDeadline,
      },
    });
    return this.serializeGoal(goal);
  }

  async update(
    id: string,
    userId: string,
    data: { name?: string; targetAmount?: bigint; deadline?: Date | string },
  ) {
    const goal = await this.prisma.goal.findFirst({
      where: { id, userId },
    });
    if (!goal) throw new AppException('errors.goalNotFound', 404);

    const updated = await this.prisma.goal.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.targetAmount !== undefined && {
          targetAmount: data.targetAmount,
        }),
        ...(data.deadline !== undefined && {
          deadline: new Date(data.deadline),
        }),
      },
    });
    return this.serializeGoal(updated);
  }

  async addContribution(
    id: string,
    userId: string,
    data: { amount: bigint; note?: string; date?: Date },
  ) {
    const goal = await this.prisma.goal.findFirst({
      where: { id, userId },
    });
    if (!goal) throw new AppException('errors.goalNotFound', 404);

    if (data.amount <= 0) {
      throw new AppException('errors.invalidContribution', 400);
    }

    const newAmount = goal.currentAmount + data.amount;
    const isCompleted = newAmount >= goal.targetAmount;

    await this.prisma.$transaction([
      this.prisma.goalContribution.create({
        data: {
          goalId: id,
          amount: data.amount,
          note: data.note,
          date: data.date || new Date(),
        },
      }),
      this.prisma.goal.update({
        where: { id },
        data: { currentAmount: newAmount, isCompleted },
      }),
    ]);

    return this.findById(id, userId);
  }

  async delete(id: string, userId: string) {
    const goal = await this.prisma.goal.findFirst({
      where: { id, userId },
    });
    if (!goal) throw new AppException('errors.goalNotFound', 404);
    await this.prisma.goal.delete({ where: { id } });
    return { success: true };
  }
}
