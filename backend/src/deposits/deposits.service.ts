import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/app-exception';

@Injectable()
export class DepositsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const deposits = await this.prisma.deposit.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return deposits.map(this.serialize);
  }

  async findById(id: string, userId: string) {
    const deposit = await this.prisma.deposit.findFirst({ where: { id, userId } });
    if (!deposit) throw new AppException('errors.depositNotFound', 404);
    return this.serialize(deposit);
  }

  async create(userId: string, data: {
    name: string;
    type: string;
    principal: number;
    annualRate: number;
    compounding: string;
    termMonths: number;
    startDate: string;
  }) {
    const principal = BigInt(Math.round(data.principal));
    const maturityAmount = this.calculateMaturity(
      Number(principal),
      data.annualRate,
      data.compounding,
      data.termMonths,
    );

    const startDate = new Date(data.startDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + data.termMonths);

    const deposit = await this.prisma.deposit.create({
      data: {
        userId,
        name: data.name,
        type: data.type as any,
        principal,
        currentAmount: BigInt(Math.round(maturityAmount)),
        annualRate: data.annualRate,
        compounding: data.compounding as any,
        termMonths: data.termMonths,
        startDate,
        endDate,
      },
    });

    return this.serialize(deposit);
  }

  async update(id: string, userId: string, data: { name?: string; currentAmount?: number; annualRate?: number }) {
    const deposit = await this.prisma.deposit.findFirst({ where: { id, userId } });
    if (!deposit) throw new AppException('errors.depositNotFound', 404);

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.annualRate !== undefined) updateData.annualRate = data.annualRate;
    if (data.currentAmount !== undefined) updateData.currentAmount = BigInt(Math.round(data.currentAmount));

    if (data.annualRate !== undefined) {
      updateData.currentAmount = BigInt(Math.round(
        this.calculateMaturity(
          Number(deposit.principal),
          data.annualRate,
          deposit.compounding,
          deposit.termMonths,
        ),
      ));
    }

    const updated = await this.prisma.deposit.update({
      where: { id },
      data: updateData,
    });

    return this.serialize(updated);
  }

  async delete(id: string, userId: string) {
    const deposit = await this.prisma.deposit.findFirst({ where: { id, userId } });
    if (!deposit) throw new AppException('errors.depositNotFound', 404);
    await this.prisma.deposit.delete({ where: { id } });
    return { success: true };
  }

  async getProjection(id: string, userId: string) {
    const deposit = await this.prisma.deposit.findFirst({ where: { id, userId } });
    if (!deposit) throw new AppException('errors.depositNotFound', 404);

    const principal = Number(deposit.principal);
    const rate = deposit.annualRate;
    const months = deposit.termMonths;
    const monthlyRate = rate / 100 / 12;

    const projection: { month: number; amount: number; interest: number }[] = [];
    let current = principal;

    for (let m = 1; m <= months; m++) {
      const interest = this.calculateMonthlyInterest(current, rate, deposit.compounding);
      current += interest;
      projection.push({ month: m, amount: Math.round(current), interest: Math.round(interest) });
    }

    return {
      principal,
      maturityAmount: Math.round(current),
      totalInterest: Math.round(current - principal),
      projection,
    };
  }

  private calculateMaturity(principal: number, annualRate: number, compounding: string, months: number): number {
    if (annualRate === 0 || compounding === 'NONE') {
      return principal + (principal * (annualRate / 100) * (months / 12));
    }

    const periodsPerYear = this.getPeriodsPerYear(compounding);
    const rate = annualRate / 100;
    const n = periodsPerYear;
    const t = months / 12;

    return principal * Math.pow(1 + rate / n, n * t);
  }

  private calculateMonthlyInterest(currentBalance: number, annualRate: number, compounding: string): number {
    if (annualRate === 0) return 0;
    const monthlyRate = annualRate / 100 / 12;
    switch (compounding) {
      case 'DAILY': return currentBalance * (annualRate / 100 / 365) * 30;
      case 'MONTHLY': return currentBalance * monthlyRate;
      case 'QUARTERLY': return currentBalance * monthlyRate;
      case 'ANNUALLY': return currentBalance * monthlyRate;
      default: return currentBalance * monthlyRate;
    }
  }

  private getPeriodsPerYear(compounding: string): number {
    switch (compounding) {
      case 'DAILY': return 365;
      case 'MONTHLY': return 12;
      case 'QUARTERLY': return 4;
      case 'ANNUALLY': return 1;
      default: return 12;
    }
  }

  private serialize(deposit: Record<string, unknown>) {
    const { principal, currentAmount, ...rest } = deposit;
    return {
      ...rest,
      principal: typeof principal === 'bigint' ? Number(principal) : principal,
      currentAmount: typeof currentAmount === 'bigint' ? Number(currentAmount) : currentAmount,
    };
  }
}
