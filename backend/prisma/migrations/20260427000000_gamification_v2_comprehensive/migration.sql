-- AlterEnum
ALTER TYPE "AchievementCondition" ADD VALUE 'TOTAL_TRANSACTIONS';
ALTER TYPE "AchievementCondition" ADD VALUE 'GOALS_COMPLETED';
ALTER TYPE "AchievementCondition" ADD VALUE 'APP_USAGE_DAYS';

-- AlterTable: UserGamification new fields
ALTER TABLE "user_gamification" ADD COLUMN "currentStreak" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "user_gamification" ADD COLUMN "longestStreak" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "user_gamification" ADD COLUMN "lastActionAt" TIMESTAMP(3);
ALTER TABLE "user_gamification" ADD COLUMN "streakFreezeUsed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "user_gamification" ADD COLUMN "streakFreezeResetAt" TIMESTAMP(3);
ALTER TABLE "user_gamification" ADD COLUMN "totalTransactions" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "user_gamification" ADD COLUMN "totalRejected" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "user_gamification" ADD COLUMN "totalPurchased" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "user_gamification" ADD COLUMN "totalGoalsCompleted" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "user_gamification" ADD COLUMN "consecutiveBudgetMonths" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "user_gamification" ADD COLUMN "hourlyRateSet" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: Achievement add category column
ALTER TABLE "achievements" ADD COLUMN "category" TEXT NOT NULL DEFAULT '';

-- CreateTable: XpEvent
CREATE TABLE "xp_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "baseXp" INTEGER NOT NULL,
    "multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "totalXp" INTEGER NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "xp_events_userId_createdAt_idx" ON "xp_events"("userId", "createdAt");

CREATE TABLE "streak_days" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "actionCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "streak_days_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "streak_days_userId_date_key" UNIQUE ("userId", "date")
);

-- Add foreign keys
ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "streak_days" ADD CONSTRAINT "streak_days_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
