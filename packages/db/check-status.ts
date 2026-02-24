/* eslint-disable */
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@muditor/db';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function checkStatus() {
  try {
    const zones = await prisma.zone.count();
    const rooms = await prisma.room.count();
    const mobs = await prisma.mob.count();
    const objects = await prisma.object.count();
    const shops = await prisma.shop.count();
    const users = await prisma.user.count();

    console.log('✅ Database Import Status:');
    console.log(`   📦 Zones: ${zones}`);
    console.log(`   🏠 Rooms: ${rooms}`);
    console.log(`   🤖 Mobs: ${mobs}`);
    console.log(`   📦 Objects: ${objects}`);
    console.log(`   🏪 Shops: ${shops}`);
    console.log(`   👤 Users: ${users}`);

    // Get sample zone data
    const sampleZone = await prisma.zone.findFirst({
      include: {
        rooms: { take: 3 },
        mobs: { take: 2 },
        objects: { take: 2 },
      },
    });

    if (sampleZone) {
      console.log(
        `\n📍 Sample Zone: "${sampleZone.name}" (ID: ${sampleZone.id})`
      );
      console.log(
        `   Climate: ${sampleZone.climate}, Hemisphere: ${sampleZone.hemisphere}`
      );
      console.log(
        `   Rooms: ${sampleZone.rooms.map(r => `${r.id}: ${r.name}`).join(', ')}`
      );
      console.log(
        `   Mobs: ${sampleZone.mobs.map(m => `${m.id}: ${m.shortDesc}`).join(', ')}`
      );
      console.log(
        `   Objects: ${sampleZone.objects.map(o => `${o.id}: ${o.shortDesc}`).join(', ')}`
      );
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStatus();
