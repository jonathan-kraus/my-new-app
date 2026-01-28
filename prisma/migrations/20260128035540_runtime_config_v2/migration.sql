/*
  Warnings:

  - You are about to drop the column `type` on the `RuntimeConfig` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RuntimeConfig" DROP COLUMN "type",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
