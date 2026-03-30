/*
  Warnings:

  - You are about to drop the column `data` on the `Log` table. All the data in the column will be lost.
  - You are about to drop the column `page` on the `Log` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Log_page_idx";

-- AlterTable
ALTER TABLE "Log" DROP COLUMN "data",
DROP COLUMN "page";
