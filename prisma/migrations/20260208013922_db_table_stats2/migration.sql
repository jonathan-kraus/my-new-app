/*
  Warnings:

  - You are about to drop the column `capturedAt` on the `DbTableStats` table. All the data in the column will be lost.
  - Added the required column `snapshotDate` to the `DbTableStats` table without a default value. This is not possible if the table is not empty.

*/
-- 1. Add snapshotDate as nullable
ALTER TABLE "DbTableStats"
ADD COLUMN "snapshotDate" TIMESTAMP(3);

-- 2. Backfill from capturedAt (normalized to day)
UPDATE "DbTableStats"
SET "snapshotDate" = DATE_TRUNC('day', "capturedAt");

-- 3. Enforce NOT NULL
ALTER TABLE "DbTableStats"
ALTER COLUMN "snapshotDate" SET NOT NULL;

-- 4. Drop old column
ALTER TABLE "DbTableStats"
DROP COLUMN "capturedAt";
