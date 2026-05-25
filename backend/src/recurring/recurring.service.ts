import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/app-exception';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class RecurringService {
  private readonly logger = new Logger(RecurringService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(userId: string) {
    const rules = await this.prisma.recurringRule.findMany({
      where: { userId },
      include: {
        account: { select: { id: true, name: true, currency: true } },
        category: { select: { id: true, name: true, icon: true, color: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return rules.map((rule) => this.serializeRule(rule));
  }

  async findById(id: string, userId: string) {
    const rule = await this.prisma.recurringRule.findFirst({
      where: { id, userId },
      include: {
        account: { select: { id: true, name: true, currency: true } },
        category: { select: { id: true, name: true, icon: true, color: true, type: true } },
      },
    });

    if (!rule) {
      throw new AppException('recurring.notFound', 404);
    }

    return this.serializeRule(rule);
  }

  async create(
    userId: string,
    data: {
      accountId: string;
      categoryId: string;
      amount: number;
      type: string;
      period: string;
      dayOfWeek?: number;
      dayOfMonth?: number;
      description?: string;
    },
  ) {
    const account = await this.prisma.account.findFirst({
      where: { id: data.accountId, userId },
    });
    if (!account) {
      throw new AppException('errors.accountNotFound', 400);
    }

    const category = await this.prisma.category.findFirst({
      where: { id: data.categoryId, OR: [{ userId }, { userId: null }] },
    });
    if (!category) {
      throw new AppException('errors.categoryNotFound', 400);
    }

    this.validateDayFields(data.period, data.dayOfWeek, data.dayOfMonth);

    const nextRunDate = this.calculateNextRunDate(data.period, data.dayOfWeek, data.dayOfMonth);

    const rule = await this.prisma.recurringRule.create({
      data: {
        userId,
        accountId: data.accountId,
        categoryId: data.categoryId,
        amount: BigInt(Math.round(data.amount)),
        type: data.type as 'INCOME' | 'EXPENSE',
        period: data.period as 'WEEKLY' | 'MONTHLY',
        dayOfWeek: data.dayOfWeek ?? null,
        dayOfMonth: data.dayOfMonth ?? null,
        description: data.description,
        nextRunDate,
        isActive: true,
      },
      include: {
        account: { select: { id: true, name: true, currency: true } },
        category: { select: { id: true, name: true, icon: true, color: true, type: true } },
      },
    });

    return this.serializeRule(rule);
  }

  async update(
    id: string,
    userId: string,
    data: {
      amount?: number;
      description?: string;
      dayOfWeek?: number;
      dayOfMonth?: number;
    },
  ) {
    const rule = await this.prisma.recurringRule.findFirst({
      where: { id, userId },
    });

    if (!rule) {
      throw new AppException('recurring.notFound', 404);
    }

    const updateData: Record<string, unknown> = {};

    if (data.amount !== undefined) {
      updateData.amount = BigInt(Math.round(data.amount));
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    const period = rule.period as string;
    const dayOfWeek = data.dayOfWeek !== undefined ? data.dayOfWeek : rule.dayOfWeek;
    const dayOfMonth = data.dayOfMonth !== undefined ? data.dayOfMonth : rule.dayOfMonth;

    if (data.dayOfWeek !== undefined || data.dayOfMonth !== undefined) {
      this.validateDayFields(period, dayOfWeek as number | undefined, dayOfMonth as number | undefined);
      updateData.dayOfWeek = dayOfWeek;
      updateData.dayOfMonth = dayOfMonth;
      updateData.nextRunDate = this.calculateNextRunDate(period, dayOfWeek as number | undefined, dayOfMonth as number | undefined);
    }

    if (data.amount !== undefined || data.description !== undefined) {
      updateData.nextRunDate = updateData.nextRunDate ?? rule.nextRunDate;
    }

    const updated = await this.prisma.recurringRule.update({
      where: { id },
      data: updateData,
      include: {
        account: { select: { id: true, name: true, currency: true } },
        category: { select: { id: true, name: true, icon: true, color: true, type: true } },
      },
    });

    return this.serializeRule(updated);
  }

  async delete(id: string, userId: string, keepTransactions = true) {
    const rule = await this.prisma.recurringRule.findFirst({
      where: { id, userId },
    });

    if (!rule) {
      throw new AppException('recurring.notFound', 404);
    }

    if (!keepTransactions) {
      await this.prisma.transaction.updateMany({
        where: { recurringRuleId: id },
        data: { recurringRuleId: null },
      });
    }

    await this.prisma.recurringRule.delete({ where: { id } });
    return { success: true };
  }

  async pause(id: string, userId: string) {
    const rule = await this.prisma.recurringRule.findFirst({
      where: { id, userId },
    });

    if (!rule) {
      throw new AppException('recurring.notFound', 404);
    }

    if (!rule.isActive) {
      throw new AppException('recurring.alreadyPaused', 400);
    }

    const updated = await this.prisma.recurringRule.update({
      where: { id },
      data: { isActive: false },
      include: {
        account: { select: { id: true, name: true, currency: true } },
        category: { select: { id: true, name: true, icon: true, color: true, type: true } },
      },
    });

    return this.serializeRule(updated);
  }

  async activate(id: string, userId: string) {
    const rule = await this.prisma.recurringRule.findFirst({
      where: { id, userId },
    });

    if (!rule) {
      throw new AppException('recurring.notFound', 404);
    }

    if (rule.isActive) {
      throw new AppException('recurring.alreadyActive', 400);
    }

    const nextRunDate = this.calculateNextRunDate(
      rule.period,
      rule.dayOfWeek as number | undefined,
      rule.dayOfMonth as number | undefined,
    );

    const updated = await this.prisma.recurringRule.update({
      where: { id },
      data: { isActive: true, nextRunDate },
      include: {
        account: { select: { id: true, name: true, currency: true } },
        category: { select: { id: true, name: true, icon: true, color: true, type: true } },
      },
    });

    return this.serializeRule(updated);
  }

  async preview(id: string, userId: string, count = 3) {
    const rule = await this.prisma.recurringRule.findFirst({
      where: { id, userId },
    });

    if (!rule) {
      throw new AppException('recurring.notFound', 404);
    }

    const dates: Date[] = [];
    let current = new Date();

    for (let i = 0; i < count; i++) {
      current = this.calculateNextRunDateFrom(
        rule.period,
        rule.dayOfWeek as number | undefined,
        rule.dayOfMonth as number | undefined,
        current,
      );
      dates.push(current);
      current = new Date(current.getTime() + 24 * 60 * 60 * 1000);
    }

    return {
      ruleId: rule.id,
      amount: Number(rule.amount),
      upcomingDates: dates.map((d) => d.toISOString().split('T')[0]),
    };
  }

  @Cron('0 6 * * *')
  async processRecurringRules() {
    this.logger.log('Processing recurring rules...');

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const rules = await this.prisma.recurringRule.findMany({
      where: {
        isActive: true,
        nextRunDate: { lt: tomorrow },
      },
    });

    this.logger.log(`Found ${rules.length} rules to process`);

    let processed = 0;
    for (const rule of rules) {
      try {
        await this.processRule(rule);
        processed++;
      } catch (error: unknown) {
        this.logger.error(`Failed to process rule ${rule.id}: ${error}`);
      }
    }

    this.logger.log(`Processed ${processed}/${rules.length} recurring rules`);
  }

  private async processRule(rule: { id: string; userId: string; accountId: string; categoryId: string; amount: bigint; type: string; period: string; dayOfWeek: number | null; dayOfMonth: number | null; description: string | null }) {
    await this.prisma.$transaction(async (tx) => {
      const account = await tx.account.findFirst({
        where: { id: rule.accountId, userId: rule.userId },
      });
      if (!account) {
        this.logger.warn(`Account ${rule.accountId} not found for rule ${rule.id}, deactivating`);
        await tx.recurringRule.update({
          where: { id: rule.id },
          data: { isActive: false },
        });
        return;
      }

      await tx.transaction.create({
        data: {
          userId: rule.userId,
          accountId: rule.accountId,
          categoryId: rule.categoryId,
          amount: rule.amount,
          type: rule.type as 'INCOME' | 'EXPENSE' | 'TRANSFER',
          description: rule.description,
          date: new Date(),
          recurringRuleId: rule.id,
        },
      });

      const balanceChange = rule.type === 'INCOME' ? rule.amount : -rule.amount;
      await tx.account.update({
        where: { id: rule.accountId },
        data: { balance: { increment: balanceChange } },
      });

      const nextRunDate = this.calculateNextRunDate(
        rule.period,
        rule.dayOfWeek as number | undefined,
        rule.dayOfMonth as number | undefined,
      );

      await tx.recurringRule.update({
        where: { id: rule.id },
        data: { nextRunDate, lastRunDate: new Date() },
      });
    });
  }

  private validateDayFields(period: string, dayOfWeek?: number, dayOfMonth?: number) {
    if (period === 'WEEKLY' && dayOfWeek === undefined) {
      throw new AppException('recurring.dayOfWeekRequired', 400);
    }
    if (period === 'MONTHLY' && dayOfMonth === undefined) {
      throw new AppException('recurring.dayOfMonthRequired', 400);
    }
  }

  private calculateNextRunDate(period: string, dayOfWeek?: number, dayOfMonth?: number): Date {
    return this.calculateNextRunDateFrom(period, dayOfWeek, dayOfMonth, new Date());
  }

  private calculateNextRunDateFrom(period: string, dayOfWeek?: number, dayOfMonth?: number, fromDate?: Date): Date {
    const from = fromDate ?? new Date();
    const tomorrow = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 1);

    if (period === 'WEEKLY' && dayOfWeek !== undefined) {
      const jsDay = dayOfWeek === 7 ? 0 : dayOfWeek;
      const result = new Date(tomorrow);
      const diff = (jsDay - result.getDay() + 7) % 7;
      result.setDate(result.getDate() + diff);
      return result;
    }

    if (period === 'MONTHLY' && dayOfMonth !== undefined) {
      const maxDay = new Date(tomorrow.getFullYear(), tomorrow.getMonth() + 1, 0).getDate();
      const targetDay = Math.min(dayOfMonth, maxDay);

      let result = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), targetDay);

      if (result <= from) {
        const nextMonth = tomorrow.getMonth() + 1;
        const nextYear = tomorrow.getFullYear() + (nextMonth > 11 ? 1 : 0);
        const nextMaxDay = new Date(nextYear, nextMonth > 11 ? nextMonth - 11 : nextMonth + 1, 0).getDate();
        result = new Date(nextYear, nextMonth > 11 ? 0 : nextMonth, Math.min(dayOfMonth, nextMaxDay));
      }

      return result;
    }

    return tomorrow;
  }

  private serializeRule(rule: Record<string, unknown>) {
    const { account, category, amount, ...rest } = rule;
    return {
      ...rest,
      amount: typeof amount === 'bigint' ? Number(amount) : amount,
      account,
      category,
    };
  }
}
