import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatRole, PresetType } from '@prisma/client';

interface CreateMessageParams {
  userId: string;
  role: ChatRole;
  content: string;
  presetType?: PresetType | null;
}

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async getMessages(userId: string) {
    return this.prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createMessage(params: CreateMessageParams) {
    return this.prisma.chatMessage.create({
      data: params,
    });
  }

  async clearMessages(userId: string) {
    return this.prisma.chatMessage.deleteMany({
      where: { userId },
    });
  }

  async getMockResponse(presetType: string | undefined, userId: string): Promise<string> {
    // Get user data for contextual response
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        transactions: {
          where: { date: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) } },
          select: { amount: true, type: true },
        },
      },
    });

    switch (presetType) {
      case 'SPENDING_REPORT':
        return this.generateSpendingReport(user);
      case 'BUDGET_ANALYSIS':
        return this.generateBudgetAnalysis(user);
      case 'SAVINGS_TIPS':
        return this.generateSavingsTips(user);
      case 'DYNAMICS':
        return this.generateDynamics(user);
      default:
        return 'Чем я могу вам помочь с финансами?';
    }
  }

  private generateSpendingReport(user: any): string {
    if (!user?.transactions?.length) {
      return 'За последний месяц у вас нет транзакций. Начните записывать расходы, чтобы получить подробный анализ.';
    }

    const expenses = user.transactions.filter((t: any) => t.type === 'EXPENSE');
    const income = user.transactions.filter((t: any) => t.type === 'INCOME');
    const totalExpenses = expenses.reduce((sum: number, t: any) => sum + Number(t.amount), 0) / 100;
    const totalIncome = income.reduce((sum: number, t: any) => sum + Number(t.amount), 0) / 100;

    return `📊 **Отчёт по тратам за 30 дней**

💰 Доходы: ${totalIncome.toLocaleString('ru-RU')} ₽
💸 Расходы: ${totalExpenses.toLocaleString('ru-RU')} ₽
${totalIncome > totalExpenses ? '✅ Вы сохранили' : '⚠️ Вы потратили больше'} ${Math.abs(totalIncome - totalExpenses).toLocaleString('ru-RU')} ₽

Средние траты: ${(totalExpenses / 30).toLocaleString('ru-RU')} ₽/день`;
  }

  private generateBudgetAnalysis(user: any): string {
    // Budgets have been merged into categories (monthlyLimit field)
    return 'Бюджеты теперь встроены в категории. Установите месячный лимит в настройках категории.';
  }

  private generateSavingsTips(user: any): string {
    return `💡 **Как сохранить больше**

1. **Правило 24 часов** — перед покупкой подождите сутки. Часто желание проходит.

2. **Автоматические накопления** — переводите часть зарплаты на сберегательный счёт сразу.

3. **Нужно vs хочу** — спросите себя: «Мне это НУЖНО или я это ХОЧУ?» Честный ответ часто останавливает импульсивную покупку.

4. **Заморозь желания** — добавьте дорогие покупки в Инкубатор. Через 7 дней решение будет осознанным.

5. **Отслеживайте мелочи** — кофе, обеды навынос незаметно съедают бюджет.`;
  }

  private generateDynamics(user: any): string {
    return `📈 **Отслеживание динамики**

Для анализа динамики мне нужно больше данных. Попробуйте:

• Записывать расходы ежедневно
• Сравнивать месяцы между собой
• Отмечать, когда вы чаще всего делаете импульсивные покупки

Совет: Отмечайте свои эмоции при покупках — это поможет понять триггеры импульсивных трат.`;
  }
}
