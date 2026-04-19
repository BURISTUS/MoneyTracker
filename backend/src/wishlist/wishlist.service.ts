import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GamificationService } from '../gamification/gamification.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class WishlistService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => GamificationService))
    private gamificationService: GamificationService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

  async findAll(userId: string) {
    const items = await this.prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    return items.map(item => ({
      ...item,
      isFrozen: item.status === 'PENDING' && item.cooldownEnds > now,
      isReady: item.status === 'READY' || (item.status === 'PENDING' && item.cooldownEnds <= now),
      daysRemaining: Math.max(0, Math.ceil((item.cooldownEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))),
      priceRub: Number(item.price) / 100,
    }));
  }

  async create(userId: string, data: { name: string; price: bigint; description?: string; category?: string; cooldownDays?: number }) {
    const cooldownDays = data.cooldownDays || 7;
    const cooldownEnds = new Date(Date.now() + cooldownDays * 24 * 60 * 60 * 1000);

    return this.prisma.wishlistItem.create({
      data: {
        userId,
        name: data.name,
        price: data.price,
        description: data.description || '',
        category: data.category,
        cooldownDays,
        cooldownEnds,
        status: 'PENDING',
      },
    });
  }

  async reject(userId: string, itemId: string): Promise<{ futureValue: number; message: string }> {
    const item = await this.prisma.wishlistItem.findUnique({ where: { id: itemId } });
    
    if (!item || item.userId !== userId) {
      throw new NotFoundException('Wishlist item not found');
    }

    if (item.status === 'PURCHASED' || item.status === 'REJECTED') {
      throw new BadRequestException('Item already decided');
    }

    if (item.status === 'PENDING' && item.cooldownEnds > new Date()) {
      throw new BadRequestException('Timer has not expired yet');
    }

    await this.prisma.wishlistItem.update({
      where: { id: itemId },
      data: { status: 'REJECTED', decidedAt: new Date() },
    });

    // Начисляем XP и обновляем savedAmount
    await this.gamificationService.addXpForRejectedWish(userId, item.price);

    // Рассчитываем будущую стоимость с инвестициями
    const futureValue = await this.calculateCompoundInterest(item.price, 10);

    return {
      futureValue: Number(futureValue) / 100,
      message: `Вы не купили ${item.name}. Эти ${Number(item.price) / 100}₽ через 10 лет превратятся в ${Number(futureValue) / 100}₽ (при 12% годовых)`,
    };
  }

  async purchase(userId: string, itemId: string) {
    const item = await this.prisma.wishlistItem.findUnique({ where: { id: itemId } });
    
    if (!item || item.userId !== userId) {
      throw new NotFoundException('Wishlist item not found');
    }

    if (item.status === 'PURCHASED' || item.status === 'REJECTED') {
      throw new BadRequestException('Item already decided');
    }

    await this.prisma.wishlistItem.update({
      where: { id: itemId },
      data: { status: 'PURCHASED', decidedAt: new Date(), purchasedAt: new Date() },
    });

    return { success: true, message: `Вы купили ${item.name} за ${Number(item.price) / 100}₽` };
  }

  async snooze(userId: string, itemId: string) {
    const item = await this.prisma.wishlistItem.findUnique({ where: { id: itemId } });
    
    if (!item || item.userId !== userId) {
      throw new NotFoundException('Wishlist item not found');
    }

    const newCooldownEnds = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.wishlistItem.update({
      where: { id: itemId },
      data: { 
        cooldownEnds: newCooldownEnds,
        status: 'PENDING',
      },
    });

    return { success: true, message: 'Таймер сброшен на 7 дней' };
  }

  async calculateCompoundInterest(principal: bigint, years: number = 10): Promise<bigint> {
    const annualRate = 0.12; // 12% годовых
    const monthlyRate = annualRate / 12;
    const months = years * 12;
    
    const principalNum = Number(principal);
    const futureValue = principalNum * Math.pow(1 + monthlyRate, months);
    
    return BigInt(Math.round(futureValue));
  }

  async getReadyItems(userId: string) {
    const now = new Date();
    return this.prisma.wishlistItem.findMany({
      where: {
        userId,
        status: 'PENDING',
        cooldownEnds: { lte: now },
      },
    });
  }
}
