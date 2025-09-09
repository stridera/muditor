#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client';
import { readdirSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

async function checkMissingZones() {
  console.log('🔍 Checking for missing zones...\n');

  // Get all zone files
  const worldDir = join(process.cwd(), 'world');
  const zoneFiles = readdirSync(worldDir)
    .filter(file => file.endsWith('.json'))
    .map(file => parseInt(file.replace('.json', '')))
    .filter(num => !isNaN(num))
    .sort((a, b) => a - b);

  console.log(
    `📁 Found ${zoneFiles.length} zone files (${Math.min(...zoneFiles)} - ${Math.max(...zoneFiles)})`
  );

  // Get all zones from database
  const dbZones = await prisma.zone.findMany({
    select: { id: true },
    orderBy: { id: 'asc' },
  });

  console.log(`🗄️  Found ${dbZones.length} zones in database\n`);

  // Find missing zones
  const dbZoneIds = new Set(dbZones.map(z => z.id));
  const missingZones = zoneFiles.filter(id => !dbZoneIds.has(id));

  if (missingZones.length > 0) {
    console.log(`❌ Missing zones from database:`);
    missingZones.forEach(id => {
      console.log(`   Zone ${id} (file: world/${id}.json)`);
    });
  } else {
    console.log('✅ All zone files are imported to database');
  }

  // Find extra zones in database (shouldn't happen but good to check)
  const fileZoneIds = new Set(zoneFiles);
  const extraZones = dbZones.filter(z => !fileZoneIds.has(z.id));

  if (extraZones.length > 0) {
    console.log(`\n⚠️  Extra zones in database (no corresponding files):`);
    extraZones.forEach(zone => {
      console.log(`   Zone ${zone.id}`);
    });
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Zone files: ${zoneFiles.length}`);
  console.log(`   DB zones: ${dbZones.length}`);
  console.log(`   Missing: ${missingZones.length}`);
  console.log(`   Extra: ${extraZones.length}`);

  await prisma.$disconnect();
}

checkMissingZones().catch(console.error);
