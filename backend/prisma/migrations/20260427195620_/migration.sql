/*
  Warnings:

  - The values [NO_SPEND_CATEGORY_DAYS] on the enum `AchievementCondition` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AchievementCondition_new" AS ENUM ('STREAK_DAYS', 'WISHLIST_REJECTED', 'BUDGET_UNDER_LIMIT', 'TOTAL_TRANSACTIONS', 'GOALS_COMPLETED', 'TOTAL_SAVED_AMOUNT', 'APP_USAGE_DAYS');
ALTER TABLE "achievements" ALTER COLUMN "conditionType" TYPE "AchievementCondition_new" USING ("conditionType"::text::"AchievementCondition_new");
ALTER TYPE "AchievementCondition" RENAME TO "AchievementCondition_old";
ALTER TYPE "AchievementCondition_new" RENAME TO "AchievementCondition";
DROP TYPE "AchievementCondition_old";
COMMIT;

-- AlterTable
ALTER TABLE "achievements" ALTER COLUMN "category" DROP DEFAULT;

-- AlterTable
ALTER TABLE "goals" ALTER COLUMN "deadline" SET DEFAULT CURRENT_TIMESTAMP;
