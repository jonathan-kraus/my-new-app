-- DropForeignKey
ALTER TABLE "AstronomySnapshot" DROP CONSTRAINT "AstronomySnapshot_locationId_fkey";

-- DropIndex
DROP INDEX "AstronomySnapshot_locationId_fetchedAt_idx";

-- AlterTable
ALTER TABLE "AstronomySnapshot" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "sunriseBlueEnd" TIMESTAMP(3),
ADD COLUMN     "sunriseBlueStart" TIMESTAMP(3),
ADD COLUMN     "sunriseGoldenEnd" TIMESTAMP(3),
ADD COLUMN     "sunriseGoldenStart" TIMESTAMP(3),
ADD COLUMN     "sunsetBlueEnd" TIMESTAMP(3),
ADD COLUMN     "sunsetBlueStart" TIMESTAMP(3),
ADD COLUMN     "sunsetGoldenEnd" TIMESTAMP(3),
ADD COLUMN     "sunsetGoldenStart" TIMESTAMP(3),
ALTER COLUMN "fetchedAt" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "AstronomySnapshot" ADD CONSTRAINT "AstronomySnapshot_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
