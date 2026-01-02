/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `idToken` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `providerAccountId` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `sessionState` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `tokenType` on the `account` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[providerId,accountId]` on the table `account` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `providerId` to the `account` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "account_provider_accountId_key";

-- AlterTable
ALTER TABLE "account" DROP COLUMN "expiresAt",
DROP COLUMN "idToken",
DROP COLUMN "provider",
DROP COLUMN "providerAccountId",
DROP COLUMN "refreshToken",
DROP COLUMN "sessionState",
DROP COLUMN "tokenType",
ADD COLUMN     "providerId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "account_providerId_accountId_key" ON "account"("providerId", "accountId");
