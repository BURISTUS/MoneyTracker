import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GamificationStatus } from '@prisma/client';

@Injectable()
export class GamificationService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const gamification = await this.prisma.userGamification.findUnique({
      where: { userId },
    });

    if (!gamification) {
      // Create default gamification profile
      return this.prisma.userGamification.create({
        data: {
          userId,
          xp: 0,
          level: 1,
          savedAmount: 0,
          status: 'CONSUMER_DRONE',
        },
      });
    }

    const nextLevelXp = this.getNextLevelXp(gamification.level);
    const progressToNext = (gamification.xp - this.getLevelXp(gamification.level)) / (nextLevelXp - this.getLevelXp(gamification.level));

    return {
      ...gamification,
      nextLevelXp,
      progressToNext: Math.min(progressToNext * 100, 100),
      savedAmountRub: Number(gamification.savedAmount) / 100,
    };
  }

  async addXpForRejectedWish(userId: string, amount: bigint): Promise<void> {
    const xp = Number(amount) / 100; // 1 XP за каждые 100 рублей
    
    await this.prisma.userGamification.update({
      where: { userId },
      data: {
        xp: { increment: xp },
        savedAmount: { increment: amount },
      },
    });

    await this.checkLevelUp(userId);
  }

  async checkLevelUp(userId: string): Promise<void> {
    const profile = await this.prisma.userGamification.findUnique({ where: { userId } });
    if (!profile) return;

    const newLevel = this.calculateLevel(profile.xp);
    
    if (newLevel > profile.level) {
      const newStatus = this.getStatusForLevel(newLevel);
      
      await this.prisma.userGamification.update({
        where: { userId },
        data: { level: newLevel, status: newStatus },
      });
    }
  }

  private calculateLevel(xp: number): number {
    // Формула: level = floor(sqrt(xp / 100)) + 1
    // XP needed: 100, 400, 900, 1600, 2500, ... for levels 2, 3, 4, 5, 6, ...
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }

  private getLevelXp(level: number): number {
    return Math.pow(level - 1, 2) * 100;
  }

  private getNextLevelXp(level: number): number {
    return Math.pow(level, 2) * 100;
  }

  private getStatusForLevel(level: number): GamificationStatus {
    if (level >= 20) return 'FINANCIAL_ARCHITECT';
    if (level >= 15) return 'CAPITALIST';
    if (level >= 10) return 'STRATEGIST';
    if (level >= 5) return 'ASCETIC';
    return 'CONSUMER_DRONE';
  }

  getLevelInfo() {
    return [
      { level: 1, name: 'Consumer Drone', icon: '🐌', minXp: 0 },
      { level: 2, name: 'Awakening', icon: '🌅', minXp: 100 },
      { level: 3, name: 'Ascetic', icon: '🧘', minXp: 400 },
      { level: 4, name: 'Strategist', icon: '♟️', minXp: 900 },
      { level: 5, name: 'Capitalist', icon: '💰', minXp: 1600 },
      { level: 6, name: 'Financial Architect', icon: '🏛️', minXp: 2500 },
    ];
  }
}
