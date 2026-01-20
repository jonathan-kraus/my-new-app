-- AlterTable
ALTER TABLE "Log" ADD COLUMN     "data" JSONB,
ADD COLUMN     "file" TEXT,
ADD COLUMN     "line" INTEGER,
ADD COLUMN     "page" TEXT,
ADD COLUMN     "sessionEmail" TEXT,
ADD COLUMN     "sessionUser" TEXT,
ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "Log_requestId_idx" ON "Log"("requestId");

-- CreateIndex
CREATE INDEX "Log_page_idx" ON "Log"("page");

-- CreateIndex
CREATE INDEX "Log_userId_idx" ON "Log"("userId");

-- CreateIndex
CREATE INDEX "Log_sessionEmail_idx" ON "Log"("sessionEmail");

-- CreateIndex
CREATE INDEX "Log_sessionUser_idx" ON "Log"("sessionUser");

-- CreateIndex
CREATE INDEX "Log_file_idx" ON "Log"("file");
