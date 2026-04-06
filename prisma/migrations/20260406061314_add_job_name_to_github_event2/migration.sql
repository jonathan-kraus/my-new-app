/*
  Warnings:

  - You are about to drop the column `jobname` on the `GithubEvent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GithubEvent" DROP COLUMN "jobname",
ADD COLUMN     "jobName" TEXT;
