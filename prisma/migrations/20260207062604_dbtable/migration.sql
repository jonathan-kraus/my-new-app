-- CreateTable
CREATE TABLE "DbTableStats" (
    "id" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "rowEstimate" INTEGER NOT NULL,
    "totalBytes" BIGINT NOT NULL,
    "indexBytes" BIGINT NOT NULL,
    "tableBytes" BIGINT NOT NULL,
    "toastBytes" BIGINT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DbTableStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DbTableStats_tableName_capturedAt_idx" ON "DbTableStats"("tableName", "capturedAt");
