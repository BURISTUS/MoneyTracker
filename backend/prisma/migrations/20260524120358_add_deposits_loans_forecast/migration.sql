-- CreateEnum
CREATE TYPE "DepositType" AS ENUM ('SAVINGS_ACCOUNT', 'TERM_DEPOSIT', 'INVESTMENT', 'BONDS');

-- CreateEnum
CREATE TYPE "CompoundingType" AS ENUM ('DAILY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY', 'NONE');

-- CreateEnum
CREATE TYPE "DepositTransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'INTEREST');

-- CreateEnum
CREATE TYPE "LoanType" AS ENUM ('MORTGAGE', 'CONSUMER', 'AUTO', 'STUDENT', 'CREDIT_CARD');

-- CreateTable
CREATE TABLE "deposits" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DepositType" NOT NULL,
    "principal" BIGINT NOT NULL,
    "currentAmount" BIGINT NOT NULL,
    "annualRate" DOUBLE PRECISION NOT NULL,
    "compounding" "CompoundingType" NOT NULL,
    "termMonths" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deposits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deposit_transactions" (
    "id" TEXT NOT NULL,
    "depositId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "type" "DepositTransactionType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deposit_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "LoanType" NOT NULL,
    "principal" BIGINT NOT NULL,
    "currentBalance" BIGINT NOT NULL,
    "annualRate" DOUBLE PRECISION NOT NULL,
    "termMonths" INTEGER NOT NULL,
    "monthlyPayment" BIGINT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isPaidOff" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_payments" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "principal" BIGINT NOT NULL,
    "interest" BIGINT NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loan_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forecast_scenarios" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "monthlyIncome" BIGINT NOT NULL,
    "monthlyExpenses" BIGINT NOT NULL,
    "monthlySave" BIGINT NOT NULL,
    "deposits" JSONB NOT NULL DEFAULT '[]',
    "loans" JSONB NOT NULL DEFAULT '[]',
    "inflationRate" DOUBLE PRECISION NOT NULL DEFAULT 7.0,
    "investmentReturnRate" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "forecastYears" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forecast_scenarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "deposits_userId_idx" ON "deposits"("userId");

-- CreateIndex
CREATE INDEX "deposit_transactions_depositId_idx" ON "deposit_transactions"("depositId");

-- CreateIndex
CREATE INDEX "loans_userId_idx" ON "loans"("userId");

-- CreateIndex
CREATE INDEX "loan_payments_loanId_idx" ON "loan_payments"("loanId");

-- CreateIndex
CREATE INDEX "forecast_scenarios_userId_idx" ON "forecast_scenarios"("userId");

-- AddForeignKey
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposit_transactions" ADD CONSTRAINT "deposit_transactions_depositId_fkey" FOREIGN KEY ("depositId") REFERENCES "deposits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_payments" ADD CONSTRAINT "loan_payments_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forecast_scenarios" ADD CONSTRAINT "forecast_scenarios_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
