/*
  Warnings:

  - You are about to drop the column `segments` on the `TravelSnapshot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TravelSnapshot" DROP COLUMN "segments";

-- CreateTable
CREATE TABLE "TravelSegment" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "departureAirport" TEXT NOT NULL,
    "departureCity" TEXT NOT NULL,
    "departureTime" TEXT NOT NULL,
    "arrivalAirport" TEXT NOT NULL,
    "arrivalCity" TEXT NOT NULL,
    "arrivalTime" TEXT NOT NULL,
    "flightNumber" TEXT NOT NULL,
    "operatedBy" TEXT,
    "marketedAs" TEXT,
    "cabin" TEXT,
    "fareClass" TEXT,
    "seats" TEXT,

    CONSTRAINT "TravelSegment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TravelSegment" ADD CONSTRAINT "TravelSegment_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "TravelSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
