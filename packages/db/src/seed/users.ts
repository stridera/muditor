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
      role: UserRole.BUILDER,
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
    },
  });

  console.log(
    `  ✅ Created users: ${admin.username}, ${builder.username}, ${player.username}`
  );

  return { admin, builder, player };
}
