ALTER TABLE "categories" ADD COLUMN "excludeFromTotal" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "categories" ADD COLUMN "monthlyLimit" BIGINT;
