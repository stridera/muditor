const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.DATABASE_URL ||
        'postgresql://muditor_dev:muditor_dev@localhost:5432/muditor_dev',
    },
  },
});

async function checkImport() {
  try {
    const zones = await prisma.zone.count();
    const rooms = await prisma.room.count();
    const mobs = await prisma.mob.count();
    const objects = await prisma.object.count();
    const shops = await prisma.shop.count();
    const users = await prisma.user.count();

    console.log('Database Import Status:');
    console.log(`  📦 Zones: ${zones}`);
    console.log(`  🏠 Rooms: ${rooms}`);
    console.log(`  🤖 Mobs: ${mobs}`);
    console.log(`  📦 Objects: ${objects}`);
    console.log(`  🏪 Shops: ${shops}`);
    console.log(`  👤 Users: ${users}`);

    // Check some sample data
    const sampleZone = await prisma.zone.findFirst({
      include: {
        rooms: { take: 1 },
        mobs: { take: 1 },
        objects: { take: 1 },
      },
    });

    if (sampleZone) {
      console.log(`\nSample Zone: ${sampleZone.name} (ID: ${sampleZone.id})`);
      console.log(
        `  Rooms: ${sampleZone.rooms.length > 0 ? sampleZone.rooms[0].name : 'None'}`
      );
      console.log(
        `  Mobs: ${sampleZone.mobs.length > 0 ? sampleZone.mobs[0].shortDesc : 'None'}`
      );
      console.log(
        `  Objects: ${sampleZone.objects.length > 0 ? sampleZone.objects[0].shortDesc : 'None'}`
      );
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkImport();
