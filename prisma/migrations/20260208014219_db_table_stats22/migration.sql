-- AlterTable
ALTER TABLE "DbTableStats" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "DbTableStats_tableName_snapshotDate_idx" ON "DbTableStats"("tableName", "snapshotDate");
