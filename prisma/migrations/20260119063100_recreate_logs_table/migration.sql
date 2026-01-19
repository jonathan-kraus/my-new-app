/*
  Warnings:

  - The primary key for the `Log` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Log` table. All the data in the column will be lost.
  - You are about to drop the column `data` on the `Log` table. All the data in the column will be lost.
  - You are about to drop the column `durationMs` on the `Log` table. All the data in the column will be lost.
  - You are about to drop the column `eventIndex` on the `Log` table. All the data in the column will be lost.
  - You are about to drop the column `file` on the `Log` table. All the data in the column will be lost.
  - You are about to drop the column `line` on the `Log` table. All the data in the column will be lost.
  - You are about to drop the column `page` on the `Log` table. All the data in the column will be lost.
  - You are about to drop the column `requestId` on the `Log` table. All the data in the column will be lost.
  - You are about to drop the column `sessionEmail` on the `Log` table. All the data in the column will be lost.
  - You are about to drop the column `sessionUser` on the `Log` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Log` table. All the data in the column will be lost.
  - The `id` column on the `Log` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `archived` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `userEmail` on the `Note` table. All the data in the column will be lost.
  - Added the required column `domain` to the `Log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payload` to the `Log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timestamp` to the `Log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Note` table without a default value. This is not possible if the table is not empty.
  - Made the column `content` on table `Note` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Log" DROP CONSTRAINT "Log_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "data",
DROP COLUMN "durationMs",
DROP COLUMN "eventIndex",
DROP COLUMN "file",
DROP COLUMN "line",
DROP COLUMN "page",
DROP COLUMN "requestId",
DROP COLUMN "sessionEmail",
DROP COLUMN "sessionUser",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "domain" TEXT NOT NULL,
ADD COLUMN     "env" TEXT,
ADD COLUMN     "host" TEXT,
ADD COLUMN     "meta" JSONB,
ADD COLUMN     "payload" JSONB NOT NULL,
ADD COLUMN     "timestamp" BIGINT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
ADD CONSTRAINT "Log_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Note" DROP COLUMN "archived",
DROP COLUMN "userEmail",
ADD COLUMN     "color" TEXT,
ADD COLUMN     "followUpAt" TIMESTAMP(3),
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "content" SET NOT NULL;

-- DropEnum
DROP TYPE "LogLevel";

-- CreateIndex
CREATE INDEX "Log_timestamp_idx" ON "Log"("timestamp");

-- CreateIndex
CREATE INDEX "Log_domain_idx" ON "Log"("domain");

-- CreateIndex
CREATE INDEX "Log_level_idx" ON "Log"("level");

-- CreateIndex
CREATE INDEX "Log_created_at_idx" ON "Log"("created_at");

-- CreateIndex
CREATE INDEX "Log_payload_idx" ON "Log" USING GIN ("payload");

-- CreateIndex
CREATE INDEX "Log_meta_idx" ON "Log" USING GIN ("meta");

-- CreateIndex
CREATE INDEX "Note_userId_idx" ON "Note"("userId");

-- CreateIndex
CREATE INDEX "Note_followUpAt_idx" ON "Note"("followUpAt");

-- CreateIndex
CREATE INDEX "Note_isCompleted_idx" ON "Note"("isCompleted");

-- CreateIndex
CREATE INDEX "Note_isArchived_idx" ON "Note"("isArchived");
