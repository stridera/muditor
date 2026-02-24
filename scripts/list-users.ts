#!/usr/bin/env tsx
/**
 * List all users in the database
 * Usage: npx tsx scripts/list-users.ts
 */

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@muditor/db';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function listUsers() {
  try {
    console.log('📋 Fetching all users...');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (users.length === 0) {
      console.log('👤 No users found in the database');
      return;
    }

    console.log(`\n👥 Found ${users.length} user(s):\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.email})`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   👑 Role: ${user.role}`);
      console.log(`   📅 Created: ${user.createdAt.toLocaleDateString()}`);
      console.log('   ─────────────────────────────────');
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
listUsers();
