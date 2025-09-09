import { PrismaClient } from '@prisma/client';
import { join } from 'path';
import { promises as fs } from 'fs';
import { WorldImporter } from '../importers/world-importer';

export async function seedWorldData() {
  console.log('🌍 Seeding world data...');

  const possiblePaths = [
    '/home/strider/Code/muditor/world',
    './world',
    '../world',
    '../../world',
  ];

  let worldPath: string | null = null;
  for (const path of possiblePaths) {
    console.log(`  Checking path: ${path}`);
    try {
      const stats = await fs.stat(path);
      console.log(`  Path ${path} exists, isDirectory: ${stats.isDirectory()}`);
      if (stats.isDirectory()) {
        worldPath = path;
        break;
      }
    } catch (error) {
      console.log(
        `  Path ${path} failed: ${error instanceof Error ? error.message : String(error)}`
      );
      // Path doesn't exist, continue checking
    }
  }

  if (!worldPath) {
    console.log(
      '❌ Could not find world directory in any of the expected locations:',
      possiblePaths
    );
    return;
  }

  console.log(`  📁 Using world directory: ${worldPath}`);

  // Create Prisma client and pass it to WorldImporter
  const prisma = new PrismaClient();
  const worldImporter = new WorldImporter(prisma);

  try {
    await worldImporter.importAllWorldFiles(worldPath);
  } finally {
    await prisma.$disconnect();
  }
}
