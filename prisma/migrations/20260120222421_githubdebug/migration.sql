-- CreateTable
CREATE TABLE "GithubDebug" (
    "id" TEXT NOT NULL,
    "raw" JSONB NOT NULL,
    "status" TEXT,
    "action" TEXT,
    "commit" TEXT,
    "sha" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GithubDebug_pkey" PRIMARY KEY ("id")
);
