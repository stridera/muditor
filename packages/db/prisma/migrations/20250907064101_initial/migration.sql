/*
  Warnings:

  - You are about to drop the column `race_legacy` on the `characters` table. All the data in the column will be lost.
  - Made the column `raceId` on table `characters` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "characters" DROP CONSTRAINT "characters_raceId_fkey";

-- AlterTable
ALTER TABLE "characters" DROP COLUMN "race_legacy",
ADD COLUMN     "experience" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "hitPointsMax" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "manaMax" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "movementMax" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "skillPoints" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "raceId" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "last_failed_login" TIMESTAMP(3),
ADD COLUMN     "locked_until" TIMESTAMP(3),
ADD COLUMN     "reset_token" TEXT,
ADD COLUMN     "reset_token_expiry" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "change_logs" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changes" JSONB NOT NULL DEFAULT '{}',
    "userId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,

    CONSTRAINT "change_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "change_logs_entityType_entityId_idx" ON "change_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "change_logs_userId_timestamp_idx" ON "change_logs"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "change_logs_timestamp_idx" ON "change_logs"("timestamp");

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "races"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "change_logs" ADD CONSTRAINT "change_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
