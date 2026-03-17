/*
  Warnings:

  - You are about to drop the column `env` on the `Log` table. All the data in the column will be lost.
  - You are about to drop the column `host` on the `Log` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Log" DROP COLUMN "env",
DROP COLUMN "host";
