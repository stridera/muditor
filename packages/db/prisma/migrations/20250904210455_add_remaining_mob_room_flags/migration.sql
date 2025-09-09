-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MobFlag" ADD VALUE 'NO_CLASS_AI';
ALTER TYPE "MobFlag" ADD VALUE 'FAST_TRACK';
ALTER TYPE "MobFlag" ADD VALUE 'AQUATIC';
ALTER TYPE "MobFlag" ADD VALUE 'NO_EQ_RESTRICT';
ALTER TYPE "MobFlag" ADD VALUE 'SUMMONED_MOUNT';
ALTER TYPE "MobFlag" ADD VALUE 'NOPOISON';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RoomFlag" ADD VALUE 'UNDERDARK';
ALTER TYPE "RoomFlag" ADD VALUE 'NOSHIFT';
ALTER TYPE "RoomFlag" ADD VALUE 'NORECALL';
ALTER TYPE "RoomFlag" ADD VALUE 'ALT_EXIT';
ALTER TYPE "RoomFlag" ADD VALUE 'OBSERVATORY';
ALTER TYPE "RoomFlag" ADD VALUE 'HOUSE_CRASH';
