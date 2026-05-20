import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: { type: NotificationType; title: string; body: string; data?: any }) {
    return this.prisma.notification.create({
      data: {
        userId,
        type: data.type,
        title: data.title,
        body: data.body,
        data: data.data,
      },
    });
  }

  async getByUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { sentAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async sendWishlistReady(userId: string, itemName: string, itemId: string) {
    return this.create(userId, {
      type: 'WISHLIST_READY',
      title: 'Время принять решение! 🎯',
      body: `Прошло 7 дней. Ты все еще хочешь "${itemName}"?`,
      data: { wishlistItemId: itemId },
    });
  }

  async sendBudgetAlert(userId: string, categoryName: string, percentUsed: number) {
    return this.create(userId, {
      type: 'BUDGET_ALERT',
      title: 'Внимание! ⚠️',
      body: `Ты использовал ${percentUsed}% бюджета на "${categoryName}"`,
    });
  }
}
