/*
  Warnings:

  - You are about to drop the `GithubDebug` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "GithubDebug";

-- CreateTable
CREATE TABLE "GithubEvent" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "repo" TEXT NOT NULL,
    "actor" TEXT,
    "status" TEXT,
    "conclusion" TEXT,
    "commitSha" TEXT,
    "commitMessage" TEXT,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "raw" JSONB,

    CONSTRAINT "GithubEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GithubEvent_eventId_key" ON "GithubEvent"("eventId");
