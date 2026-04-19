-- AlterTable
ALTER TABLE "users" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'RUB',
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'en';
