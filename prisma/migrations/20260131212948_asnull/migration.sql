/*
  Warnings:

  - You are about to drop the column `createdAt` on the `AstronomySnapshot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AstronomySnapshot" DROP COLUMN "createdAt",
ALTER COLUMN "sunriseBlueStart" DROP NOT NULL,
ALTER COLUMN "sunriseBlueEnd" DROP NOT NULL,
ALTER COLUMN "sunriseGoldenStart" DROP NOT NULL,
ALTER COLUMN "sunriseGoldenEnd" DROP NOT NULL,
ALTER COLUMN "sunsetGoldenStart" DROP NOT NULL,
ALTER COLUMN "sunsetGoldenEnd" DROP NOT NULL,
ALTER COLUMN "sunsetBlueStart" DROP NOT NULL,
ALTER COLUMN "sunsetBlueEnd" DROP NOT NULL;
