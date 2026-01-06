/*
  Warnings:

  - Made the column `sunriseBlueEnd` on table `AstronomySnapshot` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sunriseBlueStart` on table `AstronomySnapshot` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sunriseGoldenEnd` on table `AstronomySnapshot` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sunriseGoldenStart` on table `AstronomySnapshot` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sunsetBlueEnd` on table `AstronomySnapshot` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sunsetBlueStart` on table `AstronomySnapshot` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sunsetGoldenEnd` on table `AstronomySnapshot` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sunsetGoldenStart` on table `AstronomySnapshot` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "AstronomySnapshot" ALTER COLUMN "sunriseBlueEnd" SET NOT NULL,
ALTER COLUMN "sunriseBlueStart" SET NOT NULL,
ALTER COLUMN "sunriseGoldenEnd" SET NOT NULL,
ALTER COLUMN "sunriseGoldenStart" SET NOT NULL,
ALTER COLUMN "sunsetBlueEnd" SET NOT NULL,
ALTER COLUMN "sunsetBlueStart" SET NOT NULL,
ALTER COLUMN "sunsetGoldenEnd" SET NOT NULL,
ALTER COLUMN "sunsetGoldenStart" SET NOT NULL;
