import { PrismaClient } from '@prisma/client';
import { seedUsers } from './users';
import { seedGameSystem } from './game-system';
import { seedCharacters } from './characters';
import { seedWorldData } from './world-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Seed users and authentication data
    console.log('👤 Seeding users...');
    const users = await seedUsers(prisma);

    // Seed game system (races, classes, spells, skills)
    console.log('🎮 Seeding game system...');
    await seedGameSystem(prisma);

    // Seed test characters
    console.log('⚔️ Seeding test characters...');
    await seedCharacters(prisma, users);

    // Seed world data from JSON files
    console.log('🌍 Seeding world data...');
    await seedWorldData();

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
