-- CreateTable
CREATE TABLE "ForecastSnapshot" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payload" JSONB NOT NULL,

    CONSTRAINT "ForecastSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuntimeConfig" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RuntimeConfig_pkey" PRIMARY KEY ("key")
);

-- AddForeignKey
ALTER TABLE "ForecastSnapshot" ADD CONSTRAINT "ForecastSnapshot_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
