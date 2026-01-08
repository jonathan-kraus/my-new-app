/*
  Warnings:

  - A unique constraint covering the columns `[locationId,date]` on the table `AstronomySnapshot` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AstronomySnapshot_locationId_date_key" ON "AstronomySnapshot"("locationId", "date");
