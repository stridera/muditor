import { PrismaClient } from '@prisma/client';
import { seedGameSystem } from './game-system';
import { seedCharacters } from './characters';

const prisma = new PrismaClient();

/**
 * Game System Seeding
 *
 * This script seeds ONLY game system data (races, classes, spells, skills).
 * All other seeding has moved to FieryLib for consistency.
 *
 * For world data and user accounts, use FieryLib:
 *   cd ../../fierylib
 *   poetry run fierylib import-legacy --with-users
 *   poetry run fierylib layout generate
 */
async function main() {
  console.log('');
  console.log('═'.repeat(60));
  console.log('🎮 MUDITOR GAME SYSTEM SEEDING');
  console.log('═'.repeat(60));
  console.log('');
  console.log('This script seeds:');
  console.log('  ✅ Game system data (races, classes, spells, skills)');
  console.log('  ✅ Test characters (if users exist)');
  console.log('');
  console.log('For world data and users, use FieryLib:');
  console.log('  cd ../../fierylib');
  console.log('  poetry run fierylib import-legacy --with-users');
  console.log('');
  console.log('═'.repeat(60));
  console.log('');

  try {
    // Check if users exist
    console.log('👤 Checking for users...');
    const userCount = await prisma.users.count();

    if (userCount === 0) {
      console.log('⚠️  No users found. Please run FieryLib to seed users first:');
      console.log('   cd ../../fierylib');
      console.log('   poetry run fierylib seed users');
      console.log('');
      console.log('   Or import with users:');
      console.log('   poetry run fierylib import-legacy --with-users');
      return;
    }
    console.log(`   Found ${userCount} user(s) ✓`);

    // Seed game system (races, classes, spells, skills)
    console.log('');
    console.log('🎮 Seeding game system...');
    await seedGameSystem(prisma);

    // Seed test characters
    console.log('');
    console.log('⚔️ Seeding test characters...');
    const users = {
      admin: await prisma.users.findUnique({ where: { email: 'admin@muditor.dev' } }),
      builder: await prisma.users.findUnique({ where: { email: 'builder@muditor.dev' } }),
      player: await prisma.users.findUnique({ where: { email: 'player@muditor.dev' } }),
    };
    await seedCharacters(prisma, users as any);

    console.log('');
    console.log('✅ Game system seeding completed!');
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
