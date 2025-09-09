#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client';
import { WorldImporter } from '../packages/db/src/importers/world-importer';
import { join } from 'path';

const prisma = new PrismaClient();

async function reimportMissingZones() {
  console.log('🔄 Reimporting missing zones...\n');

  const missingZones = [590, 615, 625];
  const importer = new WorldImporter(prisma);

  for (const zoneId of missingZones) {
    console.log(`⚠️  Importing zone ${zoneId}...`);

    try {
      const filePath = join(process.cwd(), 'world', `${zoneId}.json`);
      const result = await importer.importWorldFile(filePath);

      if (result.success && result.stats) {
        console.log(`✅ Successfully imported zone ${zoneId}`);
        console.log(`   - Rooms: ${result.stats.rooms}`);
        console.log(`   - Mobs: ${result.stats.mobs}`);
        console.log(`   - Objects: ${result.stats.objects}`);
        console.log(`   - Shops: ${result.stats.shops}\n`);
      } else {
        console.error(`❌ Failed to import zone ${zoneId}:`, result.message);
        if (result.errors.length > 0) {
          console.error(
            '   Errors:',
            result.errors.slice(0, 3).map(e => e.message)
          );
        }
        console.log('');
      }
    } catch (error) {
      console.error(`❌ Failed to import zone ${zoneId}:`, error);
      console.log('');
    }
  }

  // Check final count
  const finalCount = await prisma.zone.count();
  console.log(`📊 Final zone count: ${finalCount}`);

  await prisma.$disconnect();
}

reimportMissingZones().catch(console.error);
