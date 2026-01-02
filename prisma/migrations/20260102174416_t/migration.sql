/*
  Warnings:

  - Added the required column `sunrise` to the `AstronomySnapshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sunset` to the `AstronomySnapshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `temperature` to the `WeatherSnapshot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AstronomySnapshot" ADD COLUMN     "moonrise" TIMESTAMP(3),
ADD COLUMN     "moonset" TIMESTAMP(3),
ADD COLUMN     "sunrise" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "sunset" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "WeatherSnapshot" ADD COLUMN     "feelsLike" DOUBLE PRECISION,
ADD COLUMN     "humidity" DOUBLE PRECISION,
ADD COLUMN     "pressure" DOUBLE PRECISION,
ADD COLUMN     "temperature" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "visibility" DOUBLE PRECISION,
ADD COLUMN     "weatherCode" INTEGER,
ADD COLUMN     "windDirection" DOUBLE PRECISION,
ADD COLUMN     "windSpeed" DOUBLE PRECISION;
