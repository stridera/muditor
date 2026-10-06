import type { PrismaClient } from '@muditor/db';
import * as bcrypt from 'bcrypt';

/**
 * Minimal fixtures for CI / e2e runs: the accounts `fierylib seed users`
 * creates (admin, builder, player) plus the one race and zone the API specs
 * look up. Real environments get all of this from FieryLib; this exists so the
 * Playwright specs can run against an otherwise empty database. Only invoked
 * when SEED_TEST_USERS=1 is set.
 */
const TEST_USERS = [
  {
    email: 'admin@muditor.dev',
    displayName: 'admin',
    password: 'admin123',
    role: 'IMPLEMENTOR',
  },
  {
    email: 'builder@muditor.dev',
    displayName: 'builder',
    password: 'builder123',
    role: 'BUILDER',
  },
  {
    email: 'player@muditor.dev',
    displayName: 'testplayer',
    password: 'player123',
    role: 'PLAYER',
  },
] as const;

export async function seedTestUsers(prisma: PrismaClient): Promise<void> {
  for (const u of TEST_USERS) {
    const passwordHash = await bcrypt.hash(u.password, 12);
    await prisma.users.upsert({
      where: { email: u.email },
      update: { passwordHash, role: u.role },
      create: {
        id: crypto.randomUUID(),
        email: u.email,
        displayName: u.displayName,
        passwordHash,
        role: u.role,
      },
    });
    console.log(`   Seeded test user ${u.email} (${u.role}) ✓`);
  }
}

export async function seedTestWorld(prisma: PrismaClient): Promise<void> {
  await prisma.races.upsert({
    where: { race: 'HUMAN' },
    update: {},
    create: {
      race: 'HUMAN',
      name: 'Human',
      plainName: 'Human',
      keywords: 'human',
      playable: true,
      humanoid: true,
    },
  });
  console.log('   Seeded test race HUMAN ✓');

  await prisma.zones.upsert({
    where: { id: 30 },
    update: {},
    create: { id: 30, name: 'Test Zone' },
  });
  console.log('   Seeded test zone 30 ✓');
}
