-- AlterEnum
ALTER TYPE "SubscriptionPlan" ADD VALUE 'PREMIUM_FAMILY';

-- AlterTable
ALTER TABLE "family_members" ADD COLUMN     "subscriptionId" TEXT;

-- AddForeignKey
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
