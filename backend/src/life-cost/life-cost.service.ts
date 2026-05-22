import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/app-exception';

const ANNUAL_RATE = 0.12;

@Injectable()
export class LifeCostService {
  constructor(private prisma: PrismaService) {}

  async getHourlyRate(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.hourlyRate) {
      throw new AppException('errors.hourlyRateNotSet', 400);
    }

    return user.hourlyRate / 100;
  }

  async calculateHours(userId: string, amount: number) {
    const hourlyRate = await this.getHourlyRate(userId);
    const rubles = amount / 100;
    const hours = rubles / hourlyRate;
    const workingDays = hours / 8;

    return {
      rubles,
      hours: Math.round(hours * 10) / 10,
      workingDays: Math.round(workingDays * 10) / 10,
      message: this.generateMessage(hours, workingDays),
    };
  }

  async simulateInvestment(
    userId: string,
    amount: number,
    years: number = 10,
  ) {
    const monthlyRate = ANNUAL_RATE / 12;
    const months = years * 12;

    const rubles = amount / 100;
    const futureValue = rubles * Math.pow(1 + monthlyRate, months);
    const profit = futureValue - rubles;

    return {
      initialAmount: rubles,
      futureValue: Math.round(futureValue),
      profit: Math.round(profit),
      years,
      annualRate: ANNUAL_RATE * 100,
    };
  }

  private generateMessage(hours: number, workingDays: number): string {
    if (workingDays >= 20) {
      return `Это ${Math.round(workingDays)} рабочих дней. Ты готов провести целый месяц в офисе ради этого?`;
    }
    if (workingDays >= 10) {
      return `Это ${Math.round(workingDays)} рабочих дней. Две недели твоей жизни.`;
    }
    if (workingDays >= 5) {
      return `Это ${Math.round(workingDays)} рабочих дней. Целая неделя.`;
    }
    if (workingDays >= 2) {
      return `Это ${Math.round(hours)} часов. Около ${Math.round(workingDays * 10) / 10} рабочих дней.`;
    }
    return `Это ${Math.round(hours)} часов твоей жизни.`;
  }
}
