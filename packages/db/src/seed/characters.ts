import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

interface UserData {
  id: string;
  username: string;
  email: string;
  role: string;
}

export async function seedCharacters(
  prisma: PrismaClient,
  users: { admin: UserData; builder: UserData; player: UserData }
) {
  console.log('  Creating test characters...');

  // Get class data (races are now enums)
  const mageClass = await prisma.characterClass.findFirst({
    where: { name: 'Sorcerer' },
  });

  if (!mageClass) {
    console.log(
      '  ⚠️ Skipping character creation - class data not found'
    );
    return;
  }

  // Create god character for admin user
  const godCharacter = await prisma.characters.upsert({
    where: { name: 'GodAdmin' },
    update: {
      userId: users.admin.id,
      level: 110, // Max god level
      race: 'HUMAN',
      classId: mageClass.id,
      raceType: 'Human',
      playerClass: 'Sorcerer',
      // God-level stats
      strength: 25,
      intelligence: 25,
      wisdom: 25,
      dexterity: 25,
      constitution: 25,
      charisma: 25,
      luck: 25,
      // Max health and movement
      hitPoints: 9999,
      hitPointsMax: 9999,
      movement: 9999,
      movementMax: 9999,
      // Wealth
      copper: 0,
      silver: 0,
      gold: 100000,
      platinum: 10000,
      // Description
      description:
        'A powerful god character for testing and administration purposes.',
      title: 'the Almighty Administrator',
      // Set character password for testing
      passwordHash: await bcrypt.hash('godpass123', 12),
    },
    create: {
      id: crypto.randomUUID(),
      name: 'GodAdmin',
      userId: users.admin.id,
      level: 110,
      race: 'HUMAN',
      classId: mageClass.id,
      raceType: 'Human',
      playerClass: 'Sorcerer',
      strength: 25,
      intelligence: 25,
      wisdom: 25,
      dexterity: 25,
      constitution: 25,
      charisma: 25,
      luck: 25,
      hitPoints: 9999,
      hitPointsMax: 9999,
      movement: 9999,
      movementMax: 9999,
      copper: 0,
      silver: 0,
      gold: 100000,
      platinum: 10000,
      description:
        'A powerful god character for testing and administration purposes.',
      title: 'the Almighty Administrator',
      passwordHash: await bcrypt.hash('godpass123', 12),
    },
  });

  // Create builder character for builder user
  const builderCharacter = await prisma.characters.upsert({
    where: { name: 'BuilderChar' },
    update: {
      userId: users.builder.id,
      level: 50,
      race: 'HUMAN',
      classId: mageClass.id,
      raceType: 'Human',
      playerClass: 'Sorcerer',
      strength: 18,
      intelligence: 20,
      wisdom: 18,
      dexterity: 16,
      constitution: 17,
      charisma: 15,
      luck: 16,
      hitPoints: 500,
      hitPointsMax: 500,
      movement: 500,
      movementMax: 500,
      copper: 0,
      silver: 0,
      gold: 10000,
      platinum: 100,
      description: 'A builder character for zone creation and testing.',
      title: 'the Master Builder',
      passwordHash: await bcrypt.hash('buildpass123', 12),
    },
    create: {
      id: crypto.randomUUID(),
      name: 'BuilderChar',
      userId: users.builder.id,
      level: 50,
      race: 'HUMAN',
      classId: mageClass.id,
      raceType: 'Human',
      playerClass: 'Sorcerer',
      strength: 18,
      intelligence: 20,
      wisdom: 18,
      dexterity: 16,
      constitution: 17,
      charisma: 15,
      luck: 16,
      hitPoints: 500,
      hitPointsMax: 500,
      movement: 500,
      movementMax: 500,
      copper: 0,
      silver: 0,
      gold: 10000,
      platinum: 100,
      description: 'A builder character for zone creation and testing.',
      title: 'the Master Builder',
      passwordHash: await bcrypt.hash('buildpass123', 12),
    },
  });

  // Create test player character for player user
  const playerCharacter = await prisma.characters.upsert({
    where: { name: 'TestPlayer' },
    update: {
      userId: users.player.id,
      level: 1,
      race: 'HUMAN',
      classId: mageClass.id,
      raceType: 'Human',
      playerClass: 'Sorcerer',
      strength: 13,
      intelligence: 15,
      wisdom: 12,
      dexterity: 14,
      constitution: 13,
      charisma: 11,
      luck: 13,
      hitPoints: 20,
      hitPointsMax: 20,
      movement: 100,
      movementMax: 100,
      copper: 100,
      silver: 10,
      gold: 1,
      platinum: 0,
      description: 'A new player character for testing basic gameplay.',
      title: 'the Novice',
      passwordHash: await bcrypt.hash('testpass123', 12),
    },
    create: {
      id: crypto.randomUUID(),
      name: 'TestPlayer',
      userId: users.player.id,
      level: 1,
      race: 'HUMAN',
      classId: mageClass.id,
      raceType: 'Human',
      playerClass: 'Sorcerer',
      strength: 13,
      intelligence: 15,
      wisdom: 12,
      dexterity: 14,
      constitution: 13,
      charisma: 11,
      luck: 13,
      hitPoints: 20,
      hitPointsMax: 20,
      movement: 100,
      movementMax: 100,
      copper: 100,
      silver: 10,
      gold: 1,
      platinum: 0,
      description: 'A new player character for testing basic gameplay.',
      title: 'the Novice',
      passwordHash: await bcrypt.hash('testpass123', 12),
    },
  });

  console.log(
    `  ✅ Created characters: ${godCharacter.name}, ${builderCharacter.name}, ${playerCharacter.name}`
  );
  console.log(
    `  🎮 Character passwords: godpass123, buildpass123, testpass123`
  );

  return { godCharacter, builderCharacter, playerCharacter };
}
