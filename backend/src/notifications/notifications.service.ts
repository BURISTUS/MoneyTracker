import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

interface CreateNotificationData {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: CreateNotificationData) {
    try {
      return await this.prisma.notification.create({
        data: {
          userId,
          type: data.type,
          title: data.title,
          body: data.body,
          data: data.data as Record<string, string>,
        },
      });
    } catch (error: unknown) {
      this.logger.error(`Failed to create notification for user ${userId}: ${error}`);
      return null;
    }
  }

  async getByUser(userId: string, page = 1, limit = 30) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { sentAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { updated: result.count };
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async deleteOldNotifications(olderThanDays: number): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - olderThanDays);
    const result = await this.prisma.notification.deleteMany({
      where: { isRead: true, sentAt: { lt: cutoff } },
    });
    return result.count;
  }

  // --- Specific notification senders ---

  async sendWishlistReady(userId: string, itemName: string, itemId: string) {
    return this.create(userId, {
      type: 'WISHLIST_READY',
      title: 'Time to decide! 🎯',
      body: `7 days passed. Do you still want "${itemName}"?`,
      data: { wishlistItemId: itemId },
    });
  }

  async sendBudgetAlert(userId: string, categoryName: string, percentUsed: number) {
    return this.create(userId, {
      type: 'BUDGET_ALERT',
      title: 'Budget alert ⚠️',
      body: `You've used ${percentUsed}% of your "${categoryName}" budget`,
      data: { categoryName },
    });
  }

  async sendBudgetOver(userId: string, categoryName: string) {
    return this.create(userId, {
      type: 'BUDGET_ALERT',
      title: 'Budget exceeded 🚨',
      body: `You've exceeded your "${categoryName}" budget this month`,
      data: { categoryName },
    });
  }

  async sendGoalCompleted(userId: string, goalName: string, goalId: string) {
    return this.create(userId, {
      type: 'GOAL_COMPLETED',
      title: 'Goal achieved! 🎉',
      body: `Congratulations! You've reached your "${goalName}" goal`,
      data: { goalId },
    });
  }

  async sendMonthlySummary(userId: string, income: number, expenses: number, saved: number) {
    const savedPercent = income > 0 ? Math.round((saved / income) * 100) : 0;
    return this.create(userId, {
      type: 'MONTHLY_SUMMARY',
      title: 'Monthly summary 📊',
      body: `Income: ${(income / 100).toFixed(0)}, Expenses: ${(expenses / 100).toFixed(0)}, Saved: ${savedPercent}%`,
      data: { income, expenses, saved, savedPercent },
    });
  }
}
