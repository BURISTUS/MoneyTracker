import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    const goals = await this.prisma.goal.findMany({
      where: { userId },
      orderBy: { deadline: 'asc' },
    });
    
    return goals.map(goal => ({
      ...goal,
      percentComplete: (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100,
      remaining: Number(goal.targetAmount) - Number(goal.currentAmount),
    }));
  }

  async create(userId: string, data: { name: string; targetAmount: bigint; deadline: Date }) {
    return this.prisma.goal.create({
      data: {
        userId,
        name: data.name,
        targetAmount: data.targetAmount,
        deadline: data.deadline,
        currentAmount: 0,
      },
    });
  }

  async updateProgress(id: string, userId: string, amount: bigint) {
    const goal = await this.prisma.goal.findFirst({ where: { id, userId } });
    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    const newCurrentAmount = Number(goal.currentAmount) + Number(amount);
    const isCompleted = newCurrentAmount >= Number(goal.targetAmount);

    return this.prisma.goal.update({
      where: { id },
      data: {
        currentAmount: newCurrentAmount,
        isCompleted,
      },
    });
  }

  async delete(id: string, userId: string) {
    const goal = await this.prisma.goal.findFirst({ where: { id, userId } });
    if (!goal) {
      throw new NotFoundException('Goal not found');
    }
    return this.prisma.goal.delete({ where: { id } });
  }
}
