import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LifeCostService {
  constructor(private prisma: PrismaService) {}

  async getHourlyRate(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
    if (!user?.hourlyRate) {
      throw new BadRequestException('Hourly rate not set. Please configure it in your profile.');
    }

    return user.hourlyRate / 100; // Конвертируем из копеек в рубли
  }

  async calculateHours(userId: string, amount: number) {
    const hourlyRate = await this.getHourlyRate(userId);
    const hours = amount / hourlyRate;
    const workingDays = hours / 8;

    return {
      rubles: amount,
      hours: Math.round(hours * 10) / 10,
      workingDays: Math.round(workingDays * 10) / 10,
      message: this.generateMessage(hours, workingDays),
    };
  }

  async simulateInvestment(userId: string, amount: number, years: number = 10) {
    const annualRate = 0.12; // 12% годовых
    const monthlyRate = annualRate / 12;
    const months = years * 12;
    
    const futureValue = amount * Math.pow(1 + monthlyRate, months);
    const profit = futureValue - amount;

    return {
      initialAmount: amount,
      futureValue: Math.round(futureValue),
      profit: Math.round(profit),
      years,
      annualRate: annualRate * 100,
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
