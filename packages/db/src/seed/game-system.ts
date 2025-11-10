import { PrismaClient } from '@prisma/client';
import type {
  Race,
  Gender,
  Position,
  TargetScope,
  SaveType,
  TargetType,
} from '@prisma/client';

export async function seedGameSystem(prisma: PrismaClient) {
  console.log('🎮 Seeding game system data...');

  // ===========================================================================
  // RACE DATA
  // ===========================================================================

  console.log('🧬 Seeding races...');

  // Races are now enums, so no seeding is needed. This is kept for reference.

  // ===========================================================================
  // CLASS DATA
  // ===========================================================================

  console.log('⚔️ Seeding classes...');

  const classes = [
    // Base Classes
    {
      name: 'Sorcerer',
      hitDice: '1d4',
      primaryStat: 'intelligence',
      description: 'Magical base class that memorizes arcane spells.',
    },
    {
      name: 'Cleric',
      hitDice: '1d8',
      primaryStat: 'wisdom',
      description: 'Divine base class that prays for holy spells.',
    },
    {
      name: 'Warrior',
      hitDice: '1d12',
      primaryStat: 'strength',
      description: 'Combat base class focused on martial prowess.',
    },
    {
      name: 'Rogue',
      hitDice: '1d6',
      primaryStat: 'dexterity',
      description: 'Stealth base class focused on skills and subterfuge.',
    },
  ];

  for (const classData of classes) {
    await prisma.characterClass.upsert({
      where: { name: classData.name },
      update: classData,
      create: classData,
    });
  }

  // ===========================================================================
  // ABILITY SCHOOLS
  // ===========================================================================

  console.log('🏫 Seeding ability schools...');

  const abilitySchools = [
    {
      name: 'Evocation',
      description:
        'Spells that manipulate energy or tap an unseen source of power.',
    },
    {
      name: 'Necromancy',
      description:
        'Spells that manipulate, create, or destroy life or life force.',
    },
    {
      name: 'Enchantment',
      description: 'Spells that affect the minds of others.',
    },
    {
      name: 'Divination',
      description: 'Spells that reveal information.',
    },
    {
      name: 'Transmutation',
      description: 'Spells that transform the recipient physically or mentally.',
    },
    {
      name: 'Conjuration',
      description: 'Spells that bring creatures or materials to the caster.',
    },
    {
      name: 'Healing',
      description: 'Divine spells that restore health and vitality.',
    },
    {
      name: 'Protection',
      description: 'Spells that shield and defend.',
    },
  ];

  for (const school of abilitySchools) {
    await prisma.abilitySchool.upsert({
      where: { name: school.name },
      update: school,
      create: school,
    });
  }

  // ===========================================================================
  // EFFECTS
  // ===========================================================================
  console.log('💥 Seeding effects...');
  const effects = [
    {
      name: 'Damage',
      effectType: 'damage',
      defaultParams: { damage_type: 'FIRE', dice: '1d1' },
    },
    {
      name: 'Heal',
      effectType: 'heal',
      defaultParams: { dice: '1d4' },
    },
    {
      name: 'Apply Aura',
      effectType: 'apply_aura',
      defaultParams: { aura: 'DETECT_INVISIBILITY' },
    },
    {
      name: 'Teleport',
      effectType: 'teleport',
      defaultParams: { location: 'home' },
    },
  ];

  for (const effectData of effects) {
    await prisma.effect.upsert({
      where: { name: effectData.name },
      update: effectData,
      create: effectData,
    });
  }

  // ===========================================================================
  // SAMPLE ABILITIES (SPELLS)
  // ===========================================================================

  console.log('✨ Seeding sample spells...');

  const spells = [
    {
      name: 'Fireball',
      schoolName: 'Evocation',
      violent: true,
      castTimeRounds: 1,
      cooldownMs: 6000,
      minPosition: 'STANDING' as Position,
      isArea: true,
      abilityType: 'SPELL',
    },
    {
      name: 'Cure Light Wounds',
      schoolName: 'Healing',
      violent: false,
      castTimeRounds: 1,
      cooldownMs: 2000,
      minPosition: 'STANDING' as Position,
      isArea: false,
      abilityType: 'SPELL',
    },
    {
      name: 'Detect Invisibility',
      schoolName: 'Divination',
      violent: false,
      castTimeRounds: 1,
      cooldownMs: 0,
      minPosition: 'STANDING' as Position,
      isArea: false,
      abilityType: 'SPELL',
    },
    {
      name: 'Teleport',
      schoolName: 'Transmutation',
      violent: false,
      castTimeRounds: 2,
      cooldownMs: 10000,
      minPosition: 'STANDING' as Position,
      isArea: false,
      abilityType: 'SPELL',
    },
  ];

  for (const abilityData of spells) {
    const school = await prisma.abilitySchool.findFirst({
      where: { name: abilityData.schoolName },
    });

    const ability = await prisma.ability.upsert({
      where: { name: abilityData.name },
      update: {
        schoolId: school?.id,
        violent: abilityData.violent,
        castTimeRounds: abilityData.castTimeRounds,
        cooldownMs: abilityData.cooldownMs,
        minPosition: abilityData.minPosition,
        isArea: abilityData.isArea,
        abilityType: abilityData.abilityType,
      },
      create: {
        name: abilityData.name,
        schoolId: school?.id,
        violent: abilityData.violent,
        castTimeRounds: abilityData.castTimeRounds,
        cooldownMs: abilityData.cooldownMs,
        minPosition: abilityData.minPosition,
        isArea: abilityData.isArea,
        abilityType: abilityData.abilityType,
      },
    });

    // Add basic targeting for each ability
    await prisma.abilityTargeting.upsert({
      where: { abilityId: ability.id },
      update: {},
      create: {
        abilityId: ability.id,
        validTargets:
          abilityData.name === 'Fireball'
            ? ['ENEMY_PC', 'ENEMY_NPC']
            : abilityData.name === 'Cure Light Wounds'
            ? ['SELF', 'ALLY_PC', 'ALLY_NPC']
            : abilityData.name === 'Detect Invisibility'
            ? ['SELF', 'ALLY_PC', 'ALLY_NPC']
            : ['SELF'],
        scope: abilityData.isArea ? 'ROOM' : 'SINGLE',
        maxTargets: abilityData.isArea ? 10 : 1,
        range: 10, // Room range
        requireLos: false,
      },
    });

    // Add sample effects
    if (abilityData.name === 'Fireball') {
      const damageEffect = await prisma.effect.findFirst({
        where: { name: 'Damage' },
      });
      if (damageEffect) {
        await prisma.abilityEffect.upsert({
          where: {
            abilityId_effectId: {
              abilityId: ability.id,
              effectId: damageEffect.id,
            },
          },
          update: {},
          create: {
            abilityId: ability.id,
            effectId: damageEffect.id,
            overrideParams: {
              damage_type: 'FIRE',
              dice: '6d6',
              bonus: 'level',
            },
          },
        });
      }
    }
  }

  // ===========================================================================
  // CLASS-ABILITY CIRCLES
  // ===========================================================================

  console.log('🎯 Seeding class ability circles...');

  const classAbilityData = [
    {
      className: 'Sorcerer',
      abilityName: 'Detect Invisibility',
      circle: 1,
    },
    { className: 'Sorcerer', abilityName: 'Fireball', circle: 3 },
    { className: 'Sorcerer', abilityName: 'Teleport', circle: 4 },
    { className: 'Cleric', abilityName: 'Cure Light Wounds', circle: 1 },
    { className: 'Cleric', abilityName: 'Detect Invisibility', circle: 2 },
  ];

  for (const data of classAbilityData) {
    const ability = await prisma.ability.findFirst({
      where: { name: data.abilityName },
    });
    const characterClass = await prisma.characterClass.findFirst({
      where: { name: data.className },
    });

    if (ability && characterClass) {
      await prisma.classAbilities.upsert({
        where: {
          classId_abilityId: {
            classId: characterClass.id,
            abilityId: ability.id,
          },
        },
        update: { circle: data.circle },
        create: {
          classId: characterClass.id,
          abilityId: ability.id,
          circle: data.circle,
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
      tags: ['WEAPON', 'PRIMARY'],
    },
    {
      name: 'Stealth',
      description: 'The ability to move unseen and unheard',
      tags: ['UTILITY', 'SECONDARY'],
    },
    {
      name: 'Perception',
      description: 'Awareness of surroundings and hidden things',
      tags: ['UTILITY', 'SECONDARY'],
    },
    {
      name: 'First Aid',
      description: 'Basic healing and medical knowledge',
      tags: ['UTILITY', 'SECONDARY'],
    },
  ];

  for (const skillData of skills) {
    await prisma.ability.upsert({
      where: { name: skillData.name },
      update: {
        description: skillData.description,
        tags: skillData.tags,
      },
      create: {
        name: skillData.name,
        description: skillData.description,
        abilityType: 'SKILL',
        tags: skillData.tags,
      },
    });
  }

  console.log('✅ Game system seeding completed!');
}