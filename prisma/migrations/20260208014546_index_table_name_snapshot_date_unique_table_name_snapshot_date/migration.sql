/*
  Warnings:

  - A unique constraint covering the columns `[tableName,snapshotDate]` on the table `DbTableStats` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DbTableStats_tableName_snapshotDate_key" ON "DbTableStats"("tableName", "snapshotDate");
