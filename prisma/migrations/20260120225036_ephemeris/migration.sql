-- CreateTable
CREATE TABLE "EphemerisDebug" (
    "id" TEXT NOT NULL,
    "locationId" TEXT,
    "fetchedAt" TEXT,
    "createdAt" TEXT,
    "date" TEXT,
    "sunrise" TEXT,
    "sunset" TEXT,
    "moonrise" TEXT,
    "moonset" TEXT,
    "moonPhase" DOUBLE PRECISION,
    "sunriseBlueStart" TEXT,
    "sunriseBlueEnd" TEXT,
    "sunriseGoldenStart" TEXT,
    "sunriseGoldenEnd" TEXT,
    "sunsetGoldenStart" TEXT,
    "sunsetGoldenEnd" TEXT,
    "sunsetBlueStart" TEXT,
    "sunsetBlueEnd" TEXT,
    "raw" JSONB NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EphemerisDebug_pkey" PRIMARY KEY ("id")
);
