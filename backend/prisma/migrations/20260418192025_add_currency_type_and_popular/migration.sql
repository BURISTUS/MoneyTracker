-- CreateEnum
CREATE TYPE "CurrencyType" AS ENUM ('FIAT', 'CRYPTO', 'METAL');

-- AlterTable
ALTER TABLE "exchange_rates" ADD COLUMN     "popular" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" "CurrencyType" NOT NULL DEFAULT 'FIAT';
