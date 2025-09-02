import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { WorldFileParser } from './parsers/world-file-parser';

export async function seedWorldData(prisma: PrismaClient) {
  console.log('  Loading world data from JSON files...');
  
  const worldDir = path.join(process.cwd(), '../../world');
  const parser = new WorldFileParser(prisma);
  
  if (!fs.existsSync(worldDir)) {
    console.log('  ⚠️  World directory not found, skipping world data seeding');
    return;
  }
  
  const worldFiles = fs.readdirSync(worldDir)
    .filter(file => file.endsWith('.json'))
    .sort((a, b) => {
      // Sort numerically by zone ID
      const aNum = parseInt(path.parse(a).name);
      const bNum = parseInt(path.parse(b).name);
      return aNum - bNum;
    });
  
  console.log(`  📁 Found ${worldFiles.length} world files`);
  
  let processedZones = 0;
  let processedRooms = 0;
  let processedMobs = 0;
  let processedObjects = 0;
  let processedShops = 0;
  let processedTriggers = 0;
  
  for (const file of worldFiles) {
    try {
      const filePath = path.join(worldDir, file);
      const zoneId = parseInt(path.parse(file).name);
      
      // Handle special case: Zone 0 becomes Zone 1000
      const actualZoneId = zoneId === 0 ? 1000 : zoneId;
      
      console.log(`  🔄 Processing zone ${zoneId} (stored as ${actualZoneId})...`);
      
      const worldData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const result = await parser.parseWorldFile(worldData, actualZoneId);
      
      processedZones += result.zonesCreated;
      processedRooms += result.roomsCreated;
      processedMobs += result.mobsCreated;
      processedObjects += result.objectsCreated;
      processedShops += result.shopsCreated;
      processedTriggers += result.triggersCreated;
      
    } catch (error) {
      console.error(`  ❌ Error processing ${file}:`, error);
      // Continue with other files
    }
  }
  
  console.log('  ✅ World data seeding completed:');
  console.log(`     📦 Zones: ${processedZones}`);
  console.log(`     🏠 Rooms: ${processedRooms}`);
  console.log(`     🤖 Mobs: ${processedMobs}`);
  console.log(`     📦 Objects: ${processedObjects}`);
  console.log(`     🏪 Shops: ${processedShops}`);
  console.log(`     📜 Triggers: ${processedTriggers}`);
}