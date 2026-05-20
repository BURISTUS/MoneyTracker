-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('WISHLIST_READY', 'BUDGET_ALERT');
ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "NotificationType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "deposit_transactions" DROP CONSTRAINT "deposit_transactions_depositId_fkey";

-- DropForeignKey
ALTER TABLE "deposits" DROP CONSTRAINT "deposits_userId_fkey";

-- DropForeignKey
ALTER TABLE "forecast_scenarios" DROP CONSTRAINT "forecast_scenarios_userId_fkey";

-- DropForeignKey
ALTER TABLE "loan_payments" DROP CONSTRAINT "loan_payments_loanId_fkey";

-- DropForeignKey
ALTER TABLE "loans" DROP CONSTRAINT "loans_userId_fkey";

-- DropForeignKey
ALTER TABLE "refresh_tokens" DROP CONSTRAINT "refresh_tokens_userId_fkey";

-- DropForeignKey
ALTER TABLE "savings_goals" DROP CONSTRAINT "savings_goals_userId_fkey";

-- DropForeignKey
ALTER TABLE "streak_days" DROP CONSTRAINT "streak_days_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_achievements" DROP CONSTRAINT "user_achievements_achievementId_fkey";

-- DropForeignKey
ALTER TABLE "user_achievements" DROP CONSTRAINT "user_achievements_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_challenges" DROP CONSTRAINT "user_challenges_challengeId_fkey";

-- DropForeignKey
ALTER TABLE "user_challenges" DROP CONSTRAINT "user_challenges_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_gamification" DROP CONSTRAINT "user_gamification_userId_fkey";

-- DropForeignKey
ALTER TABLE "xp_events" DROP CONSTRAINT "xp_events_userId_fkey";

-- DropIndex
DROP INDEX "sessions_token_key";

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "token",
ADD COLUMN     "deviceInfo" TEXT,
ADD COLUMN     "isRevoked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "refreshToken" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "achievements";

-- DropTable
DROP TABLE "challenges";

-- DropTable
DROP TABLE "deposit_transactions";

-- DropTable
DROP TABLE "deposits";

-- DropTable
DROP TABLE "forecast_scenarios";

-- DropTable
DROP TABLE "loan_payments";

-- DropTable
DROP TABLE "loans";

-- DropTable
DROP TABLE "refresh_tokens";

-- DropTable
DROP TABLE "savings_goals";

-- DropTable
DROP TABLE "streak_days";

-- DropTable
DROP TABLE "user_achievements";

-- DropTable
DROP TABLE "user_challenges";

-- DropTable
DROP TABLE "user_gamification";

-- DropTable
DROP TABLE "xp_events";

-- DropEnum
DROP TYPE "AchievementCondition";

-- DropEnum
DROP TYPE "AchievementTier";

-- DropEnum
DROP TYPE "ChallengeStatus";

-- DropEnum
DROP TYPE "ChallengeType";

-- DropEnum
DROP TYPE "CompoundingType";

-- DropEnum
DROP TYPE "DepositTransactionType";

-- DropEnum
DROP TYPE "DepositType";

-- DropEnum
DROP TYPE "GamificationStatus";

-- DropEnum
DROP TYPE "LoanType";

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE INDEX "goal_contributions_goalId_idx" ON "goal_contributions"("goalId");

-- CreateIndex
CREATE INDEX "goals_userId_idx" ON "goals"("userId");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refreshToken_key" ON "sessions"("refreshToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "transactions_userId_date_idx" ON "transactions"("userId", "date");

-- CreateIndex
CREATE INDEX "transactions_userId_type_idx" ON "transactions"("userId", "type");

-- CreateIndex
CREATE INDEX "transactions_accountId_idx" ON "transactions"("accountId");

-- CreateIndex
CREATE INDEX "transactions_categoryId_idx" ON "transactions"("categoryId");

-- CreateIndex
CREATE INDEX "wishlist_items_userId_status_idx" ON "wishlist_items"("userId", "status");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

