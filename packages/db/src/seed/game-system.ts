import { PrismaClient } from '@prisma/client';
import type { 
  Race, Gender, Position, 
  SkillType, SkillCategory,
  TargetScope, SpellRange, SaveType, SaveResult, EffectType
} from '@prisma/client';

export async function seedGameSystem(prisma: PrismaClient) {
  console.log('🎮 Seeding game system data...');

  // ===========================================================================
  // RACE DATA
  // ===========================================================================
  
  console.log('🧬 Seeding races...');
  
  // Complete race data from FieryMUD legacy system
  const races = [
    // Playable Good Races
    { name: 'Human', size: 'MEDIUM' as const, lifespan: 80, description: 'Versatile and adaptable, humans are the most common race.' },
    { name: 'Elf', size: 'MEDIUM' as const, lifespan: 500, description: 'Graceful magical beings with infravision and slashing expertise.' },
    { name: 'Gnome', size: 'SMALL' as const, lifespan: 120, description: 'Small folk with infravision, skilled in crafts and knowledge.' },
    { name: 'Dwarf', size: 'MEDIUM' as const, lifespan: 150, description: 'Hardy mountain dwellers with detect poison, infravision, and ultravision.' },
    { name: 'Half-Elf', size: 'MEDIUM' as const, lifespan: 200, description: 'Mixed heritage combining human versatility with elven grace.' },
    { name: 'Barbarian', size: 'LARGE' as const, lifespan: 70, description: 'Powerful nomadic warriors with door bashing and bodyslam abilities.' },
    { name: 'Halfling', size: 'SMALL' as const, lifespan: 100, description: 'Small folk with infravision and sense life abilities.' },
    { name: 'Nymph', size: 'MEDIUM' as const, lifespan: 300, description: 'Nature spirits of exceptional beauty and grace.' },
    
    // Dragonborn Variants
    { name: 'Dragonborn Fire', size: 'MEDIUM' as const, lifespan: 120, description: 'Dragon-descended with fire breath and infravision.' },
    { name: 'Dragonborn Frost', size: 'MEDIUM' as const, lifespan: 120, description: 'Dragon-descended with frost breath and infravision.' },
    { name: 'Dragonborn Acid', size: 'MEDIUM' as const, lifespan: 120, description: 'Dragon-descended with acid breath and infravision.' },
    { name: 'Dragonborn Lightning', size: 'MEDIUM' as const, lifespan: 120, description: 'Dragon-descended with lightning breath and infravision.' },
    { name: 'Dragonborn Gas', size: 'MEDIUM' as const, lifespan: 120, description: 'Dragon-descended with gas breath and infravision.' },
    
    // Faerie Types
    { name: 'Faerie Seelie', size: 'TINY' as const, lifespan: 400, description: 'Good-aligned tiny faeries with natural flight ability.' },
    { name: 'Faerie Unseelie', size: 'TINY' as const, lifespan: 400, description: 'Evil-aligned tiny faeries with natural flight ability.' },
    
    // Evil Playable Races
    { name: 'Troll', size: 'LARGE' as const, lifespan: 200, description: 'Large regenerating beings with infravision and combat abilities.' },
    { name: 'Drow', size: 'MEDIUM' as const, lifespan: 400, description: 'Dark elves with infravision, ultravision, and slashing expertise.' },
    { name: 'Duergar', size: 'MEDIUM' as const, lifespan: 180, description: 'Gray dwarves with infravision and ultravision.' },
    { name: 'Ogre', size: 'LARGE' as const, lifespan: 100, description: 'Large brutish humanoids with combat abilities.' },
    { name: 'Orc', size: 'MEDIUM' as const, lifespan: 60, description: 'Savage humanoids bred for war and conflict.' },
    { name: 'Sverfneblin', size: 'SMALL' as const, lifespan: 200, description: 'Deep gnomes with infravision and ultravision.' },
    
    // NPC/Builder Races
    { name: 'Animal', size: 'MEDIUM' as const, lifespan: 20, description: 'Non-humanoid creatures of various types.' },
    { name: 'Plant', size: 'MEDIUM' as const, lifespan: 100, description: 'Sentient plant creatures.' },
    { name: 'Humanoid', size: 'MEDIUM' as const, lifespan: 80, description: 'Generic humanoid template.' },
    { name: 'Giant', size: 'LARGE' as const, lifespan: 300, description: 'Large humanoid giants.' },
    { name: 'Dragon General', size: 'GARGANTUAN' as const, lifespan: 2000, description: 'Powerful ancient dragons with flight and breath weapons.' },
    { name: 'Dragon Fire', size: 'GARGANTUAN' as const, lifespan: 2000, description: 'Fire dragons with flame breath and flight.' },
    { name: 'Dragon Frost', size: 'GARGANTUAN' as const, lifespan: 2000, description: 'Frost dragons with ice breath and flight.' },
    { name: 'Dragon Acid', size: 'GARGANTUAN' as const, lifespan: 2000, description: 'Acid dragons with corrosive breath and flight.' },
    { name: 'Dragon Lightning', size: 'GARGANTUAN' as const, lifespan: 2000, description: 'Lightning dragons with electric breath and flight.' },
    { name: 'Dragon Gas', size: 'GARGANTUAN' as const, lifespan: 2000, description: 'Gas dragons with poisonous breath and flight.' },
    { name: 'Brownie', size: 'SMALL' as const, lifespan: 150, description: 'Small household spirits with infravision.' },
    { name: 'Other', size: 'MEDIUM' as const, lifespan: 50, description: 'Miscellaneous creatures not fitting other categories.' },
  ];

  // Races are now handled as enums directly on Character/Mob models
  // No need to seed race data as it's defined in the schema

  // ===========================================================================
  // CLASS DATA
  // ===========================================================================
  
  console.log('⚔️ Seeding classes...');
  
  // Complete class data from FieryMUD legacy system
  const classes = [
    // Base Classes
    { name: 'Sorcerer', hitDice: '1d4', primaryStat: 'intelligence', description: 'Magical base class that memorizes arcane spells.' },
    { name: 'Cleric', hitDice: '1d8', primaryStat: 'wisdom', description: 'Divine base class that prays for holy spells.' },
    { name: 'Warrior', hitDice: '1d12', primaryStat: 'strength', description: 'Combat base class focused on martial prowess.' },
    { name: 'Rogue', hitDice: '1d6', primaryStat: 'dexterity', description: 'Stealth base class focused on skills and subterfuge.' },
    
    // Sorcerer Subclasses
    { name: 'Cryomancer', hitDice: '1d4', primaryStat: 'intelligence', description: 'Sorcerer specializing in frost and ice magic.' },
    { name: 'Illusionist', hitDice: '1d4', primaryStat: 'intelligence', description: 'Sorcerer specializing in illusion and deception magic.' },
    { name: 'Necromancer', hitDice: '1d4', primaryStat: 'intelligence', description: 'Sorcerer specializing in death and undeath magic.' },
    { name: 'Pyromancer', hitDice: '1d4', primaryStat: 'intelligence', description: 'Sorcerer specializing in fire and heat magic.' },
    { name: 'Conjurer', hitDice: '1d4', primaryStat: 'intelligence', description: 'Sorcerer specializing in summoning magic (NPC only).' },
    
    // Cleric Subclasses
    { name: 'Diabolist', hitDice: '1d8', primaryStat: 'wisdom', description: 'Evil cleric with detect alignment abilities.' },
    { name: 'Druid', hitDice: '1d8', primaryStat: 'wisdom', description: 'Nature-focused cleric with natural magic.' },
    { name: 'Priest', hitDice: '1d8', primaryStat: 'wisdom', description: 'Traditional cleric with detect alignment abilities.' },
    { name: 'Mystic', hitDice: '1d8', primaryStat: 'wisdom', description: 'Mystical cleric subclass (NPC only).' },
    
    // Warrior Subclasses
    { name: 'Anti-Paladin', hitDice: '1d12', primaryStat: 'strength', description: 'Evil holy warrior with detect alignment and protect good.' },
    { name: 'Monk', hitDice: '1d10', primaryStat: 'dexterity', description: 'Unarmed combat specialist with discipline focus.' },
    { name: 'Paladin', hitDice: '1d12', primaryStat: 'strength', description: 'Holy warrior with detect alignment and protect evil.' },
    { name: 'Ranger', hitDice: '1d10', primaryStat: 'dexterity', description: 'Nature warrior with farsee and limited magic.' },
    { name: 'Berserker', hitDice: '1d12', primaryStat: 'strength', description: 'Rage-focused warrior (NPC only).' },
    
    // Rogue Subclasses  
    { name: 'Assassin', hitDice: '1d6', primaryStat: 'dexterity', description: 'Deadly stealth specialist focused on elimination.' },
    { name: 'Bard', hitDice: '1d6', primaryStat: 'charisma', description: 'Musical rogue with magical abilities.' },
    { name: 'Hunter', hitDice: '1d8', primaryStat: 'dexterity', description: 'Tracking and survival specialist.' },
    { name: 'Mercenary', hitDice: '1d8', primaryStat: 'strength', description: 'Combat-focused rogue for hire.' },
    { name: 'Thief', hitDice: '1d6', primaryStat: 'dexterity', description: 'Classic stealth and theft specialist.' },
    
    // Special Classes
    { name: 'Shaman', hitDice: '1d8', primaryStat: 'wisdom', description: 'Tribal magic user (NPC base class).' },
    { name: 'Layman', hitDice: '1d8', primaryStat: 'strength', description: 'Common person class for NPCs.' },
  ];

  for (const classData of classes) {
    await prisma.class.upsert({
      where: { name: classData.name },
      update: classData,
      create: classData,
    });
  }

  // ===========================================================================
  // SPELL SCHOOLS
  // ===========================================================================
  
  console.log('🏫 Seeding spell schools...');
  
  const spellSchools = [
    { name: 'Evocation', description: 'Spells that manipulate energy or tap an unseen source of power.' },
    { name: 'Necromancy', description: 'Spells that manipulate, create, or destroy life or life force.' },
    { name: 'Enchantment', description: 'Spells that affect the minds of others.' },
    { name: 'Divination', description: 'Spells that reveal information.' },
    { name: 'Transmutation', description: 'Spells that transform the recipient physically or mentally.' },
    { name: 'Conjuration', description: 'Spells that bring creatures or materials to the caster.' },
    { name: 'Healing', description: 'Divine spells that restore health and vitality.' },
    { name: 'Protection', description: 'Spells that shield and defend.' },
  ];

  for (const school of spellSchools) {
    await prisma.spellSchool.upsert({
      where: { name: school.name },
      update: school,
      create: school,
    });
  }

  // ===========================================================================
  // SAMPLE SPELLS (Based on FieryMUD LEGACY_SPELLS.md)
  // ===========================================================================
  
  console.log('✨ Seeding sample spells...');
  
  const spells = [
    {
      name: 'Fireball',
      school: 'Evocation',
      violent: true,
      castTimeRounds: 1,
      cooldownMs: 6000,
      minPosition: 'STANDING' as Position,
      isArea: true,
    },
    {
      name: 'Cure Light Wounds',
      school: 'Healing',
      violent: false,
      castTimeRounds: 1,
      cooldownMs: 2000,
      minPosition: 'STANDING' as Position,
      isArea: false,
    },
    {
      name: 'Detect Invisibility',
      school: 'Divination',
      violent: false,
      castTimeRounds: 1,
      cooldownMs: 0,
      minPosition: 'STANDING' as Position,
      isArea: false,
    },
    {
      name: 'Teleport',
      school: 'Transmutation',
      violent: false,
      castTimeRounds: 2,
      cooldownMs: 10000,
      minPosition: 'STANDING' as Position,
      isArea: false,
    },
  ];

  for (const spellData of spells) {
    const school = await prisma.spellSchool.findFirst({
      where: { name: spellData.school }
    });
    
    const spell = await prisma.spell.upsert({
      where: { name: spellData.name },
      update: {
        schoolId: school?.id,
        violent: spellData.violent,
        castTimeRounds: spellData.castTimeRounds,
        cooldownMs: spellData.cooldownMs,
        minPosition: spellData.minPosition,
        isArea: spellData.isArea,
      },
      create: {
        name: spellData.name,
        schoolId: school?.id,
        violent: spellData.violent,
        castTimeRounds: spellData.castTimeRounds,
        cooldownMs: spellData.cooldownMs,
        minPosition: spellData.minPosition,
        isArea: spellData.isArea,
      },
    });

    // Add basic targeting for each spell
    await prisma.spellTargeting.upsert({
      where: { spellId: spell.id },
      update: {},
      create: {
        spellId: spell.id,
        // Simple bitmask values (will need proper constants later)
        allowedTargetsMask: spellData.name === 'Fireball' ? 4 : // enemy
                            spellData.name === 'Cure Light Wounds' ? 3 : // self+ally
                            spellData.name === 'Detect Invisibility' ? 3 : // self+ally
                            1, // self only (Teleport)
        targetScope: spellData.isArea ? 'ROOM' as TargetScope : 'SINGLE' as TargetScope,
        maxTargets: spellData.isArea ? 10 : 1,
        range: 'ROOM' as SpellRange,
        requireLos: false,
      },
    });

    // Add sample effects based on FieryMUD system
    if (spellData.name === 'Fireball') {
      await prisma.spellEffect.upsert({
        where: { id: spell.id * 100 }, // Unique ID approach
        update: {},
        create: {
          spellId: spell.id,
          effectType: 'DAMAGE' as EffectType,
          order: 0,
          chancePct: 100,
          params: {
            damage_type_id: 1, // Fire damage
            dice: '6d6',
            bonus: 'level',
            cap: '12d6',
            splash_pct: 0
          },
        },
      });
    }
  }

  // ===========================================================================
  // CLASS-SPELL CIRCLES (Based on FieryMUD circle system)
  // ===========================================================================
  
  console.log('🎯 Seeding class spell circles...');
  
  const classSpellData = [
    // Mage spells
    { className: 'Mage', spellName: 'Detect Invisibility', circle: 1, minLevel: 1 },
    { className: 'Mage', spellName: 'Fireball', circle: 3, minLevel: 5 },
    { className: 'Mage', spellName: 'Teleport', circle: 4, minLevel: 7 },
    
    // Cleric spells
    { className: 'Cleric', spellName: 'Cure Light Wounds', circle: 1, minLevel: 1 },
    { className: 'Cleric', spellName: 'Detect Invisibility', circle: 2, minLevel: 3 },
    
    // Ranger spells (limited)
    { className: 'Ranger', spellName: 'Cure Light Wounds', circle: 2, minLevel: 4 },
  ];

  for (const data of classSpellData) {
    const spell = await prisma.spell.findFirst({ where: { name: data.spellName } });
    const spellClass = await prisma.class.findFirst({ where: { name: data.className } });
    
    if (spell && spellClass) {
      await prisma.spellClassCircle.upsert({
        where: { 
          spellId_classId: { 
            spellId: spell.id, 
            classId: spellClass.id 
          } 
        },
        update: {
          circle: data.circle,
          minLevel: data.minLevel,
        },
        create: {
          spellId: spell.id,
          classId: spellClass.id,
          circle: data.circle,
          minLevel: data.minLevel,
        },
      });
    }
  }

  // ===========================================================================
  // SKILLS SYSTEM
  // ===========================================================================
  
  console.log('🛠️ Seeding skills...');
  
  const skills = [
    {
      name: 'Sword Mastery',
      description: 'Expertise with sword weapons',
      type: 'WEAPON' as SkillType,
      category: 'PRIMARY' as SkillCategory,
      maxLevel: 100,
    },
    {
      name: 'Stealth',
      description: 'The ability to move unseen and unheard',
      type: 'UTILITY' as SkillType,
      category: 'SECONDARY' as SkillCategory,
      maxLevel: 100,
    },
    {
      name: 'Perception',
      description: 'Awareness of surroundings and hidden things',
      type: 'UTILITY' as SkillType,
      category: 'SECONDARY' as SkillCategory,
      maxLevel: 100,
    },
    {
      name: 'First Aid',
      description: 'Basic healing and medical knowledge',
      type: 'UTILITY' as SkillType,
      category: 'SECONDARY' as SkillCategory,
      maxLevel: 75,
    },
  ];

  for (const skillData of skills) {
    await prisma.skill.upsert({
      where: { name: skillData.name },
      update: skillData,
      create: skillData,
    });
  }

  // ===========================================================================
  // UPDATE EXISTING CHARACTERS WITH NEW RACE/CLASS SYSTEM
  // ===========================================================================
  
  console.log('🔄 Updating existing characters with new race/class relationships...');
  
  // Update Gandalf to use Human race and Mage class (closest to Sorcerer)
  const mageClass = await prisma.class.findFirst({ where: { name: 'Mage' } });
  
  if (mageClass) {
    await prisma.character.updateMany({
      where: { name: 'Gandalf' },
      data: { 
        race: 'HUMAN',
        classId: mageClass.id 
      },
    });
  }
  
  // Update Legolas to use Elf race and Ranger class
  const rangerClass = await prisma.class.findFirst({ where: { name: 'Ranger' } });
  
  if (rangerClass) {
    await prisma.character.updateMany({
      where: { name: 'Legolas' },
      data: { 
        race: 'ELF',
        classId: rangerClass.id 
      },
    });
  }

  console.log('✅ Game system seeding completed!');
}