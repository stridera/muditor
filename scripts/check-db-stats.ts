#!/usr/bin/env tsx
/**
 * Check database statistics
 * Usage: npx tsx scripts/check-db-stats.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStats() {
  try {
    console.log('📊 Checking database statistics...');

    const [zones, rooms, mobs, objects, shops, users] = await Promise.all([
      prisma.zone.count(),
      prisma.room.count(),
      prisma.mob.count(),
      prisma.object.count(),
      prisma.shop.count(),
      prisma.user.count(),
    ]);

    console.log('\n📈 Database Statistics:');
    console.log(`   🏘️  Zones: ${zones}`);
    console.log(`   🏠 Rooms: ${rooms}`);
    console.log(`   👹 Mobs: ${mobs}`);
    console.log(`   📦 Objects: ${objects}`);
    console.log(`   🏪 Shops: ${shops}`);
    console.log(`   👥 Users: ${users}`);
  } catch (error) {
    console.error('❌ Error checking statistics:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
checkStats();
