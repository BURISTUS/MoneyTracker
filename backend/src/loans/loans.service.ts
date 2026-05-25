import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/app-exception';

@Injectable()
export class LoansService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const loans = await this.prisma.loan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return loans.map(this.serialize);
  }

  async findById(id: string, userId: string) {
    const loan = await this.prisma.loan.findFirst({
      where: { id, userId },
      include: { payments: { orderBy: { dueDate: 'asc' } } },
    });
    if (!loan) throw new AppException('errors.loanNotFound', 404);
    return {
      ...this.serialize(loan),
      payments: loan.payments.map(this.serializePayment),
    };
  }

  async create(userId: string, data: {
    name: string;
    type: string;
    principal: number;
    annualRate: number;
    termMonths: number;
    startDate: string;
  }) {
    const principal = BigInt(Math.round(data.principal));
    const monthlyPayment = this.calculateMonthlyPayment(
      Number(principal),
      data.annualRate,
      data.termMonths,
    );

    const startDate = new Date(data.startDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + data.termMonths);

    const loan = await this.prisma.$transaction(async (tx) => {
      const loan = await tx.loan.create({
        data: {
          userId,
          name: data.name,
          type: data.type as any,
          principal,
          currentBalance: principal,
          annualRate: data.annualRate,
          termMonths: data.termMonths,
          monthlyPayment: BigInt(Math.round(monthlyPayment)),
          startDate,
          endDate,
        },
      });

      const schedule = this.generateAmortizationSchedule(
        Number(principal),
        data.annualRate,
        data.termMonths,
        startDate,
      );

      for (const payment of schedule) {
        await tx.loanPayment.create({
          data: {
            loanId: loan.id,
            amount: BigInt(Math.round(payment.amount)),
            principal: BigInt(Math.round(payment.principalPart)),
            interest: BigInt(Math.round(payment.interestPart)),
            dueDate: payment.dueDate,
          },
        });
      }

      return loan;
    });

    return this.serialize(loan);
  }

  async update(id: string, userId: string, data: { name?: string }) {
    const loan = await this.prisma.loan.findFirst({ where: { id, userId } });
    if (!loan) throw new AppException('errors.loanNotFound', 404);

    const updated = await this.prisma.loan.update({
      where: { id },
      data: { name: data.name },
    });

    return this.serialize(updated);
  }

  async delete(id: string, userId: string) {
    const loan = await this.prisma.loan.findFirst({ where: { id, userId } });
    if (!loan) throw new AppException('errors.loanNotFound', 404);
    await this.prisma.loan.delete({ where: { id } });
    return { success: true };
  }

  async recordPayment(id: string, userId: string) {
    const loan = await this.prisma.loan.findFirst({
      where: { id, userId },
      include: { payments: { where: { isPaid: false }, orderBy: { dueDate: 'asc' }, take: 1 } },
    });

    if (!loan) throw new AppException('errors.loanNotFound', 404);
    if (loan.payments.length === 0) throw new AppException('errors.noPendingPayments', 400);

    const nextPayment = loan.payments[0];

    await this.prisma.$transaction(async (tx) => {
      await tx.loanPayment.update({
        where: { id: nextPayment.id },
        data: { isPaid: true, paidDate: new Date() },
      });

      const newBalance = Number(loan.currentBalance) - Number(nextPayment.principal);
      await tx.loan.update({
        where: { id: loan.id },
        data: {
          currentBalance: BigInt(Math.max(0, Math.round(newBalance))),
          isPaidOff: newBalance <= 0,
        },
      });
    });

    return { success: true };
  }

  async getSchedule(id: string, userId: string) {
    const loan = await this.prisma.loan.findFirst({ where: { id, userId } });
    if (!loan) throw new AppException('errors.loanNotFound', 404);

    const payments = await this.prisma.loanPayment.findMany({
      where: { loanId: id },
      orderBy: { dueDate: 'asc' },
    });

    return {
      loanId: id,
      monthlyPayment: Number(loan.monthlyPayment),
      schedule: payments.map(this.serializePayment),
    };
  }

  private calculateMonthlyPayment(principal: number, annualRate: number, months: number): number {
    if (annualRate === 0) return principal / months;
    const monthlyRate = annualRate / 100 / 12;
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  }

  private generateAmortizationSchedule(
    principal: number,
    annualRate: number,
    months: number,
    startDate: Date,
  ): { dueDate: Date; amount: number; principalPart: number; interestPart: number }[] {
    const monthlyRate = annualRate / 100 / 12;
    const monthlyPayment = this.calculateMonthlyPayment(principal, annualRate, months);
    const schedule: { dueDate: Date; amount: number; principalPart: number; interestPart: number }[] = [];
    let balance = principal;

    for (let m = 1; m <= months; m++) {
      const interestPart = balance * monthlyRate;
      const principalPart = Math.min(monthlyPayment - interestPart, balance);
      balance -= principalPart;

      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + m);

      schedule.push({
        dueDate,
        amount: m === months ? principalPart + interestPart : monthlyPayment,
        principalPart,
        interestPart,
      });
    }

    return schedule;
  }

  private serialize(loan: Record<string, unknown>) {
    const { principal, currentBalance, monthlyPayment, ...rest } = loan;
    return {
      ...rest,
      principal: typeof principal === 'bigint' ? Number(principal) : principal,
      currentBalance: typeof currentBalance === 'bigint' ? Number(currentBalance) : currentBalance,
      monthlyPayment: typeof monthlyPayment === 'bigint' ? Number(monthlyPayment) : monthlyPayment,
    };
  }

  private serializePayment(p: Record<string, unknown>) {
    const { amount, principal, interest, ...rest } = p;
    return {
      ...rest,
      amount: typeof amount === 'bigint' ? Number(amount) : amount,
      principal: typeof principal === 'bigint' ? Number(principal) : principal,
      interest: typeof interest === 'bigint' ? Number(interest) : interest,
    };
  }
}
