/*
  Warnings:

  - Made the column `userEmail` on table `Note` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "userEmail" SET NOT NULL;

-- CreateTable
CREATE TABLE "UserRole" (
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("email")
);
