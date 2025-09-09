-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."EffectFlag" ADD VALUE 'ULTRAVISION';
ALTER TYPE "public"."EffectFlag" ADD VALUE 'LIGHT';
ALTER TYPE "public"."EffectFlag" ADD VALUE 'PROT_COLD';
ALTER TYPE "public"."EffectFlag" ADD VALUE 'PROT_AIR';
ALTER TYPE "public"."EffectFlag" ADD VALUE 'PROT_FIRE';
ALTER TYPE "public"."EffectFlag" ADD VALUE 'PROT_EARTH';
ALTER TYPE "public"."EffectFlag" ADD VALUE 'FARSEE';
ALTER TYPE "public"."EffectFlag" ADD VALUE 'STONE_SKIN';
ALTER TYPE "public"."EffectFlag" ADD VALUE 'DETECT_POISON';
ALTER TYPE "public"."EffectFlag" ADD VALUE 'SOULSHIELD';
ALTER TYPE "public"."EffectFlag" ADD VALUE 'TAMED';
ALTER TYPE "public"."EffectFlag" ADD VALUE 'GLORY';
ALTER TYPE "public"."EffectFlag" ADD VALUE 'STEALTH';
ALTER TYPE "public"."EffectFlag" ADD VALUE 'NEGATE_HEAT';
ALTER TYPE "public"."EffectFlag" ADD VALUE 'NEGATE_EARTH';
ALTER TYPE "public"."EffectFlag" ADD VALUE 'NEGATE_COLD';
ALTER TYPE "public"."EffectFlag" ADD VALUE 'NEGATE_AIR';
ALTER TYPE "public"."EffectFlag" ADD VALUE 'MAJOR_GLOBE';
ALTER TYPE "public"."EffectFlag" ADD VALUE 'INSANITY';
ALTER TYPE "public"."EffectFlag" ADD VALUE 'COLDSHIELD';
ALTER TYPE "public"."EffectFlag" ADD VALUE 'CAMOUFLAGED';
ALTER TYPE "public"."EffectFlag" ADD VALUE 'UNUSED';
ALTER TYPE "public"."EffectFlag" ADD VALUE 'REMOTE_AGGR';
ALTER TYPE "public"."EffectFlag" ADD VALUE 'MESMERIZED';
ALTER TYPE "public"."EffectFlag" ADD VALUE 'HARNESS';
ALTER TYPE "public"."EffectFlag" ADD VALUE 'FAMILIARITY';
ALTER TYPE "public"."EffectFlag" ADD VALUE 'DISPLACEMENT';
ALTER TYPE "public"."EffectFlag" ADD VALUE 'BLESS';
ALTER TYPE "public"."EffectFlag" ADD VALUE 'AWARE';
