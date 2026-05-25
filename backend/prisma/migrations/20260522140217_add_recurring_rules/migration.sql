-- CreateEnum
CREATE TYPE "RecurrencePeriod" AS ENUM ('WEEKLY', 'MONTHLY');

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "recurringRuleId" TEXT;

-- CreateTable
CREATE TABLE "recurring_rules" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "period" "RecurrencePeriod" NOT NULL,
    "dayOfWeek" INTEGER,
    "dayOfMonth" INTEGER,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "nextRunDate" TIMESTAMP(3) NOT NULL,
    "lastRunDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recurring_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recurring_rules_userId_idx" ON "recurring_rules"("userId");

-- CreateIndex
CREATE INDEX "recurring_rules_nextRunDate_idx" ON "recurring_rules"("nextRunDate");

-- CreateIndex
CREATE INDEX "transactions_recurringRuleId_idx" ON "transactions"("recurringRuleId");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_recurringRuleId_fkey" FOREIGN KEY ("recurringRuleId") REFERENCES "recurring_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_rules" ADD CONSTRAINT "recurring_rules_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_rules" ADD CONSTRAINT "recurring_rules_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_rules" ADD CONSTRAINT "recurring_rules_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
