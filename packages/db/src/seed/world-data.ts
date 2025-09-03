import { PrismaClient } from '@prisma/client';
import { join } from 'path';
import { WorldImporter } from '../importers/world-importer';

export async function seedWorldData(prisma: PrismaClient) {
  console.log('  Loading world data from JSON files...');
  
  // Try multiple potential paths for world directory
  const possiblePaths = [
    join(process.cwd(), 'world'),
    join(process.cwd(), '../../world'),
    join(__dirname, '../../../../world'),
  ];
  
  let worldDir: string | null = null;
  for (const path of possiblePaths) {
    try {
      const fs = await import('fs');
      if (fs.existsSync(path)) {
        worldDir = path;
        break;
      }
    } catch {
      continue;
    }
  }
  
  if (!worldDir) {
    console.log('  ⚠️  World directory not found, skipping world data seeding');
    console.log('  📁 Searched paths:', possiblePaths);
    return;
  }
  
  console.log(`  📁 Using world directory: ${worldDir}`);
  
  // Create world importer
  const importer = new WorldImporter(prisma);
  
  // Import all world files
  const result = await importer.importAllWorldFiles(worldDir);
  
  if (result.success) {
    console.log('  ✅ World data seeding completed successfully!');
    
    if (result.stats) {
      console.log('     📊 Import Statistics:');
      console.log(`        Zones:      ${result.stats.zones}`);
      console.log(`        Rooms:      ${result.stats.rooms}`);
      console.log(`        Mobs:       ${result.stats.mobs}`);
      console.log(`        Objects:    ${result.stats.objects}`);
      console.log(`        Shops:      ${result.stats.shops}`);
      console.log(`        Triggers:   ${result.stats.triggers}`);
      console.log(`        Mob Resets: ${result.stats.mobResets}`);
      console.log(`        Time taken: ${(result.stats.timeTaken / 1000).toFixed(2)}s`);
    }

    if (result.errors.length > 0) {
      console.log(`     ⚠️  Import completed with ${result.errors.length} warnings`);
      // Only show first 5 warnings to keep output manageable
      const maxWarnings = 5;
      result.errors.slice(0, maxWarnings).forEach((error, index) => {
        console.log(`        ${index + 1}. ${error.path}: ${error.message}`);
      });
      if (result.errors.length > maxWarnings) {
        console.log(`        ... and ${result.errors.length - maxWarnings} more warnings`);
      }
    }
    
  } else {
    console.error('  ❌ World data seeding failed:', result.message);
    if (result.errors.length > 0) {
      console.error('     Errors:');
      result.errors.slice(0, 10).forEach(error => {
        console.error(`        - ${error.path}: ${error.message}`);
      });
    }
    throw new Error(`World data import failed: ${result.message}`);
  }
}