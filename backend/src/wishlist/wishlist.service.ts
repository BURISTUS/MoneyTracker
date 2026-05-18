import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/app-exception';

export interface SerializedWishlistItem {
  [key: string]: unknown;
  price: number;
  status: string;
  cooldownEnds: Date;
  isFrozen: boolean;
  isReady: boolean;
  daysRemaining: number;
}

const INVESTMENT_YEARS = 10;
const ANNUAL_RATE = 0.12;

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    const items = await this.prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();

    const serialize = (item: Record<string, unknown>): SerializedWishlistItem => ({
      ...item,
      price: Number(item.price),
      status: item.status as string,
      cooldownEnds: item.cooldownEnds as Date,
      isFrozen: item.status === 'PENDING' && (item.cooldownEnds as Date) > now,
      isReady:
        item.status === 'READY' ||
        (item.status === 'PENDING' && (item.cooldownEnds as Date) <= now),
      daysRemaining: Math.max(
        0,
        Math.ceil(
          ((item.cooldownEnds as Date).getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      ),
    });

    const all = items.map((item) =>
      serialize(item as unknown as Record<string, unknown>),
    );

    const ready = all.filter(
      (i) =>
        i.isReady &&
        i.status !== 'REJECTED' &&
        i.status !== 'PURCHASED',
    );
    const pending = all.filter(
      (i) => i.status === 'PENDING' && i.cooldownEnds > now,
    );
    const history = all.filter(
      (i) => i.status === 'REJECTED' || i.status === 'PURCHASED',
    );

    return { ready, pending, history, all };
  }

  async create(
    userId: string,
    data: {
      name: string;
      price: bigint;
      description?: string;
      category?: string;
      cooldownDays?: number;
    },
  ) {
    const cooldownDays = data.cooldownDays || 7;
    const cooldownEnds = new Date(
      Date.now() + cooldownDays * 24 * 60 * 60 * 1000,
    );

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

  async reject(
    userId: string,
    itemId: string,
  ): Promise<{
    item: Record<string, unknown>;
    futureValue: number;
    message: string;
  }> {
    const item = await this.prisma.wishlistItem.findUnique({
      where: { id: itemId },
    });

    if (!item || item.userId !== userId) {
      throw new AppException('errors.wishlistNotFound', 404);
    }

    if (item.status === 'PURCHASED' || item.status === 'REJECTED') {
      throw new AppException('errors.wishlistAlreadyDecided', 400);
    }

    const updated = await this.prisma.wishlistItem.update({
      where: { id: itemId },
      data: { status: 'REJECTED', decidedAt: new Date() },
    });

    const futureValue = await this.calculateCompoundInterest(
      item.price,
      INVESTMENT_YEARS,
    );

    return {
      item: { ...updated, price: Number(updated.price) },
      futureValue: Number(futureValue) / 100,
      message: `Вы не купили ${updated.name}. Эти ${Number(updated.price) / 100}\u20BD через ${INVESTMENT_YEARS} лет превратятся в ${Number(futureValue) / 100}\u20BD (при ${(ANNUAL_RATE * 100).toFixed(0)}% годовых)`,
    };
  }

  async purchase(userId: string, itemId: string) {
    const item = await this.prisma.wishlistItem.findUnique({
      where: { id: itemId },
    });

    if (!item || item.userId !== userId) {
      throw new AppException('errors.wishlistNotFound', 404);
    }

    if (item.status === 'PURCHASED' || item.status === 'REJECTED') {
      throw new AppException('errors.wishlistAlreadyDecided', 400);
    }

    const updated = await this.prisma.wishlistItem.update({
      where: { id: itemId },
      data: {
        status: 'PURCHASED',
        decidedAt: new Date(),
        purchasedAt: new Date(),
      },
    });

    return {
      success: true,
      item: { ...updated, price: Number(updated.price) },
      message: `Вы купили ${updated.name} за ${Number(updated.price) / 100}\u20BD`,
    };
  }

  async snooze(userId: string, itemId: string) {
    const item = await this.prisma.wishlistItem.findUnique({
      where: { id: itemId },
    });

    if (!item || item.userId !== userId) {
      throw new AppException('errors.wishlistNotFound', 404);
    }

    const newCooldownEnds = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.wishlistItem.update({
      where: { id: itemId },
      data: {
        cooldownEnds: newCooldownEnds,
        status: 'PENDING',
      },
    });

    return { success: true, message: 'wishlist.cooldownReset' };
  }

  async calculateCompoundInterest(
    principal: bigint,
    years: number = INVESTMENT_YEARS,
  ): Promise<bigint> {
    const monthlyRate = ANNUAL_RATE / 12;
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
