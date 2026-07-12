/*
  Warnings:

  - A unique constraint covering the columns `[confirmationCode]` on the table `TravelSnapshot` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TravelSnapshot_confirmationCode_key" ON "TravelSnapshot"("confirmationCode");
