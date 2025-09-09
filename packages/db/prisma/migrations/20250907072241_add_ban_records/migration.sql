-- CreateTable
CREATE TABLE "ban_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bannedBy" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "bannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "unbannedAt" TIMESTAMP(3),
    "unbannedBy" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ban_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ban_records_userId_idx" ON "ban_records"("userId");

-- CreateIndex
CREATE INDEX "ban_records_bannedBy_idx" ON "ban_records"("bannedBy");

-- CreateIndex
CREATE INDEX "ban_records_active_idx" ON "ban_records"("active");

-- CreateIndex
CREATE INDEX "ban_records_bannedAt_idx" ON "ban_records"("bannedAt");

-- AddForeignKey
ALTER TABLE "ban_records" ADD CONSTRAINT "ban_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ban_records" ADD CONSTRAINT "ban_records_bannedBy_fkey" FOREIGN KEY ("bannedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
