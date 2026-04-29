import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  private serializeGoal(goal: { targetAmount: bigint; currentAmount: bigint; isCompleted: boolean; [key: string]: unknown }) {
    return {
      ...goal,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      percentComplete: (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100,
      remaining: Number(goal.targetAmount) - Number(goal.currentAmount),
      isCompleted: goal.isCompleted || (Number(goal.currentAmount) >= Number(goal.targetAmount)),
    };
  }

  async findAll(userId: string) {
    const goals = await this.prisma.goal.findMany({
      where: { userId },
      orderBy: { deadline: 'asc' },
    });

    return goals.map((goal) => this.serializeGoal(goal));
  }

  async create(userId: string, data: { name: string; targetAmount: bigint; deadline?: Date | string }) {
    const goal = await this.prisma.goal.create({
      data: {
        user: { connect: { id: userId } },
        name: data.name,
        targetAmount: data.targetAmount,
        currentAmount: 0,
        deadline: data.deadline ?? new Date(),
      },
    });
    return this.serializeGoal(goal);
  }

  async update(id: string, userId: string, data: { name?: string; targetAmount?: bigint; deadline?: Date | string }) {
    const goal = await this.prisma.goal.findFirst({ where: { id, userId } });
    if (!goal) {
      throw new NotFoundException('Goal not found');
    }
    const updateData: { name?: string; targetAmount?: bigint; deadline?: Date | string } = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.targetAmount !== undefined) updateData.targetAmount = data.targetAmount;
    if (data.deadline !== undefined) updateData.deadline = data.deadline;
    const updated = await this.prisma.goal.update({ where: { id }, data: updateData });
    return this.serializeGoal(updated);
  }

  async updateProgress(id: string, userId: string, amount: bigint) {
    const goal = await this.prisma.goal.findFirst({ where: { id, userId } });
    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    const newCurrentAmount = Number(goal.currentAmount) + Number(amount);
    const isCompleted = newCurrentAmount >= Number(goal.targetAmount);

    const updated = await this.prisma.goal.update({
      where: { id },
      data: {
        currentAmount: newCurrentAmount,
        isCompleted,
      },
    });
    return this.serializeGoal(updated);
  }

  async delete(id: string, userId: string) {
    const goal = await this.prisma.goal.findFirst({ where: { id, userId } });
    if (!goal) {
      throw new NotFoundException('Goal not found');
    }
    return this.prisma.goal.delete({ where: { id } });
  }
}
