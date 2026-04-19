import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data: {
        ...data,
        gamification: {
          create: {
            xp: 0,
            level: 1,
            savedAmount: 0,
            status: 'CONSUMER_DRONE',
          },
        },
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { gamification: true },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async updateHourlyRate(id: string, hourlyRate: number) {
    return this.update(id, { hourlyRate });
  }

  async updateCurrency(id: string, currency: string) {
    return this.update(id, { currency: currency.toUpperCase() });
  }

  async updateLanguage(id: string, language: string) {
    return this.update(id, { language });
  }
}
