import type { PrismaClient } from '@muditor/db';
import * as bcrypt from 'bcrypt';

/**
 * Minimal account fixtures for CI / e2e runs (mirrors `fierylib seed users`
 * accounts: admin, builder, player). Real environments get their users from
 * FieryLib; this exists so the Playwright specs can log in against an
 * otherwise empty database. Only runs when SEED_TEST_USERS=1 is set.
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
