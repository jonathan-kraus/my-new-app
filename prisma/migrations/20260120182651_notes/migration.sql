/*
  Warnings:

  - Added the required column `userEmail` to the `Note` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "userEmail" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Note_userEmail_idx" ON "Note"("userEmail");
