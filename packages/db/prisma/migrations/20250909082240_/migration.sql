/*
  Warnings:

  - You are about to drop the column `godLevel` on the `users` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "public"."UserRole" ADD VALUE 'BUILDER';

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "godLevel";
