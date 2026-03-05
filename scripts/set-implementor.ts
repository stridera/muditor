#!/usr/bin/env tsx
/**
 * Admin script to set a user to IMPLEMENTOR role
 * Usage: npx tsx scripts/set-implementor.ts <username>
 * Example: npx tsx scripts/set-implementor.ts strider
 */

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, UserRole } from '@muditor/db';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function setUserToImplementor(username: string) {
  try {
    console.log(`Looking for user: ${username}`);

    // Find the user
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      console.error(`User '${username}' not found`);
      process.exit(1);
    }

    console.log(`Found user: ${user.username} (${user.email})`);
    console.log(`Current role: ${user.role}`);

    // Update to IMPLEMENTOR role
    const updatedUser = await prisma.user.update({
      where: { username },
      data: {
        role: UserRole.IMPLEMENTOR,
      },
    });

    console.log(`Successfully updated user '${username}' to IMPLEMENTOR role`);
    console.log(`New role: ${updatedUser.role}`);
    console.log(`${username} now has full administrative privileges`);
  } catch (error) {
    console.error('Error updating user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get username from command line arguments
const username = process.argv[2];

if (!username) {
  console.error('Usage: npx tsx scripts/set-implementor.ts <username>');
  console.error('Example: npx tsx scripts/set-implementor.ts strider');
  process.exit(1);
}

// Run the script
setUserToImplementor(username);
