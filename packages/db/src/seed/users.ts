import { PrismaClient, UserRole, Race } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedUsers(prisma: PrismaClient) {
  console.log('  Creating default users...');
  
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@muditor.dev' },
    update: {},
    create: {
      email: 'admin@muditor.dev',
      username: 'admin',
      passwordHash: adminPassword,
      role: UserRole.GOD,
      godLevel: 100,
    },
  });
  
  // Create builder user
  const builderPassword = await bcrypt.hash('builder123', 12);
  const builder = await prisma.user.upsert({
    where: { email: 'builder@muditor.dev' },
    update: {},
    create: {
      email: 'builder@muditor.dev',
      username: 'builder',
      passwordHash: builderPassword,
      role: UserRole.IMMORTAL,
      godLevel: 50,
    },
  });
  
  // Create test player
  const playerPassword = await bcrypt.hash('player123', 12);
  const player = await prisma.user.upsert({
    where: { email: 'player@muditor.dev' },
    update: {},
    create: {
      email: 'player@muditor.dev',
      username: 'testplayer',
      passwordHash: playerPassword,
      role: UserRole.PLAYER,
      godLevel: 0,
    },
  });
  
  console.log(`  ✅ Created users: ${admin.username}, ${builder.username}, ${player.username}`);
  
  // Create some test characters (will set race/class after game system is seeded)
  await prisma.character.upsert({
    where: { name: 'Gandalf' },
    update: {},
    create: {
      name: 'Gandalf',
      userId: admin.id,
      level: 50,
      raceLegacy: Race.HUMAN, // Legacy field for transition
      alignment: 900,
      strength: 18,
      intelligence: 25,
      wisdom: 22,
      dexterity: 16,
      constitution: 20,
      charisma: 20,
      gold: 10000,
    },
  });
  
  await prisma.character.upsert({
    where: { name: 'Legolas' },
    update: {},
    create: {
      name: 'Legolas',
      userId: builder.id,
      level: 25,
      raceLegacy: Race.ELF, // Legacy field for transition
      alignment: 500,
      strength: 16,
      intelligence: 18,
      wisdom: 20,
      dexterity: 22,
      constitution: 16,
      charisma: 18,
      gold: 5000,
    },
  });
  
  console.log('  ✅ Created test characters');
}