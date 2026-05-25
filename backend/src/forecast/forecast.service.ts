import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/app-exception';

@Injectable()
export class ForecastService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const scenarios = await this.prisma.forecastScenario.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return scenarios.map(this.serialize);
  }

  async findById(id: string, userId: string) {
    const scenario = await this.prisma.forecastScenario.findFirst({ where: { id, userId } });
    if (!scenario) throw new AppException('errors.forecastNotFound', 404);
    return this.serialize(scenario);
  }

  async create(userId: string, data: {
    name: string;
    description?: string;
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlySave?: number;
    inflationRate?: number;
    investmentReturnRate?: number;
    forecastYears?: number;
  }) {
    const monthlySave = data.monthlySave ?? (data.monthlyIncome - data.monthlyExpenses);

    const scenario = await this.prisma.forecastScenario.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        monthlyIncome: BigInt(Math.round(data.monthlyIncome)),
        monthlyExpenses: BigInt(Math.round(data.monthlyExpenses)),
        monthlySave: BigInt(Math.round(monthlySave)),
        inflationRate: data.inflationRate ?? 7.0,
        investmentReturnRate: data.investmentReturnRate ?? 10.0,
        forecastYears: data.forecastYears ?? 10,
      },
    });

    return this.serialize(scenario);
  }

  async update(id: string, userId: string, data: { name?: string; description?: string }) {
    const scenario = await this.prisma.forecastScenario.findFirst({ where: { id, userId } });
    if (!scenario) throw new AppException('errors.forecastNotFound', 404);

    const updated = await this.prisma.forecastScenario.update({
      where: { id },
      data: { name: data.name, description: data.description },
    });

    return this.serialize(updated);
  }

  async delete(id: string, userId: string) {
    const scenario = await this.prisma.forecastScenario.findFirst({ where: { id, userId } });
    if (!scenario) throw new AppException('errors.forecastNotFound', 404);
    await this.prisma.forecastScenario.delete({ where: { id } });
    return { success: true };
  }

  async calculate(id: string, userId: string) {
    const scenario = await this.prisma.forecastScenario.findFirst({ where: { id, userId } });
    if (!scenario) throw new AppException('errors.forecastNotFound', 404);

    const monthlySave = Number(scenario.monthlySave);
    const investmentRate = scenario.investmentReturnRate / 100;
    const inflationRate = scenario.inflationRate / 100;
    const years = scenario.forecastYears;

    const yearlyData: { year: number; savings: number; invested: number; netWorth: number }[] = [];
    let totalSavings = 0;
    let totalInvested = 0;

    for (let y = 1; y <= years; y++) {
      const yearlySave = monthlySave * 12;
      totalSavings += yearlySave;
      totalInvested = (totalInvested + yearlySave) * (1 + investmentRate);

      const inflationFactor = Math.pow(1 + inflationRate, y);

      yearlyData.push({
        year: y,
        savings: Math.round(totalSavings),
        invested: Math.round(totalInvested),
        netWorth: Math.round(totalInvested / inflationFactor),
      });
    }

    const totalDeposits = await this.getTotalDeposits(userId);
    const totalLoans = await this.getTotalLoans(userId);

    return {
      scenarioId: scenario.id,
      monthlySave,
      investmentReturnRate: scenario.investmentReturnRate,
      inflationRate: scenario.inflationRate,
      currentNetWorth: totalDeposits - totalLoans,
      totalDeposits,
      totalLoans,
      projection: yearlyData,
      summary: {
        totalSaved: Math.round(totalSavings),
        totalInvested: Math.round(totalInvested),
        realValue: Math.round(yearlyData[yearlyData.length - 1]?.netWorth ?? 0),
      },
    };
  }

  private async getTotalDeposits(userId: string): Promise<number> {
    const result = await this.prisma.deposit.aggregate({
      _sum: { currentAmount: true },
      where: { userId, isActive: true },
    });
    return Number(result._sum.currentAmount ?? 0);
  }

  private async getTotalLoans(userId: string): Promise<number> {
    const result = await this.prisma.loan.aggregate({
      _sum: { currentBalance: true },
      where: { userId, isPaidOff: false },
    });
    return Number(result._sum.currentBalance ?? 0);
  }

  private serialize(s: Record<string, unknown>) {
    const { monthlyIncome, monthlyExpenses, monthlySave, ...rest } = s;
    return {
      ...rest,
      monthlyIncome: typeof monthlyIncome === 'bigint' ? Number(monthlyIncome) : monthlyIncome,
      monthlyExpenses: typeof monthlyExpenses === 'bigint' ? Number(monthlyExpenses) : monthlyExpenses,
      monthlySave: typeof monthlySave === 'bigint' ? Number(monthlySave) : monthlySave,
    };
  }
}
