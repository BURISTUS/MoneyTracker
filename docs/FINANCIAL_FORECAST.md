# Дополнение: Калькулятор вкладов, кредитов и финансовых прогнозов

## Новая функциональность

Добавляем модуль **FinancialForecast** для:
- Учета вкладов и депозитов с капитализацией
- Учета кредитов и расчета графика платежей
- Прогнозирования будущего капитала на основе текущих сбережений + ежемесячных отчислений

---

## 1. Новые модели Prisma

```prisma
// === DEPOSITS & INVESTMENTS ===

model Deposit {
  id              String   @id @default(uuid())
  userId          String
  name            String   // "Вклад Сбербанк"
  type            DepositType
  principal       BigInt   // Начальная сумма
  currentAmount   BigInt   @default(0) // Текущая сумма с процентами
  annualRate      Float    // Годовая ставка в % (например 12.5)
  compounding     CompoundingType // CAPITALIZATION_PERIOD
  termMonths      Int      // Срок вклада (0 = до востребования)
  startDate       DateTime
  endDate         DateTime?
  isActive        Boolean  @default(true)
  autoRenew       Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions    DepositTransaction[]

  @@map("deposits")
}

enum DepositType {
  SAVINGS_ACCOUNT    // Сберегательный счет
  TERM_DEPOSIT       // Срочный вклад
  INVESTMENT         // Инвестиции (ИИС, ОФЗ, etc.)
  CRYPTO             // Криптовалюта
  STOCKS             // Акции
  BONDS              // Облигации
}

enum CompoundingType {
  DAILY
  WEEKLY
  MONTHLY
  QUARTERLY
  ANNUALLY
  NONE // Простые проценты
}

model DepositTransaction {
  id          String   @id @default(uuid())
  depositId   String
  amount      BigInt   // Положительный = пополнение, отрицательный = снятие
  type        DepositTransactionType
  date        DateTime @default(now())
  description String?

  deposit     Deposit  @relation(fields: [depositId], references: [id], onDelete: Cascade)

  @@map("deposit_transactions")
}

enum DepositTransactionType {
  DEPOSIT         // Пополнение
  WITHDRAWAL      // Снятие
  INTEREST        // Начисление процентов
  TAX             // Налог
  FEE             // Комиссия
}

// === LOANS & CREDITS ===

model Loan {
  id              String   @id @default(uuid())
  userId          String
  name            String   // "Ипотека Сбербанк"
  type            LoanType
  principal       BigInt   // Сумма кредита
  currentBalance  BigInt   // Остаток долга
  annualRate      Float    // Годовая ставка в %
  termMonths      Int      // Срок кредита в месяцах
  monthlyPayment  BigInt   // Ежемесячный платеж
  startDate       DateTime
  endDate         DateTime
  isPaidOff       Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  payments        LoanPayment[]

  @@map("loans")
}

enum LoanType {
  MORTGAGE        // Ипотека
  CONSUMER        // Потребительский
  AUTO            // Автокредит
  STUDENT         // Студенческий
  CREDIT_CARD     // Кредитная карта
  MICROLOAN       // Микрозайм
}

model LoanPayment {
  id          String   @id @default(uuid())
  loanId      String
  amount      BigInt   // Сумма платежа
  principal   BigInt   // Часть в погашение основного долга
  interest    BigInt   // Часть в погашение процентов
  isPaid      Boolean  @default(false)
  dueDate     DateTime
  paidDate    DateTime?
  createdAt   DateTime @default(now())

  loan        Loan     @relation(fields: [loanId], references: [id], onDelete: Cascade)

  @@map("loan_payments")
}

// === FINANCIAL FORECAST ===

model SavingsGoal {
  id              String   @id @default(uuid())
  userId          String
  name            String   // "На новую машину"
  targetAmount    BigInt
  currentAmount   BigInt   @default(0)
  monthlySave     BigInt   // Сколько откладывать в месяц
  startDate       DateTime
  targetDate      DateTime
  priority        Int      @default(0) // 0 = высший приоритет
  isCompleted     Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("savings_goals")
}

model ForecastScenario {
  id              String   @id @default(uuid())
  userId          String
  name            String   // "Консервативный прогноз"
  description     String?
  
  // Параметры сценария
  monthlyIncome   BigInt   // Ежемесячный доход
  monthlyExpenses BigInt   // Ежемесячные расходы
  monthlySave     BigInt   // Сколько откладывать
  
  // Вклады для симуляции
  deposits        Json     // [{depositId, monthlyContribution}]
  
  // Кредиты для симуляции
  loans           Json     // [{loanId, extraPayment}]
  
  // Параметры инфляции и доходности
  inflationRate   Float    @default(7.0) // Инфляция %
  investmentReturnRate Float @default(10.0) // Доходность инвестиций %
  
  forecastYears   Int      @default(10)
  
  createdAt       DateTime @default(now())

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("forecast_scenarios")
}
```

---

## 2. FinancialForecastModule

### Структура модуля

```
backend/src/financial-forecast/
├── financial-forecast.module.ts
├── financial-forecast.service.ts
├── financial-forecast.controller.ts
├── dto/
│   ├── create-deposit.dto.ts
│   ├── create-loan.dto.ts
│   ├── create-forecast-scenario.dto.ts
│   └── calculate-payment.dto.ts
└── services/
    ├── deposit.service.ts
    ├── loan.service.ts
    └── forecast.service.ts
```

---

## 3. API Endpoints

### Deposits (Вклады)
```
GET    /api/deposits                      # Все вклады
POST   /api/deposits                      # Создать вклад
GET    /api/deposits/:id                  # Один вклад
PATCH  /api/deposits/:id                  # Обновить вклад
DELETE /api/deposits/:id                  # Удалить вклад

GET    /api/deposits/:id/transactions     # Транзакции по вкладу
POST   /api/deposits/:id/deposit          # Пополнить
POST   /api/deposits/:id/withdraw         # Снять

GET    /api/deposits/:id/projection       # Проекция роста
GET    /api/deposits/compare              # Сравнение ставок
```

### Loans (Кредиты)
```
GET    /api/loans                         # Все кредиты
POST   /api/loans                         # Создать кредит
GET    /api/loans/:id                     # Один кредит
PATCH  /api/loans/:id                     # Обновить кредит
DELETE /api/loans/:id                     # Удалить кредит

GET    /api/loans/:id/schedule            # График платежей
GET    /api/loans/:id/payments            # Все платежи
POST   /api/loans/:id/pay                 # Внести платеж

GET    /api/loans/compare                 # Сравнение условий
POST   /api/loans/calculate               # Калькулятор платежа
POST   /api/loans/early-payoff            # Расчет досрочного погашения
```

### Savings Goals (Цели накоплений)
```
GET    /api/savings-goals                 # Все цели
POST   /api/savings-goals                 # Создать цель
PATCH  /api/savings-goals/:id             # Обновить цель
DELETE /api/savings-goals/:id             # Удалить цель

GET    /api/savings-goals/:id/projection  # Прогноз достижения
```

### Forecast Scenarios (Прогнозы)
```
GET    /api/forecasts                     # Все сценарии
POST   /api/forecasts                     # Создать сценарий
GET    /api/forecasts/:id                 # Один сценарий
PATCH  /api/forecasts/:id                 # Обновить сценарий
DELETE /api/forecasts/:id                 # Удалить сценарий

POST   /api/forecasts/:id/calculate       # Рассчитать прогноз
GET    /api/forecasts/:id/results         # Результаты прогноза
GET    /api/forecasts/:id/chart           # Данные для графика

GET    /api/forecasts/quick-summary       # Быстрый прогноз на основе текущих данных
```

---

## 4. FinancialForecastService

```typescript
@Injectable()
export class FinancialForecastService {
  constructor(private prisma: PrismaService) {}

  // === DEPOSIT METHODS ===

  async createDeposit(userId: string, data: CreateDepositDto) {
    const deposit = await this.prisma.deposit.create({
      data: {
        userId,
        name: data.name,
        type: data.type,
        principal: data.principal,
        currentAmount: data.principal,
        annualRate: data.annualRate,
        compounding: data.compounding,
        termMonths: data.termMonths,
        startDate: data.startDate,
        endDate: data.termMonths 
          ? new Date(data.startDate.getTime() + data.termMonths * 30 * 24 * 60 * 60 * 1000)
          : null,
        autoRenew: data.autoRenew || false,
      },
    });

    // Записать начальную транзакцию
    await this.prisma.depositTransaction.create({
      data: {
        depositId: deposit.id,
        amount: data.principal,
        type: 'DEPOSIT',
        date: data.startDate,
      },
    });

    return deposit;
  }

  async getDepositProjection(depositId: string, months: number = 12) {
    const deposit = await this.prisma.deposit.findUnique({ 
      where: { id: depositId } 
    });

    const projection = [];
    let currentAmount = Number(deposit.currentAmount);
    const monthlyRate = deposit.annualRate / 100 / 12;

    for (let i = 1; i <= months; i++) {
      // Сложные проценты
      const interest = currentAmount * monthlyRate;
      currentAmount += interest;

      projection.push({
        month: i,
        date: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000),
        principal: Number(deposit.principal),
        interest,
        total: Math.round(currentAmount * 100) / 100,
      });
    }

    return {
      deposit,
      projection,
      totalInterest: Math.round((currentAmount - Number(deposit.principal)) * 100) / 100,
    };
  }

  // === LOAN METHODS ===

  async createLoan(userId: string, data: CreateLoanDto) {
    // Рассчитать ежемесячный платеж (аннуитет)
    const monthlyPayment = this.calculateAnnuityPayment(
      Number(data.principal),
      data.annualRate,
      data.termMonths
    );

    // Создать график платежей
    const payments = [];
    let balance = data.principal;
    const monthlyRate = data.annualRate / 100 / 12;

    for (let i = 1; i <= data.termMonths; i++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = BigInt(monthlyPayment) - BigInt(Math.round(interestPayment * 100));
      balance -= Number(principalPayment);

      payments.push({
        loanId: '', // будет заполнено после создания
        amount: BigInt(monthlyPayment),
        principal: principalPayment,
        interest: BigInt(Math.round(interestPayment * 100)),
        dueDate: new Date(data.startDate.getTime() + i * 30 * 24 * 60 * 60 * 1000),
        isPaid: false,
      });
    }

    const loan = await this.prisma.loan.create({
      data: {
        userId,
        name: data.name,
        type: data.type,
        principal: data.principal,
        currentBalance: data.principal,
        annualRate: data.annualRate,
        termMonths: data.termMonths,
        monthlyPayment: BigInt(monthlyPayment),
        startDate: data.startDate,
        endDate: new Date(data.startDate.getTime() + data.termMonths * 30 * 24 * 60 * 60 * 1000),
        payments: {
          create: payments.map(p => ({
            loanId: '', // будет обновлено
            amount: p.amount,
            principal: p.principal,
            interest: p.interest,
            dueDate: p.dueDate,
            isPaid: false,
          })),
        },
      },
    });

    return loan;
  }

  private calculateAnnuityPayment(principal: number, annualRate: number, months: number): number {
    const monthlyRate = annualRate / 100 / 12;
    if (monthlyRate === 0) return principal / months;
    
    return Math.round(
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1)
    );
  }

  async calculateEarlyPayoff(loanId: string, extraPayment: bigint) {
    const loan = await this.prisma.loan.findUnique({ 
      where: { id: loanId },
      include: { payments: true },
    });

    const remainingMonths = loan.payments.filter(p => !p.isPaid).length;
    const monthlyRate = loan.annualRate / 100 / 12;
    const currentBalance = Number(loan.currentBalance);
    
    // Новый платеж с досрочным погашением
    const basePayment = Number(loan.monthlyPayment);
    const newPayment = basePayment + Number(extraPayment);
    
    // Рассчитать новый срок
    let newBalance = currentBalance;
    let newMonthCount = 0;
    
    while (newBalance > 0 && newMonthCount < remainingMonths * 2) {
      const interestPayment = newBalance * monthlyRate;
      const principalPayment = newPayment - interestPayment;
      newBalance -= principalPayment;
      newMonthCount++;
    }

    const savedMonths = remainingMonths - newMonthCount;
    const totalInterestOld = loan.payments
      .filter(p => !p.isPaid)
      .reduce((sum, p) => sum + Number(p.interest), 0);
    
    // Приблизительный расчет экономии
    const savedInterest = (totalInterestOld / remainingMonths) * savedMonths;

    return {
      currentRemainingMonths: remainingMonths,
      newRemainingMonths: newMonthCount,
      monthsSaved: savedMonths,
      currentRemainingInterest: totalInterestOld,
      estimatedInterestSaved: Math.round(savedInterest),
      payoffDate: new Date(Date.now() + newMonthCount * 30 * 24 * 60 * 60 * 1000),
    };
  }

  // === FORECAST METHODS ===

  async calculateFinancialForecast(userId: string, scenarioId?: string) {
    // Получить все активные вклады
    const deposits = await this.prisma.deposit.findMany({
      where: { userId, isActive: true },
    });

    // Получить все активные кредиты
    const loans = await this.prisma.loan.findMany({
      where: { userId, isPaidOff: false },
    });

    // Получить цели накоплений
    const savingsGoals = await this.prisma.savingsGoal.findMany({
      where: { userId, isCompleted: false },
      orderBy: { priority: 'asc' },
    });

    // Пользовательские параметры
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const monthlyIncome = user.hourlyRate 
      ? user.hourlyRate * (user.monthlyHours || 176) / 100 
      : 0;

    const forecastYears = scenarioId ? 10 : 5;
    const yearlyData = [];
    const monthlyData = [];

    let totalSavings = deposits.reduce((sum, d) => sum + Number(d.currentAmount), 0);
    let totalDebt = loans.reduce((sum, l) => sum + Number(l.currentBalance), 0);

    for (let year = 1; year <= forecastYears; year++) {
      const yearStartSavings = totalSavings;
      const yearStartDebt = totalDebt;

      // Доходность инвестиций (10% годовых)
      const investmentGrowth = totalSavings * 0.10;
      totalSavings += investmentGrowth;

      // Начисление процентов по кредитам
      const debtInterest = totalDebt * 0.15; // Средняя ставка 15%
      totalDebt += debtInterest;

      // Погашение кредитов (базовый платеж + досрочное)
      const loanPayments = loans.reduce((sum, l) => sum + Number(l.monthlyPayment), 0) * 12;
      const extraPayments = totalSavings * 0.3; // 30% сбережений на досрочное погашение
      totalDebt = Math.max(0, totalDebt - loanPayments - extraPayments);

      // Прогресс по целям
      const goalsProgress = savingsGoals.map(goal => ({
        name: goal.name,
        target: Number(goal.targetAmount),
        current: Number(goal.currentAmount),
        projected: Math.min(
          Number(goal.targetAmount),
          Number(goal.currentAmount) + (totalSavings * 0.5)
        ),
        monthsToGoal: Math.ceil(
          (Number(goal.targetAmount) - Number(goal.currentAmount)) / 
          (totalSavings * 0.1) // 10% на эту цель
        ),
      }));

      yearlyData.push({
        year,
        savingsStart: yearStartSavings,
        savingsEnd: totalSavings,
        investmentGrowth,
        debtStart: yearStartDebt,
        debtEnd: totalDebt,
        debtInterest,
        netWorth: totalSavings - totalDebt,
        goalsProgress,
      });
    }

    return {
      summary: {
        currentNetWorth: totalSavings - totalDebt,
        projectedNetWorth: totalSavings - totalDebt,
        yearsProjected: forecastYears,
        savingsGrowthRate: '10%',
        debtReduction: '15-20%',
      },
      yearlyData,
      deposits: deposits.map(d => ({
        name: d.name,
        currentAmount: Number(d.currentAmount),
        annualRate: d.annualRate,
      })),
      loans: loans.map(l => ({
        name: l.name,
        currentBalance: Number(l.currentBalance),
        annualRate: l.annualRate,
        monthlyPayment: Number(l.monthlyPayment),
      })),
      savingsGoals,
    };
  }

  async getQuickSummary(userId: string) {
    const deposits = await this.prisma.deposit.findMany({
      where: { userId, isActive: true },
    });

    const loans = await this.prisma.loan.findMany({
      where: { userId, isPaidOff: false },
    });

    const totalSavings = deposits.reduce((sum, d) => sum + Number(d.currentAmount), 0);
    const totalDebt = loans.reduce((sum, l) => sum + Number(l.currentBalance), 0);
    const monthlyDebtPayments = loans.reduce((sum, l) => sum + Number(l.monthlyPayment), 0);

    // Прогноз на 1 год
    const oneYearSavings = totalSavings * 1.10; // 10% рост
    const oneYearDebt = totalDebt - (monthlyDebtPayments * 12);

    return {
      current: {
        totalSavings,
        totalDebt,
        netWorth: totalSavings - totalDebt,
        monthlyDebtPayments,
      },
      oneYearProjection: {
        totalSavings: Math.round(oneYearSavings),
        totalDebt: Math.max(0, Math.round(oneYearDebt)),
        netWorth: Math.round(oneYearSavings - oneYearDebt),
        savingsGrowth: Math.round(oneYearSavings - totalSavings),
        debtReduction: Math.round(totalDebt - oneYearDebt),
      },
      milestones: [
        {
          name: 'Долг по кредитным картам',
          achieved: totalDebt === 0,
          message: totalDebt === 0 
            ? 'Поздравляем! Вы избавились от долгов!' 
            : `Осталось погасить: ${totalDebt / 100} ₽`,
        },
        {
          name: 'Подушка безопасности (3 месяца)',
          achieved: totalSavings >= monthlyDebtPayments * 3,
          currentMonths: Math.floor(totalSavings / monthlyDebtPayments),
          targetMonths: 3,
        },
        {
          name: 'Первый миллион',
          achieved: totalSavings >= 1000000,
          current: totalSavings,
          target: 1000000,
          progress: Math.min(100, (totalSavings / 1000000) * 100),
        },
      ],
    };
  }
}
```

---

## 5. Интеграция с дашбордом

На главном экране мобильного приложения показываем:

```typescript
// components/FinancialSummaryCard.tsx
interface FinancialSummaryCardProps {
  userId: string;
}

export function FinancialSummaryCard({ userId }: FinancialSummaryCardProps) {
  const { data: summary } = trpc.financialForecast.quickSummary.useQuery({ userId });
  const { data: forecast } = trpc.financialForecast.calculate.useQuery({ userId });

  return (
    <YStack padding="$4" background="$cardBackground" borderRadius="$4">
      <Text fontSize="$5" fontWeight="bold" marginBottom="$2">
        Финансовый прогноз
      </Text>
      
      {/* Текущее состояние */}
      <XStack justifyContent="space-between" marginBottom="$3">
        <YStack>
          <Text color="$green10" fontSize="$3">
            Сбережения
          </Text>
          <Text fontSize="$6" fontWeight="bold">
            {formatCurrency(summary.current.totalSavings)}
          </Text>
        </YStack>
        <YStack>
          <Text color="$red10" fontSize="$3">
            Долги
          </Text>
          <Text fontSize="$6" fontWeight="bold">
            {formatCurrency(summary.current.totalDebt)}
          </Text>
        </YStack>
        <YStack>
          <Text color="$blue10" fontSize="$3">
            Чистая стоимость
          </Text>
          <Text fontSize="$6" fontWeight="bold">
            {formatCurrency(summary.current.netWorth)}
          </Text>
        </YStack>
      </XStack>

      {/* Прогноз на год */}
      <YStack background="$gray2" padding="$3" borderRadius="$3" marginBottom="$3">
        <Text fontSize="$3" color="$gray10" marginBottom="$1">
          Прогноз через 1 год
        </Text>
        <XStack justifyContent="space-between">
          <Text color="$green10">
            ↑ {formatCurrency(summary.oneYearProjection.savingsGrowth)}
          </Text>
          <Text color="$red10">
            ↓ {formatCurrency(summary.oneYearProjection.debtReduction)}
          </Text>
        </XStack>
      </YStack>

      {/* График роста */}
      <LineChart
        data={forecast.yearlyData.map(y => y.netWorth)}
        labels={forecast.yearlyData.map(y => `Год ${y.year}`)}
      />

      {/* Ближайшие цели */}
      <YStack marginTop="$3">
        <Text fontSize="$4" fontWeight="500" marginBottom="$2">
          Цели накоплений
        </Text>
        {summary.milestones.map(milestone => (
          <ProgressBar
            key={milestone.name}
            label={milestone.name}
            progress={milestone.progress || 0}
            isComplete={milestone.achieved}
          />
        ))}
      </YStack>
    </YStack>
  );
}
```

---

## 6. Фаза 9: Financial Forecast (новая)

```
### Фаза 9: Financial Forecast (3-4 дня)

- [ ] Создать FinancialForecastModule
- [ ] Реализовать Deposit CRUD + проекции
- [ ] Реализовать Loan CRUD + график платежей
- [ ] Реализовать Savings Goals
- [ ] Реализовать Forecast Scenarios
- [ ] Создать FinancialSummaryCard для дашборда
- [ ] Интегрировать с существующими модулями

**Общее время с новой фазой: ~20-24 рабочих дней**
```

---

## 7. Обновленная структура проекта

```
backend/src/
├── ...
├── financial-forecast/           # НОВЫЙ МОДУЛЬ
│   ├── financial-forecast.module.ts
│   ├── financial-forecast.service.ts
│   ├── financial-forecast.controller.ts
│   ├── dto/
│   │   ├── create-deposit.dto.ts
│   │   ├── create-loan.dto.ts
│   │   ├── create-savings-goal.dto.ts
│   │   └── create-forecast-scenario.dto.ts
│   └── services/
│       ├── deposit.service.ts
│       ├── loan.service.ts
│       └── forecast.service.ts
└── ...
```

---

## 8. Примеры использования

### Пример 1: Пользователь видит свой прогноз

```
Пользователь: 30 лет, инженер, зарплата 120,000 ₽
- Вклад в Сбербанке: 500,000 ₽ (ставка 10%)
- Ипотека: 3,000,000 ₽ (ставка 12%, остаток 20 лет)

Прогноз на 10 лет:
┌─────────┬──────────────┬──────────────┬──────────────┐
│ Год     │ Сбережения    │ Долги        │ Чистая стоим.│
├─────────┼──────────────┼──────────────┼──────────────┤
│ Сейчас  │ 500,000      │ 3,000,000    │ -2,500,000   │
│ 1       │ 1,100,000    │ 2,400,000    │ -1,300,000   │
│ 5       │ 4,000,000    │ 1,200,000    │ +2,800,000   │
│ 10      │ 8,500,000    │ 0            │ +8,500,000   │
└─────────┴──────────────┴──────────────┴──────────────┘

Мечта достигнута: К 40 годам без долгов с 8.5 млн сбережений!
```

### Пример 2: Симуляция изменения сбережений

```
Пользователь вводит:
- Текущие сбережения: 100,000 ₽
- Ежемесячный взнос: 30,000 ₽ (25% от зарплаты)
- Доходность: 12% годовых

Результат:
- Через 1 год: 580,000 ₽
- Через 3 года: 2,500,000 ₽
- Через 5 лет: 5,200,000 ₽
- Через 10 лет: 18,000,000 ₽

"Если вы будете откладывать 30,000 ₽/мес,
через 10 лет у вас будет 18 миллионов!"
```
