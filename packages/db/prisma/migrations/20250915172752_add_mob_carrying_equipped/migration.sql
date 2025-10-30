-- CreateTable
CREATE TABLE "public"."mob_carrying" (
    "id" TEXT NOT NULL,
    "max" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT,
    "objectId" INTEGER NOT NULL,
    "resetId" TEXT NOT NULL,

    CONSTRAINT "mob_carrying_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mob_equipped" (
    "id" TEXT NOT NULL,
    "max" INTEGER NOT NULL DEFAULT 1,
    "location" TEXT NOT NULL,
    "name" TEXT,
    "objectId" INTEGER NOT NULL,
    "resetId" TEXT NOT NULL,

    CONSTRAINT "mob_equipped_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."mob_carrying" ADD CONSTRAINT "mob_carrying_objectId_fkey" FOREIGN KEY ("objectId") REFERENCES "public"."objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mob_carrying" ADD CONSTRAINT "mob_carrying_resetId_fkey" FOREIGN KEY ("resetId") REFERENCES "public"."mob_resets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mob_equipped" ADD CONSTRAINT "mob_equipped_objectId_fkey" FOREIGN KEY ("objectId") REFERENCES "public"."objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mob_equipped" ADD CONSTRAINT "mob_equipped_resetId_fkey" FOREIGN KEY ("resetId") REFERENCES "public"."mob_resets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
