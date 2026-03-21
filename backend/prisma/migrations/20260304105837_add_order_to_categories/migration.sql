/*
  Warnings:

  - You are about to drop the column `isSystem` on the `categories` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "categories" DROP COLUMN "isSystem",
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "categories_userId_idx" ON "categories"("userId");
