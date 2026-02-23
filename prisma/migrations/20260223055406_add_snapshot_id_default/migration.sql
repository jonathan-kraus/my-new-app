-- CreateTable
CREATE TABLE "TravelSnapshot" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "confirmationCode" TEXT NOT NULL,
    "issuedDate" TEXT NOT NULL,
    "passengers" JSONB NOT NULL,
    "segments" JSONB NOT NULL,
    "payment" JSONB NOT NULL,
    "bags" JSONB NOT NULL,
    "rawHtml" TEXT NOT NULL,

    CONSTRAINT "TravelSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TravelSnapshot_receivedAt_idx" ON "TravelSnapshot"("receivedAt");
