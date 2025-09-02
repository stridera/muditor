import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function validateImportedData() {
  console.log('🔍 Validating imported world data...\n');
  
  try {
    // Get basic counts
    const stats = {
      users: await prisma.user.count(),
      characters: await prisma.character.count(),
      zones: await prisma.zone.count(),
      rooms: await prisma.room.count(),
      mobs: await prisma.mob.count(),
      objects: await prisma.object.count(),
      shops: await prisma.shop.count(),
      triggers: await prisma.trigger.count(),
      mobResets: await prisma.mobReset.count(),
      roomExits: await prisma.roomExit.count(),
    };
    
    console.log('📊 Import Statistics:');
    console.log(`   👤 Users: ${stats.users}`);
    console.log(`   🎭 Characters: ${stats.characters}`);
    console.log(`   📦 Zones: ${stats.zones}`);
    console.log(`   🏠 Rooms: ${stats.rooms}`);
    console.log(`   🤖 Mobs: ${stats.mobs}`);
    console.log(`   📦 Objects: ${stats.objects}`);
    console.log(`   🏪 Shops: ${stats.shops}`);
    console.log(`   📜 Triggers: ${stats.triggers}`);
    console.log(`   🔄 Mob Resets: ${stats.mobResets}`);
    console.log(`   🚪 Room Exits: ${stats.roomExits}\n`);
    
    // Check some specific zones
    console.log('🔍 Zone Analysis:');
    const zoneWithMostRooms = await prisma.zone.findFirst({
      include: {
        _count: {
          select: { rooms: true, mobs: true, objects: true }
        }
      },
      orderBy: {
        rooms: {
          _count: 'desc'
        }
      }
    });
    
    if (zoneWithMostRooms) {
      console.log(`   🏆 Zone with most rooms: Zone ${zoneWithMostRooms.id} "${zoneWithMostRooms.name}"`);
      console.log(`      Rooms: ${zoneWithMostRooms._count.rooms}, Mobs: ${zoneWithMostRooms._count.mobs}, Objects: ${zoneWithMostRooms._count.objects}`);
    }
    
    // Check room connectivity
    const roomsWithExits = await prisma.room.count({
      where: {
        exits: {
          some: {}
        }
      }
    });
    
    console.log(`   🗺️  Rooms with exits: ${roomsWithExits}/${stats.rooms} (${Math.round(roomsWithExits/stats.rooms*100)}%)`);
    
    // Check shops with items
    const shopsWithItems = await prisma.shop.count({
      where: {
        items: {
          some: {}
        }
      }
    });
    
    console.log(`   🛍️  Shops with items: ${shopsWithItems}/${stats.shops} (${Math.round(shopsWithItems/stats.shops*100)}%)`);
    
    // Check mobs with equipment
    const mobsWithEquipment = await prisma.mobReset.count({
      where: {
        OR: [
          { carrying: { some: {} } },
          { equipped: { some: {} } }
        ]
      }
    });
    
    console.log(`   ⚔️  Mob resets with equipment: ${mobsWithEquipment}/${stats.mobResets}`);
    
    // Sample some data
    console.log('\n📋 Sample Data:');
    const sampleZone = await prisma.zone.findFirst({
      where: { id: 1 },
      include: {
        rooms: { take: 3 },
        mobs: { take: 2 },
        objects: { take: 2 }
      }
    });
    
    if (sampleZone) {
      console.log(`   Zone 1: "${sampleZone.name}"`);
      console.log(`   Sample rooms: ${sampleZone.rooms.map(r => `${r.id}:"${r.name}"`).join(', ')}`);
      console.log(`   Sample mobs: ${sampleZone.mobs.map(m => `${m.id}:"${m.shortDesc}"`).join(', ')}`);
      console.log(`   Sample objects: ${sampleZone.objects.map(o => `${o.id}:"${o.shortDesc}"`).join(', ')}`);
    }
    
    console.log('\n✅ Data validation completed successfully!');
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

validateImportedData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });