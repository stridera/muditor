import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@muditor/db';

async function checkZones() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  try {
    const zoneCount = await prisma.zone.count();
    console.log(`Total zones in database: ${zoneCount}`);

    const zones = await prisma.zone.findMany({
      orderBy: { id: 'asc' },
      select: { id: true, name: true },
    });

    console.log('\nZones in database:');
    zones.forEach(zone => {
      console.log(`${zone.id}: ${zone.name}`);
    });

    if (zones.length > 0) {
      const minId = Math.min(...zones.map(z => z.id));
      const maxId = Math.max(...zones.map(z => z.id));
      console.log(`\nID range: ${minId} to ${maxId}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkZones().catch(console.error);
