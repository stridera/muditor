-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MobFlag" ADD VALUE 'SLOW_TRACK';
ALTER TYPE "MobFlag" ADD VALUE 'NOSILENCE';
ALTER TYPE "MobFlag" ADD VALUE 'PEACEFUL';
ALTER TYPE "MobFlag" ADD VALUE 'PROTECTOR';
ALTER TYPE "MobFlag" ADD VALUE 'PEACEKEEPER';
ALTER TYPE "MobFlag" ADD VALUE 'HASTE';
ALTER TYPE "MobFlag" ADD VALUE 'BLUR';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RoomFlag" ADD VALUE 'ALWAYSLIT';
ALTER TYPE "RoomFlag" ADD VALUE 'GUILDHALL';
ALTER TYPE "RoomFlag" ADD VALUE 'NOWELL';
ALTER TYPE "RoomFlag" ADD VALUE 'NOSUMMON';

-- AlterEnum
ALTER TYPE "ShopFlag" ADD VALUE 'WILL_BANK_MONEY';
