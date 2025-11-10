# Implementation Plan: Character-Based User Role System & Admin Interfaces

**Date**: 2025-01-04
**Status**: Planning Phase

## Overview

Integrate character/class/race/spell/skill data into muditor with character-based role calculation and comprehensive admin management interfaces.

---

## User Requirements Summary

### Role Calculation

- **User role** = Max level of all linked characters
- **Role Mapping**:
  - Level <100 → `PLAYER` (Mortal)
  - Level 100 → `IMMORTAL`
  - Level 101-102 → `BUILDER` (Gods/Builders)
  - Level 103 → `HEAD_BUILDER` (Head Builder)
  - Level 104 → `CODER` (Head Coder)
  - Level 105+ → `GOD` (Overlord)

### Role Update Timing

- **Immediate**: Role updates as soon as character is linked/unlinked
- Real-time permission changes in UI

### Admin Permissions

- **Game System Management** (Spells, Skills, Classes, Races):
  - **CODER (104+)**: Create new entities (requires FieryMUD code changes to function)
  - **HEAD_BUILDER (103+)**: Edit/delete existing entities and manage associations
  - **GOD (105+)**: Unrestricted access including reset operations
- **Zone-Based Access** (Zones, Rooms, Mobs, Objects, Shops):
  - **BUILDER (101-102)**: Access to zones granted via `UserGrants` table
  - **HEAD_BUILDER (103+)**: Edit/delete all zones (bypasses grants system)
  - **CODER (104+)**: Reset operations and system-wide changes
  - **GOD (105+)**: Unrestricted access including granting permissions to others

**Rationale**: Creating new spells/skills/classes/races requires corresponding code implementation in FieryMUD. Only CODER+ have the ability to deploy code changes.

**Grants System**: BUILDER users receive zone-specific permissions through the `UserGrants` table. HEAD_BUILDER+ bypass this system entirely.

### Data Model Clarification

- **Spells**: Standalone entities with name, description, effects, targeting
- **Spell Circles**: Assigned per-class via `SpellClassCircles` table
  - Example: "Cure Light Wounds" might be circle 1 for Clerics, circle 2 for Paladins, circle 4 for Druids
- **Skills**: Standalone entities with name, description, type, category
- **Skill Assignments**: Linked to classes via `ClassSkills` and races via `RaceSkills`

---

## Part 1: Database Schema Updates

### 1.1 Update UserRole Enum

**File**: `packages/db/prisma/schema.prisma`

```prisma
enum UserRole {
  PLAYER
  IMMORTAL
  BUILDER
  HEAD_BUILDER  // NEW - Level 103
  CODER
  GOD
}
```

### 1.2 Create UserGrants Table (Flexible Permissions System)

**File**: `packages/db/prisma/schema.prisma`

```prisma
model UserGrants {
  id           Int      @id @default(autoincrement())
  userId       String   @map("user_id")
  resourceType GrantResourceType @map("resource_type")
  resourceId   String   @map("resource_id")  // Can be zone ID, mob ID, etc.
  permissions  GrantPermission[]
  grantedBy    String   @map("granted_by")
  grantedAt    DateTime @map("granted_at") @default(now())
  expiresAt    DateTime? @map("expires_at")
  notes        String?

  user         Users    @relation(fields: [userId], references: [id], onDelete: Cascade)
  grantedByUser Users   @relation("grantsIssued", fields: [grantedBy], references: [id])

  @@unique([userId, resourceType, resourceId])
  @@index([userId])
  @@index([resourceType, resourceId])
  @@map("user_grants")
}

enum GrantResourceType {
  ZONE
  MOB      // Future: grant access to specific mobs
  OBJECT   // Future: grant access to specific objects
  SHOP     // Future: grant access to specific shops
}

enum GrantPermission {
  READ
  WRITE
  DELETE
  ADMIN    // Full control including granting to others
}

// Update Users model to add relations
model Users {
  // ... existing fields ...
  grants         UserGrants[] @relation("userGrants")
  grantsIssued   UserGrants[] @relation("grantsIssued")
}
```

**Notes**:

- Replaces the `olc_zones` array on Characters (which should be empty)
- Flexible design allows future expansion (mob-specific permissions, etc.)
- Supports permission expiration for temporary access
- Tracks who granted each permission for audit purposes
- Users with HEAD_BUILDER+ roles bypass this system (full access)

**Action**: Run `pnpm db:generate` to update Prisma clients (TypeScript + Python)

---

## Part 2: Backend - Role Calculation System

### 2.1 Create Role Calculator Service

**File**: `apps/api/src/users/role-calculator.service.ts`

**Purpose**: Calculate user role based on character levels

**Key Methods**:

```typescript
calculateRoleFromLevel(level: number): UserRole {
  if (level < 100) return UserRole.PLAYER;
  if (level === 100) return UserRole.IMMORTAL;
  if (level >= 101 && level <= 102) return UserRole.BUILDER;
  if (level === 103) return UserRole.HEAD_BUILDER;
  if (level === 104) return UserRole.CODER;
  if (level >= 105) return UserRole.GOD;
}

async updateUserRoleFromCharacters(userId: string): Promise<UserRole> {
  // 1. Query all characters for user
  // 2. Find max level
  // 3. Calculate role from max level
  // 4. Update user.role in database
  // 5. Return new role
}

async getMaxCharacterLevel(userId: string): Promise<number> {
  // Query max level from user's linked characters
}
```

**Inject into**: UsersModule

---

### 2.2 Update Characters Service

**File**: `apps/api/src/characters/characters.service.ts`

**Modifications**:

```typescript
async linkCharacterToUser(
  userId: string,
  characterName: string,
  characterPassword: string
): Promise<Characters> {
  // 1. Find character by name (case-insensitive)
  // 2. Validate password with bcrypt
  // 3. Check if already linked to another user
  // 4. Link character to user (set userId)
  // 5. Update user role via roleCalculator.updateUserRoleFromCharacters(userId)
  // 6. Return character with updated user data
}

async unlinkCharacterFromUser(
  characterId: string,
  userId: string
): Promise<void> {
  // 1. Verify character belongs to user
  // 2. Unlink character (set userId to null)
  // 3. Recalculate user role via roleCalculator.updateUserRoleFromCharacters(userId)
}
```

---

### 2.3 Update Auth Service

**File**: `apps/api/src/auth/auth.service.ts`

**Modifications**:

```typescript
async login(loginInput: LoginInput): Promise<AuthPayload> {
  // ... existing validation ...

  // Recalculate role on login (backup mechanism)
  const updatedRole = await this.roleCalculator.updateUserRoleFromCharacters(user.id);

  const accessToken = this.generateToken(user.id, user.username, updatedRole);

  // ... rest of login logic ...
}
```

**Note**: JWT payload includes role, so role changes require new token

---

## Part 3: Backend - Permission Guards

### 3.1 Create Zone Permission Guard

**File**: `apps/api/src/auth/guards/zone-permission.guard.ts`

**Purpose**: Check if user has access to specific zone

**Logic**:

```typescript
@Injectable()
export class ZonePermissionGuard implements CanActivate {
  constructor(private db: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const zoneId = extractZoneIdFromRequest(context);
    const user = extractUserFromContext(context);

    // GOD, CODER, HEAD_BUILDER have full access (bypass grants system)
    if (
      [UserRole.GOD, UserRole.CODER, UserRole.HEAD_BUILDER].includes(user.role)
    ) {
      return true;
    }

    // BUILDER must have a grant for this specific zone
    if (user.role === UserRole.BUILDER) {
      const grant = await this.db.userGrants.findUnique({
        where: {
          userId_resourceType_resourceId: {
            userId: user.id,
            resourceType: GrantResourceType.ZONE,
            resourceId: zoneId.toString(),
          },
        },
      });

      if (!grant) return false;

      // Check if grant has expired
      if (grant.expiresAt && grant.expiresAt < new Date()) {
        return false;
      }

      // Check if user has WRITE permission (needed for editing zones)
      return grant.permissions.includes(GrantPermission.WRITE);
    }

    return false;
  }
}
```

**Decorator**:

```typescript
// apps/api/src/auth/decorators/zone-permission.decorator.ts
export const RequireZoneAccess = () => UseGuards(ZonePermissionGuard);
```

**Notes**:

- HEAD_BUILDER+ bypass the grants system entirely
- BUILDER users require an active (non-expired) grant with WRITE permission
- Future: Can add READ-only grants for viewing zones without editing

---

### 3.2 Create Minimum Role Guard

**File**: `apps/api/src/auth/guards/minimum-role.guard.ts`

**Purpose**: Hierarchical role checking

**Logic**:

```typescript
@Injectable()
export class MinimumRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRole = this.reflector.get<UserRole>(
      'minimumRole',
      context.getHandler()
    );
    const user = extractUserFromContext(context);

    const roleHierarchy = [
      UserRole.PLAYER,
      UserRole.IMMORTAL,
      UserRole.BUILDER,
      UserRole.HEAD_BUILDER,
      UserRole.CODER,
      UserRole.GOD,
    ];

    const userLevel = roleHierarchy.indexOf(user.role);
    const requiredLevel = roleHierarchy.indexOf(requiredRole);

    return userLevel >= requiredLevel;
  }
}
```

**Decorator**:

```typescript
// apps/api/src/auth/decorators/minimum-role.decorator.ts
export const MinimumRole = (role: UserRole) => SetMetadata('minimumRole', role);
```

---

## Part 4: Backend - Admin API Modules

### 4.1 Skills Module

**Directory**: `apps/api/src/skills/`

**Files to Create**:

- `skills.module.ts` - Module definition with providers and imports
- `skills.service.ts` - Business logic for skill operations
- `skills.resolver.ts` - GraphQL resolver
- `dto/skill.dto.ts` - GraphQL object types
- `dto/skill.input.ts` - GraphQL input types

**DTO Structure** (`skill.dto.ts`):

```typescript
@ObjectType()
export class SkillDto {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => SkillType)
  type: SkillType;

  @Field(() => SkillCategory)
  category: SkillCategory;

  @Field(() => Int)
  maxLevel: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Relations
  @Field(() => [ClassSkillDto], { nullable: true })
  classSkills?: ClassSkillDto[];

  @Field(() => [RaceSkillDto], { nullable: true })
  raceSkills?: RaceSkillDto[];
}

@ObjectType()
export class ClassSkillDto {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  classId: number;

  @Field(() => Int)
  skillId: number;

  @Field(() => SkillCategory)
  category: SkillCategory;

  @Field(() => Int)
  minLevel: number;

  @Field(() => Int)
  maxLevel: number;

  @Field(() => CharacterClassDto)
  characterClass: CharacterClassDto;
}

@ObjectType()
export class RaceSkillDto {
  @Field(() => Int)
  id: number;

  @Field(() => Race)
  race: Race;

  @Field(() => Int)
  skillId: number;

  @Field(() => SkillCategory)
  category: SkillCategory;

  @Field(() => Int)
  bonus: number;

  @Field(() => RaceDto)
  raceData: RaceDto;
}
```

**Input Structure** (`skill.input.ts`):

```typescript
@InputType()
export class CreateSkillInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => SkillType)
  type: SkillType;

  @Field(() => SkillCategory, { defaultValue: SkillCategory.SECONDARY })
  category: SkillCategory;

  @Field(() => Int, { defaultValue: 100 })
  maxLevel: number;
}

@InputType()
export class UpdateSkillInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => SkillType, { nullable: true })
  type?: SkillType;

  @Field(() => SkillCategory, { nullable: true })
  category?: SkillCategory;

  @Field(() => Int, { nullable: true })
  maxLevel?: number;
}

@InputType()
export class AddSkillToClassInput {
  @Field(() => Int)
  classId: number;

  @Field(() => Int)
  skillId: number;

  @Field(() => SkillCategory, { defaultValue: SkillCategory.SECONDARY })
  category: SkillCategory;

  @Field(() => Int, { defaultValue: 1 })
  minLevel: number;

  @Field(() => Int, { defaultValue: 100 })
  maxLevel: number;
}

@InputType()
export class AddSkillToRaceInput {
  @Field(() => Race)
  race: Race;

  @Field(() => Int)
  skillId: number;

  @Field(() => SkillCategory, { defaultValue: SkillCategory.SECONDARY })
  category: SkillCategory;

  @Field(() => Int, { defaultValue: 0 })
  bonus: number;
}
```

**GraphQL Operations** (`skills.resolver.ts`):

```typescript
@Resolver(() => SkillDto)
@UseGuards(GraphQLJwtAuthGuard)
export class SkillsResolver {
  // Queries
  @Query(() => [SkillDto], { name: 'skills' })
  async findAllSkills(
    @Args('type', { type: () => SkillType, nullable: true }) type?: SkillType,
    @Args('category', { type: () => SkillCategory, nullable: true }) category?: SkillCategory
  ): Promise<SkillDto[]>;

  @Query(() => SkillDto, { name: 'skill' })
  async findSkillById(@Args('id', { type: () => Int }) id: number): Promise<SkillDto>;

  @Query(() => [SkillDto], { name: 'skillsByClass' })
  async findSkillsByClass(@Args('classId', { type: () => Int }) classId: number): Promise<SkillDto[]>;

  @Query(() => [SkillDto], { name: 'skillsByRace' })
  async findSkillsByRace(@Args('race', { type: () => Race }) race: Race): Promise<SkillDto[]>;

  // Mutations
  @Mutation(() => SkillDto)
  @MinimumRole(UserRole.CODER)  // Create requires code changes in FieryMUD
  async createSkill(@Args('data') data: CreateSkillInput): Promise<SkillDto>;

  @Mutation(() => SkillDto)
  @MinimumRole(UserRole.HEAD_BUILDER)  // Edit existing skills
  async updateSkill(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateSkillInput
  ): Promise<SkillDto>;

  @Mutation(() => Boolean)
  @MinimumRole(UserRole.HEAD_BUILDER)  // Delete existing skills
  async deleteSkill(@Args('id', { type: () => Int }) id: number): Promise<boolean>;

  // Class-Skill Associations
  @Mutation(() => ClassSkillDto)
  @MinimumRole(UserRole.HEAD_BUILDER)
  async addSkillToClass(@Args('data') data: AddSkillToClassInput): Promise<ClassSkillDto>;

  @Mutation(() => Boolean)
  @MinimumRole(UserRole.HEAD_BUILDER)
  async removeSkillFromClass(
    @Args('classId', { type: () => Int }) classId: number,
    @Args('skillId', { type: () => Int }) skillId: number
  ): Promise<boolean>;

  // Race-Skill Associations
  @Mutation(() => RaceSkillDto)
  @MinimumRole(UserRole.HEAD_BUILDER)
  async addSkillToRace(@Args('data') data: AddSkillToRaceInput): Promise<RaceSkillDto>;

  @Mutation(() => Boolean)
  @MinimumRole(UserRole.HEAD_BUILDER)
  async removeSkillFromRace(
    @Args('race', { type: () => Race }) race: Race,
    @Args('skillId', { type: () => Int }) skillId: number
  ): Promise<boolean>;
}
```

**Service Methods** (`skills.service.ts`):

```typescript
@Injectable()
export class SkillsService {
  constructor(private db: DatabaseService) {}

  async findAll(filters: {
    type?: SkillType;
    category?: SkillCategory;
  }): Promise<Skills[]> {
    return this.db.skills.findMany({
      where: filters,
      include: { classSkills: true, raceSkills: true },
    });
  }

  async findById(id: number): Promise<Skills> {
    const skill = await this.db.skills.findUnique({
      where: { id },
      include: {
        classSkills: { include: { characterClass: true } },
        raceSkills: { include: { raceData: true } },
      },
    });
    if (!skill) throw new NotFoundException(`Skill ${id} not found`);
    return skill;
  }

  async create(data: CreateSkillInput): Promise<Skills> {
    return this.db.skills.create({ data });
  }

  async update(id: number, data: UpdateSkillInput): Promise<Skills> {
    return this.db.skills.update({ where: { id }, data });
  }

  async delete(id: number): Promise<void> {
    await this.db.skills.delete({ where: { id } });
  }

  // Association methods
  async addToClass(data: AddSkillToClassInput): Promise<ClassSkills> {
    return this.db.classSkills.create({ data });
  }

  async removeFromClass(classId: number, skillId: number): Promise<void> {
    await this.db.classSkills.delete({
      where: { classId_skillId: { classId, skillId } },
    });
  }

  async addToRace(data: AddSkillToRaceInput): Promise<RaceSkills> {
    return this.db.raceSkills.create({ data });
  }

  async removeFromRace(race: Race, skillId: number): Promise<void> {
    await this.db.raceSkills.delete({
      where: { race_skillId: { race, skillId } },
    });
  }
}
```

---

### 4.2 Spells Module

**Directory**: `apps/api/src/spells/`

**Key Concept**: Spells are standalone entities. Circles are assigned per-class via `SpellClassCircles`.

**Files to Create**:

- `spells.module.ts`
- `spells.service.ts`
- `spells.resolver.ts`
- `dto/spell.dto.ts`
- `dto/spell.input.ts`

**DTO Structure** (`spell.dto.ts`):

```typescript
@ObjectType()
export class SpellDto {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => Int, { nullable: true })
  schoolId?: number;

  @Field(() => Position)
  minPosition: Position;

  @Field()
  violent: boolean;

  @Field(() => Int)
  castTimeRounds: number;

  @Field(() => Int)
  cooldownMs: number;

  @Field()
  inCombatOnly: boolean;

  @Field()
  isArea: boolean;

  @Field({ nullable: true })
  notes?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Relations
  @Field(() => SpellSchoolDto, { nullable: true })
  spellSchools?: SpellSchoolDto;

  @Field(() => [SpellClassCircleDto], { nullable: true })
  spellClassCircles?: SpellClassCircleDto[];

  @Field(() => [SpellEffectDto], { nullable: true })
  spellEffects?: SpellEffectDto[];

  @Field(() => SpellTargetingDto, { nullable: true })
  spellTargeting?: SpellTargetingDto;

  @Field(() => SpellMessagesDto, { nullable: true })
  spellMessages?: SpellMessagesDto;

  @Field(() => SpellRestrictionsDto, { nullable: true })
  spellRestrictions?: SpellRestrictionsDto;

  @Field(() => [SpellSavingThrowDto], { nullable: true })
  spellSavingThrows?: SpellSavingThrowDto[];
}

@ObjectType()
export class SpellClassCircleDto {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  spellId: number;

  @Field(() => Int)
  classId: number;

  @Field(() => Int)
  circle: number; // Different per class!

  @Field(() => Int, { nullable: true })
  minLevel?: number;

  @Field(() => Int, { nullable: true })
  proficiencyGain?: number;

  @Field(() => CharacterClassDto)
  characterClass: CharacterClassDto;
}

@ObjectType()
export class SpellEffectDto {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  spellId: number;

  @Field(() => EffectType)
  effectType: EffectType;

  @Field(() => Int)
  order: number;

  @Field(() => Int)
  chancePct: number;

  @Field(() => EffectTrigger, { nullable: true })
  trigger?: EffectTrigger;

  @Field({ nullable: true })
  durationFormula?: string;

  @Field(() => StackingRule)
  stackingRule: StackingRule;

  @Field(() => GraphQLJSON, { nullable: true })
  conditionFilter?: any;

  @Field(() => GraphQLJSON)
  params: any;
}

@ObjectType()
export class SpellTargetingDto {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  allowedTargetsMask: number;

  @Field(() => TargetScope)
  targetScope: TargetScope;

  @Field(() => Int)
  maxTargets: number;

  @Field(() => SpellRange)
  range: SpellRange;

  @Field()
  requireLos: boolean;

  @Field(() => Int, { nullable: true })
  filtersMask?: number;
}

@ObjectType()
export class SpellMessagesDto {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  startToCaster?: string;

  @Field({ nullable: true })
  startToVictim?: string;

  @Field({ nullable: true })
  startToRoom?: string;

  @Field({ nullable: true })
  successToCaster?: string;

  @Field({ nullable: true })
  successToVictim?: string;

  @Field({ nullable: true })
  successToRoom?: string;

  @Field({ nullable: true })
  failToCaster?: string;

  @Field({ nullable: true })
  failToVictim?: string;

  @Field({ nullable: true })
  failToRoom?: string;

  @Field({ nullable: true })
  wearoffToTarget?: string;

  @Field({ nullable: true })
  wearoffToRoom?: string;
}

// ... similar DTOs for SpellRestrictions, SpellSavingThrow, SpellSchool
```

**Input Structure** (`spell.input.ts`):

```typescript
@InputType()
export class CreateSpellInput {
  @Field()
  name: string;

  @Field(() => Int, { nullable: true })
  schoolId?: number;

  @Field(() => Position, { defaultValue: Position.STANDING })
  minPosition: Position;

  @Field({ defaultValue: false })
  violent: boolean;

  @Field(() => Int, { defaultValue: 1 })
  castTimeRounds: number;

  @Field(() => Int, { defaultValue: 0 })
  cooldownMs: number;

  @Field({ defaultValue: false })
  inCombatOnly: boolean;

  @Field({ defaultValue: false })
  isArea: boolean;

  @Field({ nullable: true })
  notes?: string;
}

@InputType()
export class UpdateSpellInput {
  // All fields optional, similar to CreateSpellInput
}

@InputType()
export class AssignSpellToClassInput {
  @Field(() => Int)
  spellId: number;

  @Field(() => Int)
  classId: number;

  @Field(() => Int)
  circle: number; // Circle is class-specific!

  @Field(() => Int, { nullable: true })
  minLevel?: number;

  @Field(() => Int, { nullable: true })
  proficiencyGain?: number;
}

@InputType()
export class CreateSpellEffectInput {
  @Field(() => Int)
  spellId: number;

  @Field(() => EffectType)
  effectType: EffectType;

  @Field(() => Int, { defaultValue: 0 })
  order: number;

  @Field(() => Int, { defaultValue: 100 })
  chancePct: number;

  @Field(() => EffectTrigger, { defaultValue: EffectTrigger.ON_CAST })
  trigger: EffectTrigger;

  @Field({ nullable: true })
  durationFormula?: string;

  @Field(() => StackingRule, { defaultValue: StackingRule.REFRESH })
  stackingRule: StackingRule;

  @Field(() => GraphQLJSON, { nullable: true })
  conditionFilter?: any;

  @Field(() => GraphQLJSON)
  params: any;
}

@InputType()
export class UpdateSpellTargetingInput {
  @Field(() => Int)
  spellId: number;

  @Field(() => Int)
  allowedTargetsMask: number;

  @Field(() => TargetScope, { defaultValue: TargetScope.SINGLE })
  targetScope: TargetScope;

  @Field(() => Int, { defaultValue: 1 })
  maxTargets: number;

  @Field(() => SpellRange, { defaultValue: SpellRange.ROOM })
  range: SpellRange;

  @Field({ defaultValue: false })
  requireLos: boolean;

  @Field(() => Int, { nullable: true })
  filtersMask?: number;
}
```

**GraphQL Operations** (`spells.resolver.ts`):

```typescript
@Resolver(() => SpellDto)
@UseGuards(GraphQLJwtAuthGuard)
export class SpellsResolver {
  // Queries
  @Query(() => [SpellDto], { name: 'spells' })
  async findAllSpells(
    @Args('schoolId', { type: () => Int, nullable: true }) schoolId?: number,
    @Args('violent', { type: () => Boolean, nullable: true }) violent?: boolean
  ): Promise<SpellDto[]>;

  @Query(() => SpellDto, { name: 'spell' })
  async findSpellById(@Args('id', { type: () => Int }) id: number): Promise<SpellDto>;

  @Query(() => [SpellDto], { name: 'spellsForClass' })
  async findSpellsForClass(
    @Args('classId', { type: () => Int }) classId: number,
    @Args('circle', { type: () => Int, nullable: true }) circle?: number
  ): Promise<SpellDto[]>;

  // Spell CRUD
  @Mutation(() => SpellDto)
  @MinimumRole(UserRole.CODER)  // Create requires code changes in FieryMUD
  async createSpell(@Args('data') data: CreateSpellInput): Promise<SpellDto>;

  @Mutation(() => SpellDto)
  @MinimumRole(UserRole.HEAD_BUILDER)  // Edit existing spells
  async updateSpell(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateSpellInput
  ): Promise<SpellDto>;

  @Mutation(() => Boolean)
  @MinimumRole(UserRole.HEAD_BUILDER)  // Delete existing spells
  async deleteSpell(@Args('id', { type: () => Int }) id: number): Promise<boolean>;

  // Spell-Class-Circle Assignments
  @Mutation(() => SpellClassCircleDto)
  @MinimumRole(UserRole.HEAD_BUILDER)
  async assignSpellToClass(@Args('data') data: AssignSpellToClassInput): Promise<SpellClassCircleDto>;

  @Mutation(() => Boolean)
  @MinimumRole(UserRole.HEAD_BUILDER)
  async removeSpellFromClass(
    @Args('spellId', { type: () => Int }) spellId: number,
    @Args('classId', { type: () => Int }) classId: number
  ): Promise<boolean>;

  // Spell Effects
  @Mutation(() => SpellEffectDto)
  @MinimumRole(UserRole.HEAD_BUILDER)
  async addSpellEffect(@Args('data') data: CreateSpellEffectInput): Promise<SpellEffectDto>;

  @Mutation(() => SpellEffectDto)
  @MinimumRole(UserRole.HEAD_BUILDER)
  async updateSpellEffect(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateSpellEffectInput
  ): Promise<SpellEffectDto>;

  @Mutation(() => Boolean)
  @MinimumRole(UserRole.HEAD_BUILDER)
  async removeSpellEffect(@Args('id', { type: () => Int }) id: number): Promise<boolean>;

  // Spell Targeting
  @Mutation(() => SpellTargetingDto)
  @MinimumRole(UserRole.HEAD_BUILDER)
  async updateSpellTargeting(@Args('data') data: UpdateSpellTargetingInput): Promise<SpellTargetingDto>;

  // Spell Messages
  @Mutation(() => SpellMessagesDto)
  @MinimumRole(UserRole.HEAD_BUILDER)
  async updateSpellMessages(@Args('data') data: UpdateSpellMessagesInput): Promise<SpellMessagesDto>;
}
```

---

### 4.3 Races Module

**Directory**: `apps/api/src/races/`

**Key Concept**: Races are enum-based, so no create/delete. Only update existing race data and manage skill associations.

**Files to Create**:

- `races.module.ts`
- `races.service.ts`
- `races.resolver.ts`
- `dto/race.dto.ts`
- `dto/race.input.ts`

**DTO Structure** (`race.dto.ts`):

```typescript
@ObjectType()
export class RaceDto {
  @Field(() => Race)
  race: Race;

  @Field()
  name: string;

  @Field()
  keywords: string;

  @Field()
  displayName: string;

  @Field()
  fullName: string;

  @Field()
  plainName: string;

  @Field()
  playable: boolean;

  @Field()
  humanoid: boolean;

  @Field()
  magical: boolean;

  @Field(() => RaceAlign)
  raceAlign: RaceAlign;

  @Field(() => Size)
  defaultSize: Size;

  @Field(() => Int)
  defaultAlignment: number;

  @Field(() => Int)
  bonusDamroll: number;

  @Field(() => Int)
  bonusHitroll: number;

  @Field(() => Int)
  focusBonus: number;

  @Field(() => LifeForce)
  defaultLifeforce: LifeForce;

  @Field(() => Composition)
  defaultComposition: Composition;

  // Height/Weight ranges
  @Field(() => Int)
  maleWeightLow: number;

  @Field(() => Int)
  maleWeightHigh: number;

  @Field(() => Int)
  maleHeightLow: number;

  @Field(() => Int)
  maleHeightHigh: number;

  @Field(() => Int)
  femaleWeightLow: number;

  @Field(() => Int)
  femaleWeightHigh: number;

  @Field(() => Int)
  femaleHeightLow: number;

  @Field(() => Int)
  femaleHeightHigh: number;

  // Stat maximums
  @Field(() => Int)
  maxStrength: number;

  @Field(() => Int)
  maxDexterity: number;

  @Field(() => Int)
  maxIntelligence: number;

  @Field(() => Int)
  maxWisdom: number;

  @Field(() => Int)
  maxConstitution: number;

  @Field(() => Int)
  maxCharisma: number;

  // Factors
  @Field(() => Int)
  expFactor: number;

  @Field(() => Int)
  hpFactor: number;

  @Field(() => Int)
  hitDamageFactor: number;

  @Field(() => Int)
  damageDiceFactor: number;

  @Field(() => Int)
  copperFactor: number;

  @Field(() => Int)
  acFactor: number;

  @Field({ nullable: true })
  enterVerb?: string;

  @Field({ nullable: true })
  leaveVerb?: string;

  @Field(() => [EffectFlag])
  permanentEffects: EffectFlag[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Relations
  @Field(() => [RaceSkillDto], { nullable: true })
  raceSkills?: RaceSkillDto[];
}
```

**Input Structure** (`race.input.ts`):

```typescript
@InputType()
export class UpdateRaceInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  playable?: boolean;

  @Field(() => Size, { nullable: true })
  defaultSize?: Size;

  @Field(() => Int, { nullable: true })
  bonusDamroll?: number;

  @Field(() => Int, { nullable: true })
  bonusHitroll?: number;

  // ... all other race fields as optional
}
```

**GraphQL Operations** (`races.resolver.ts`):

```typescript
@Resolver(() => RaceDto)
@UseGuards(GraphQLJwtAuthGuard)
export class RacesResolver {
  // Queries
  @Query(() => [RaceDto], { name: 'races' })
  async findAllRaces(
    @Args('playableOnly', { type: () => Boolean, nullable: true }) playableOnly?: boolean
  ): Promise<RaceDto[]>;

  @Query(() => RaceDto, { name: 'race' })
  async findRaceByEnum(@Args('race', { type: () => Race }) race: Race): Promise<RaceDto>;

  // Mutations (no create/delete - races are enum-based)
  @Mutation(() => RaceDto)
  @MinimumRole(UserRole.HEAD_BUILDER)
  async updateRace(
    @Args('race', { type: () => Race }) race: Race,
    @Args('data') data: UpdateRaceInput
  ): Promise<RaceDto>;

  // Race-Skill Associations (handled by Skills module, but can be accessed here too)
}
```

---

### 4.4 Classes Module

**Directory**: `apps/api/src/classes/`

**Files to Create**:

- `classes.module.ts`
- `classes.service.ts`
- `classes.resolver.ts`
- `dto/class.dto.ts`
- `dto/class.input.ts`

**DTO Structure** (`class.dto.ts`):

```typescript
@ObjectType()
export class CharacterClassDto {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  hitDice: string;

  @Field({ nullable: true })
  primaryStat?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Relations
  @Field(() => [ClassSkillDto], { nullable: true })
  classSkills?: ClassSkillDto[];

  @Field(() => [ClassCircleDto], { nullable: true })
  classCircles?: ClassCircleDto[];

  @Field(() => [SpellClassCircleDto], { nullable: true })
  spellClassCircles?: SpellClassCircleDto[];
}

@ObjectType()
export class ClassCircleDto {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  classId: number;

  @Field(() => Int)
  circle: number;

  @Field(() => Int)
  minLevel: number;
}
```

**Input Structure** (`class.input.ts`):

```typescript
@InputType()
export class CreateClassInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ defaultValue: '1d8' })
  hitDice: string;

  @Field({ nullable: true })
  primaryStat?: string;
}

@InputType()
export class UpdateClassInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  hitDice?: string;

  @Field({ nullable: true })
  primaryStat?: string;
}

@InputType()
export class AddClassCircleInput {
  @Field(() => Int)
  classId: number;

  @Field(() => Int)
  circle: number;

  @Field(() => Int)
  minLevel: number;
}
```

**GraphQL Operations** (`classes.resolver.ts`):

```typescript
@Resolver(() => CharacterClassDto)
@UseGuards(GraphQLJwtAuthGuard)
export class ClassesResolver {
  // Queries
  @Query(() => [CharacterClassDto], { name: 'classes' })
  async findAllClasses(): Promise<CharacterClassDto[]>;

  @Query(() => CharacterClassDto, { name: 'class' })
  async findClassById(@Args('id', { type: () => Int }) id: number): Promise<CharacterClassDto>;

  // Class CRUD
  @Mutation(() => CharacterClassDto)
  @MinimumRole(UserRole.CODER)  // Create requires code changes in FieryMUD
  async createClass(@Args('data') data: CreateClassInput): Promise<CharacterClassDto>;

  @Mutation(() => CharacterClassDto)
  @MinimumRole(UserRole.HEAD_BUILDER)  // Edit existing classes
  async updateClass(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateClassInput
  ): Promise<CharacterClassDto>;

  @Mutation(() => Boolean)
  @MinimumRole(UserRole.HEAD_BUILDER)  // Delete existing classes
  async deleteClass(@Args('id', { type: () => Int }) id: number): Promise<boolean>;

  // Class Circles
  @Mutation(() => ClassCircleDto)
  @MinimumRole(UserRole.HEAD_BUILDER)
  async addClassCircle(@Args('data') data: AddClassCircleInput): Promise<ClassCircleDto>;

  @Mutation(() => Boolean)
  @MinimumRole(UserRole.HEAD_BUILDER)
  async removeClassCircle(
    @Args('classId', { type: () => Int }) classId: number,
    @Args('circle', { type: () => Int }) circle: number
  ): Promise<boolean>;

  // Class-Skill associations handled by Skills module
  // Class-Spell-Circle associations handled by Spells module
}
```

---

### 4.5 Grants Module (Permission Management)

**Directory**: `apps/api/src/grants/`

**Purpose**: Manage zone and resource permissions for BUILDER users

**Files to Create**:

- `grants.module.ts`
- `grants.service.ts`
- `grants.resolver.ts`
- `dto/grant.dto.ts`
- `dto/grant.input.ts`

**DTO Structure** (`grant.dto.ts`):

```typescript
@ObjectType()
export class UserGrantDto {
  @Field(() => Int)
  id: number;

  @Field(() => ID)
  userId: string;

  @Field(() => GrantResourceType)
  resourceType: GrantResourceType;

  @Field()
  resourceId: string;

  @Field(() => [GrantPermission])
  permissions: GrantPermission[];

  @Field(() => ID)
  grantedBy: string;

  @Field()
  grantedAt: Date;

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field({ nullable: true })
  notes?: string;

  // Relations
  @Field(() => User)
  user: User;

  @Field(() => User)
  grantedByUser: User;
}
```

**Input Structure** (`grant.input.ts`):

```typescript
@InputType()
export class CreateGrantInput {
  @Field(() => ID)
  userId: string;

  @Field(() => GrantResourceType)
  resourceType: GrantResourceType;

  @Field()
  resourceId: string; // Zone ID, Mob ID, etc.

  @Field(() => [GrantPermission])
  permissions: GrantPermission[];

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field({ nullable: true })
  notes?: string;
}

@InputType()
export class UpdateGrantInput {
  @Field(() => [GrantPermission], { nullable: true })
  permissions?: GrantPermission[];

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field({ nullable: true })
  notes?: string;
}

@InputType()
export class GrantZoneAccessInput {
  @Field(() => ID)
  userId: string;

  @Field(() => Int)
  zoneId: number;

  @Field(() => [GrantPermission], {
    defaultValue: [GrantPermission.READ, GrantPermission.WRITE],
  })
  permissions: GrantPermission[];

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field({ nullable: true })
  notes?: string;
}
```

**GraphQL Operations** (`grants.resolver.ts`):

```typescript
@Resolver(() => UserGrantDto)
@UseGuards(GraphQLJwtAuthGuard)
export class GrantsResolver {
  // Queries
  @Query(() => [UserGrantDto], { name: 'userGrants' })
  @MinimumRole(UserRole.HEAD_BUILDER)  // View all grants
  async findAllGrants(
    @Args('userId', { type: () => ID, nullable: true }) userId?: string,
    @Args('resourceType', { type: () => GrantResourceType, nullable: true }) resourceType?: GrantResourceType
  ): Promise<UserGrantDto[]>;

  @Query(() => [UserGrantDto], { name: 'myGrants' })
  async findMyGrants(@CurrentUser() user: Users): Promise<UserGrantDto[]>;

  @Query(() => [UserGrantDto], { name: 'grantsForResource' })
  @MinimumRole(UserRole.HEAD_BUILDER)
  async findGrantsForResource(
    @Args('resourceType', { type: () => GrantResourceType }) resourceType: GrantResourceType,
    @Args('resourceId') resourceId: string
  ): Promise<UserGrantDto[]>;

  // Mutations
  @Mutation(() => UserGrantDto)
  @MinimumRole(UserRole.HEAD_BUILDER)  // Only HEAD_BUILDER+ can grant permissions
  async createGrant(
    @Args('data') data: CreateGrantInput,
    @CurrentUser() user: Users
  ): Promise<UserGrantDto>;

  @Mutation(() => UserGrantDto)
  @MinimumRole(UserRole.HEAD_BUILDER)  // Only HEAD_BUILDER+ can modify grants
  async updateGrant(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateGrantInput
  ): Promise<UserGrantDto>;

  @Mutation(() => Boolean)
  @MinimumRole(UserRole.HEAD_BUILDER)  // Only HEAD_BUILDER+ can revoke grants
  async revokeGrant(@Args('id', { type: () => Int }) id: number): Promise<boolean>;

  // Convenience mutation for granting zone access
  @Mutation(() => UserGrantDto)
  @MinimumRole(UserRole.HEAD_BUILDER)
  async grantZoneAccess(
    @Args('data') data: GrantZoneAccessInput,
    @CurrentUser() user: Users
  ): Promise<UserGrantDto>;

  @Mutation(() => Boolean)
  @MinimumRole(UserRole.HEAD_BUILDER)
  async revokeZoneAccess(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('zoneId', { type: () => Int }) zoneId: number
  ): Promise<boolean>;
}
```

**Service Methods** (`grants.service.ts`):

```typescript
@Injectable()
export class GrantsService {
  constructor(private db: DatabaseService) {}

  async findAll(filters: {
    userId?: string;
    resourceType?: GrantResourceType;
  }): Promise<UserGrants[]> {
    return this.db.userGrants.findMany({
      where: filters,
      include: { user: true, grantedByUser: true },
    });
  }

  async findForUser(userId: string): Promise<UserGrants[]> {
    return this.db.userGrants.findMany({
      where: {
        userId,
        OR: [
          { expiresAt: null }, // No expiration
          { expiresAt: { gt: new Date() } }, // Not expired
        ],
      },
      include: { user: true, grantedByUser: true },
    });
  }

  async findForResource(
    resourceType: GrantResourceType,
    resourceId: string
  ): Promise<UserGrants[]> {
    return this.db.userGrants.findMany({
      where: { resourceType, resourceId },
      include: { user: true, grantedByUser: true },
    });
  }

  async create(data: CreateGrantInput, grantedBy: string): Promise<UserGrants> {
    // Check if grant already exists
    const existing = await this.db.userGrants.findUnique({
      where: {
        userId_resourceType_resourceId: {
          userId: data.userId,
          resourceType: data.resourceType,
          resourceId: data.resourceId,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        'Grant already exists for this user and resource'
      );
    }

    return this.db.userGrants.create({
      data: {
        ...data,
        grantedBy,
      },
      include: { user: true, grantedByUser: true },
    });
  }

  async update(id: number, data: UpdateGrantInput): Promise<UserGrants> {
    return this.db.userGrants.update({
      where: { id },
      data,
      include: { user: true, grantedByUser: true },
    });
  }

  async revoke(id: number): Promise<void> {
    await this.db.userGrants.delete({ where: { id } });
  }

  async grantZoneAccess(
    userId: string,
    zoneId: number,
    permissions: GrantPermission[],
    grantedBy: string,
    expiresAt?: Date,
    notes?: string
  ): Promise<UserGrants> {
    return this.create(
      {
        userId,
        resourceType: GrantResourceType.ZONE,
        resourceId: zoneId.toString(),
        permissions,
        expiresAt,
        notes,
      },
      grantedBy
    );
  }

  async revokeZoneAccess(userId: string, zoneId: number): Promise<void> {
    const grant = await this.db.userGrants.findUnique({
      where: {
        userId_resourceType_resourceId: {
          userId,
          resourceType: GrantResourceType.ZONE,
          resourceId: zoneId.toString(),
        },
      },
    });

    if (grant) {
      await this.revoke(grant.id);
    }
  }

  async hasPermission(
    userId: string,
    resourceType: GrantResourceType,
    resourceId: string,
    requiredPermission: GrantPermission
  ): Promise<boolean> {
    const grant = await this.db.userGrants.findUnique({
      where: {
        userId_resourceType_resourceId: {
          userId,
          resourceType,
          resourceId,
        },
      },
    });

    if (!grant) return false;

    // Check expiration
    if (grant.expiresAt && grant.expiresAt < new Date()) {
      return false;
    }

    return grant.permissions.includes(requiredPermission);
  }
}
```

**Notes**:

- Only HEAD_BUILDER+ can grant/revoke permissions
- GOD users can see all grants across the system
- BUILDER users can view their own grants via `myGrants` query
- Supports expiration dates for temporary access
- Audit trail via `grantedBy` and `grantedAt` fields

---

## Part 5: Frontend - Character Linking UI

### 5.1 Character Linking Component

**File**: `apps/web/src/components/CharacterLinking/LinkCharacterDialog.tsx`

**Features**:

- Dialog/modal for linking characters
- Form with character name and password fields
- Password validation (bcrypt comparison on backend)
- Display role change after successful link
- Error handling for invalid credentials or already-linked characters

**GraphQL Mutations**:

```graphql
mutation LinkCharacter($data: LinkCharacterInput!) {
  linkCharacter(data: $data) {
    id
    name
    level
    userId
    users {
      id
      role
    }
  }
}

mutation UnlinkCharacter($data: UnlinkCharacterInput!) {
  unlinkCharacter(data: $data)
}
```

---

### 5.2 Update Character Page

**File**: `apps/web/src/app/dashboard/characters/page.tsx`

**Features**:

- Display current user role prominently
- Show all linked characters with levels
- Show max character level
- "Link Character" button to open LinkCharacterDialog
- "Unlink" button for each linked character
- Show available characters to link (optional)

---

## Part 6: Frontend - Admin Interfaces

### 6.1 Skills Management Page

**Directory**: `apps/web/src/app/dashboard/skills/`

**Files**:

- `page.tsx` - List view with filters
- `editor/page.tsx` - Create/Edit form

**Features**:

- List all skills with type/category filters
- Create new skill (CODER+ only)
- Edit skill details (HEAD_BUILDER+)
- Delete skill (HEAD_BUILDER+)
- View associated classes and races
- Manage skill-class associations (HEAD_BUILDER+)
- Manage skill-race associations (HEAD_BUILDER+)

---

### 6.2 Spells Management Page

**Directory**: `apps/web/src/app/dashboard/spells/`

**Files**:

- `page.tsx` - List view with filters
- `editor/page.tsx` - Comprehensive spell editor

**Features**:

- List spells with school/class filters
- Create new spell (CODER+ only)
- Edit spell core details (HEAD_BUILDER+): name, school, cast time, etc.
- Manage spell effects (HEAD_BUILDER+): add/edit/remove
- Configure targeting (HEAD_BUILDER+): scope, range, LOS
- Edit spell messages (HEAD_BUILDER+): start, success, fail, wearoff
- Configure saving throws (HEAD_BUILDER+)
- Set restrictions (HEAD_BUILDER+): indoors/outdoors, terrain, etc.
- Manage class-circle assignments (HEAD_BUILDER+) - critical!
- Delete spell (HEAD_BUILDER+)

**Class-Circle Assignment UI**:

```
Spell: Cure Light Wounds

Class Assignments:
┌─────────────┬────────┬──────────┬──────────────────┐
│ Class       │ Circle │ Min Lvl  │ Proficiency Gain │
├─────────────┼────────┼──────────┼──────────────────┤
│ Cleric      │ 1      │ 1        │ 10               │
│ Paladin     │ 2      │ 3        │ 8                │
│ Druid       │ 4      │ 7        │ 6                │
└─────────────┴────────┴──────────┴──────────────────┘

[+ Add Class Assignment]
```

---

### 6.3 Races Management Page

**Directory**: `apps/web/src/app/dashboard/races/`

**Files**:

- `page.tsx` - List view
- `editor/page.tsx` - Edit form (no create/delete)

**Features**:

- List all races with playable filter
- Edit race details (HEAD_BUILDER+)
- Configure stat bonuses and maximums
- Set racial factors (XP, HP, damage, etc.)
- Manage permanent effects
- View/edit race skills

---

### 6.4 Classes Management Page

**Directory**: `apps/web/src/app/dashboard/classes/`

**Files**:

- `page.tsx` - List view
- `editor/page.tsx` - Create/Edit form

**Features**:

- List all classes
- Create new class (CODER+ only)
- Edit class details (HEAD_BUILDER+): name, description, hit dice, primary stat
- Manage class circles (HEAD_BUILDER+): which circles are available and at what level
- View/manage class skills (HEAD_BUILDER+): via Skills module UI
- View/manage class spells (HEAD_BUILDER+): via Spells module UI
- Delete class (HEAD_BUILDER+)

---

### 6.5 Permissions Management Page

**Directory**: `apps/web/src/app/dashboard/permissions/`

**Purpose**: Allow HEAD_BUILDER+ to grant zone access to BUILDER users

**Files**:

- `page.tsx` - List all grants with filters
- `grant/page.tsx` - Grant permissions form

**Features**:

- List all active grants (HEAD_BUILDER+)
- Filter by user, resource type, zone
- Grant zone access to users (HEAD_BUILDER+)
  - Select user (BUILDER role only)
  - Select zone(s)
  - Select permissions (READ, WRITE, DELETE)
  - Optional expiration date
  - Add notes
- Revoke grants (HEAD_BUILDER+)
- View own grants (all users)

**UI Components**:

```tsx
// Grant form
<GrantPermissionDialog>
  <UserSelect role="BUILDER" />
  <ZoneMultiSelect />
  <PermissionCheckboxes options={['READ', 'WRITE', 'DELETE']} />
  <DatePicker label="Expires At" optional />
  <TextArea label="Notes" optional />
</GrantPermissionDialog>

// Grants table
<GrantsTable>
  <Column field="user.username" label="User" />
  <Column field="resourceId" label="Zone ID" />
  <Column field="permissions" label="Permissions" render={badges} />
  <Column field="expiresAt" label="Expires" />
  <Column field="grantedByUser.username" label="Granted By" />
  <Column actions>
    <RevokeButton />
    <EditButton />
  </Column>
</GrantsTable>
```

---

### 6.6 Update Navigation

**File**: `apps/web/src/app/dashboard/components/Navigation.tsx`

**New Sections**:

```tsx
{
  /* Game Systems - Visible to IMMORTAL+ for viewing, HEAD_BUILDER+ for editing */
}
{
  hasMinimumRole(UserRole.Immortal) && (
    <>
      <NavSection title='Game Systems'>
        <NavLink href='/dashboard/skills' icon={SwordIcon}>
          Skills
        </NavLink>
        <NavLink href='/dashboard/spells' icon={WandIcon}>
          Spells
        </NavLink>
        <NavLink href='/dashboard/races' icon={UserIcon}>
          Races
        </NavLink>
        <NavLink href='/dashboard/classes' icon={BookIcon}>
          Classes
        </NavLink>
      </NavSection>
    </>
  );
}

{
  /* Permissions Management - Only HEAD_BUILDER+ */
}
{
  hasMinimumRole(UserRole.HeadBuilder) && (
    <>
      <NavSection title='Administration'>
        <NavLink href='/dashboard/permissions' icon={ShieldIcon}>
          Permissions
        </NavLink>
      </NavSection>
    </>
  );
}
```

---

## Part 7: Frontend - Role-Based Hooks & Context

### 7.1 User Role Hook

**File**: `apps/web/src/hooks/useUserRole.ts`

```typescript
import { useUser } from '@/hooks/useUser'; // Existing hook
import { UserRole } from '@/generated/graphql';

export function useUserRole() {
  const { user } = useUser();

  const roleHierarchy = [
    UserRole.Player,
    UserRole.Immortal,
    UserRole.Builder,
    UserRole.HeadBuilder,
    UserRole.Coder,
    UserRole.God,
  ];

  const hasMinimumRole = (minRole: UserRole): boolean => {
    if (!user) return false;
    const userLevel = roleHierarchy.indexOf(user.role);
    const requiredLevel = roleHierarchy.indexOf(minRole);
    return userLevel >= requiredLevel;
  };

  const canEdit = (): boolean => hasMinimumRole(UserRole.HeadBuilder);
  const canDelete = (): boolean => hasMinimumRole(UserRole.Coder);
  const canReset = (): boolean => hasMinimumRole(UserRole.Coder);

  const hasZoneAccess = async (zoneId: number): Promise<boolean> => {
    if (!user) return false;

    // GOD, CODER, HEAD_BUILDER have full access (bypass grants)
    if (hasMinimumRole(UserRole.HeadBuilder)) return true;

    // BUILDER must have a grant for this zone
    // This requires a GraphQL query to check UserGrants
    // Consider caching grants in React Context or fetching on page load
    return false; // TODO: Implement grant check via GraphQL
  };

  return {
    role: user?.role,
    hasMinimumRole,
    canEdit,
    canDelete,
    canReset,
    hasZoneAccess,
    isHeadBuilder: hasMinimumRole(UserRole.HeadBuilder),
    isCoder: hasMinimumRole(UserRole.Coder),
    isGod: user?.role === UserRole.God,
  };
}
```

---

### 7.2 Zone Permission Check via Grants

**Note**: `hasZoneAccess()` requires querying the `UserGrants` table. Implementation options:

1. **Cached in Context**: Fetch user's grants on login and store in React Context
2. **Per-Page Query**: Query grants when entering zone editor pages
3. **Optimistic UI**: Assume access and handle 403 errors gracefully

**Recommended**: Fetch grants on dashboard load and cache in React Context. Query `myGrants` to get all active grants for the current user:

```graphql
query MyGrants {
  myGrants {
    id
    resourceType
    resourceId
    permissions
    expiresAt
  }
}
```

Store grants in context and use for client-side permission checks. This avoids repeated API calls.

---

## Part 8: GraphQL Schema & Type Generation

### 8.1 Backend Schema Generation

After creating all resolvers and DTOs:

```bash
cd apps/api
pnpm generate:typings  # Generates schema.gql
```

### 8.2 Frontend Type Generation

After backend schema is updated:

```bash
cd apps/web
pnpm codegen  # Generates TypeScript types from schema.gql
```

### 8.3 Register Enums with GraphQL

Ensure all Prisma enums are registered:

```typescript
// In each module's DTO file
import { registerEnumType } from '@nestjs/graphql';
import {
  SkillType,
  SkillCategory,
  Race,
  EffectFlag /* etc */,
} from '@prisma/client';

registerEnumType(SkillType, { name: 'SkillType' });
registerEnumType(SkillCategory, { name: 'SkillCategory' });
registerEnumType(Race, { name: 'Race' });
registerEnumType(EffectFlag, { name: 'EffectFlag' });
// ... register all enums used in GraphQL
```

---

## Part 9: Testing Strategy

### 9.1 Backend Unit Tests

- `role-calculator.service.spec.ts` - Test level-to-role conversion
- `characters.service.spec.ts` - Test linking/unlinking with role updates
- Test guards: `minimum-role.guard.spec.ts`, `zone-permission.guard.spec.ts`

### 9.2 Backend Integration Tests

- Test character linking flow with role calculation
- Test admin operations with different roles (should succeed/fail appropriately)
- Test zone-based permissions for builders

### 9.3 Frontend E2E Tests (Playwright)

**File**: `tests/character-linking.spec.ts`

- Test character linking UI
- Verify role update in UI
- Test unlinking

**File**: `tests/admin-interfaces.spec.ts`

- Test skills CRUD with HEAD_BUILDER account
- Test spell editing and class-circle assignments
- Test permission denial for lower roles

---

## Part 10: Deployment & Migration

### 10.1 Database Migration

```bash
cd packages/db
pnpm prisma migrate dev --name add_head_builder_role
```

This creates a migration for the new `HEAD_BUILDER` enum value.

### 10.2 Data Backups

Before deploying:

- Backup Users table
- Backup Characters table
- Backup all game system tables (Skills, Spells, Races, Classes)

### 10.3 Rollout Plan

1. Deploy backend with new enum and role calculator
2. Deploy frontend with character linking UI
3. Notify users to link their characters
4. After stabilization, deploy admin interfaces
5. Grant HEAD_BUILDER role to designated builders manually (if needed)

---

## Implementation Order

### Phase 1: Foundation (Days 1-2)

1. Update Prisma schema with HEAD_BUILDER enum
2. Create RoleCalculatorService
3. Update CharactersService for linking/unlinking
4. Create MinimumRoleGuard and ZonePermissionGuard
5. Update AuthService for role recalculation on login

### Phase 2: Character Linking (Days 3-4)

6. Create LinkCharacterDialog component
7. Update Characters page with linking UI
8. Add GraphQL mutations and queries
9. Test linking flow and role updates

### Phase 3: Skills Module (Days 5-6)

10. Create Skills backend module (service, resolver, DTOs)
11. Create Skills frontend pages (list, editor)
12. Test CRUD operations with different roles

### Phase 4: Spells Module (Days 7-9)

13. Create Spells backend module
14. Create Spells frontend pages
15. Implement class-circle assignment UI
16. Test spell effects, targeting, messages

### Phase 5: Races & Classes (Days 10-11)

17. Create Races backend module
18. Create Races frontend pages
19. Create Classes backend module
20. Create Classes frontend pages
21. Test skill/spell associations

### Phase 6: Navigation & Polish (Days 12-13)

22. Update navigation with admin section
23. Implement role-based UI visibility
24. Add zone-permission checks to existing editors
25. Polish UI/UX

### Phase 7: Testing & Documentation (Days 14-15)

26. Write unit tests for role calculator
27. Write integration tests for admin operations
28. Write E2E tests for character linking and admin flows
29. Update user documentation

---

## Permissions Reference Matrix

### Game System Management (Spells, Skills, Classes, Races)

| Operation               | PLAYER | IMMORTAL | BUILDER | HEAD_BUILDER | CODER | GOD |
| ----------------------- | ------ | -------- | ------- | ------------ | ----- | --- |
| **View/List**           | ❌     | ✅       | ✅      | ✅           | ✅    | ✅  |
| **Create New**          | ❌     | ❌       | ❌      | ❌           | ✅    | ✅  |
| **Edit Existing**       | ❌     | ❌       | ❌      | ✅           | ✅    | ✅  |
| **Delete**              | ❌     | ❌       | ❌      | ✅           | ✅    | ✅  |
| **Manage Associations** | ❌     | ❌       | ❌      | ✅           | ✅    | ✅  |
| **Reset/Wipe**          | ❌     | ❌       | ❌      | ❌           | ✅    | ✅  |

**Rationale**:

- IMMORTAL+ can view all game systems for reference and planning
- Creating new game systems requires code changes in FieryMUD to function. Only CODER+ can deploy code.
- Only HEAD_BUILDER+ can edit/delete existing systems

### Zone Content Management (Zones, Rooms, Mobs, Objects, Shops)

| Operation        | PLAYER | IMMORTAL | BUILDER                                   | HEAD_BUILDER   | CODER | GOD |
| ---------------- | ------ | -------- | ----------------------------------------- | -------------- | ----- | --- |
| **View/List**    | ❌     | ❌       | ✅ (granted zones)                        | ✅ (all zones) | ✅    | ✅  |
| **Create**       | ❌     | ❌       | ✅ (granted zones)                        | ✅ (all zones) | ✅    | ✅  |
| **Edit**         | ❌     | ❌       | ✅ (granted zones)                        | ✅ (all zones) | ✅    | ✅  |
| **Delete**       | ❌     | ❌       | ✅ (granted zones with DELETE permission) | ✅ (all zones) | ✅    | ✅  |
| **Reset/Reload** | ❌     | ❌       | ❌                                        | ❌             | ✅    | ✅  |

**Note**: BUILDER access limited to zones granted via `UserGrants` table with WRITE permission. HEAD_BUILDER+ bypass the grants system.

### User & Character Management

| Operation               | PLAYER | IMMORTAL | BUILDER | HEAD_BUILDER | CODER | GOD |
| ----------------------- | ------ | -------- | ------- | ------------ | ----- | --- |
| **Link Own Characters** | ✅     | ✅       | ✅      | ✅           | ✅    | ✅  |
| **View Own Characters** | ✅     | ✅       | ✅      | ✅           | ✅    | ✅  |
| **View All Characters** | ❌     | ❌       | ❌      | ❌           | ✅    | ✅  |
| **Edit Other Users**    | ❌     | ❌       | ❌      | ❌           | ❌    | ✅  |
| **Ban/Unban Users**     | ❌     | ❌       | ❌      | ❌           | ❌    | ✅  |

### Role Hierarchy

```
PLAYER (Level <100)
  ↓
IMMORTAL (Level 100)
  ↓
BUILDER (Level 101-102)  → Zones granted via UserGrants table
  ↓
HEAD_BUILDER (Level 103)  → All zones + Edit game systems + Grant permissions
  ↓
CODER (Level 104)  → Create game systems + Reset operations
  ↓
GOD (Level 105+)  → Unrestricted access
```

---

## Open Questions & TODOs

1. **Character Password Storage**: Characters have `passwordHash` field. Confirm bcrypt is used for validation in `linkCharacterToUser`.

2. **UserGrants Schema**: Confirm the Prisma schema compiles correctly with the new UserGrants model and enum types.

3. **JWT Token Refresh**: When role changes, should we force token refresh? Or require re-login?

4. **Multiple Characters**: If user has multiple characters, max level wins. What if they unlink the highest? Recalculate from remaining.

5. **Legacy Characters**: Characters without `userId` can be linked by anyone with correct password. Should we add "first link locks it" logic?

6. **Audit Logging**: All admin operations (CRUD on spells/skills/etc.) should create audit logs. Confirm audit system is integrated.

7. **Spell Effect Params**: `SpellEffects.params` is JSON. Define schema/validation for different `EffectType` values.

8. **Zone Permission Caching**: For BUILDER users, grant checks require database queries. Cache grants in user context or JWT?

9. **Role Downgrade**: If user unlinks all high-level characters, role downgrades to PLAYER. Is this desired?

10. **Frontend Error Handling**: Graceful degradation if GraphQL queries fail (e.g., spells module unavailable).

---

## Success Criteria

- [ ] Users can create accounts and link game characters
- [ ] User role updates immediately upon character linking
- [ ] Role-based permissions enforced on all admin operations
- [ ] **CODER (104+)** can create new spells, skills, classes, races
- [ ] **HEAD_BUILDER (103+)** can edit/delete existing spells, skills, classes, races
- [ ] **HEAD_BUILDER (103+)** can edit all zones and grant zone permissions to builders
- [ ] **BUILDER (101-102)** can only edit zones granted via `UserGrants` table
- [ ] Spells can be assigned different circles for different classes
- [ ] Skills can be associated with classes and races
- [ ] Frontend UI reflects role-based access (hidden/disabled features)
- [ ] All CRUD operations create audit logs
- [ ] E2E tests pass for character linking and admin flows

---

## File Checklist

### Backend Files to Create

- [ ] `apps/api/src/users/role-calculator.service.ts`
- [ ] `apps/api/src/auth/guards/minimum-role.guard.ts`
- [ ] `apps/api/src/auth/guards/zone-permission.guard.ts`
- [ ] `apps/api/src/auth/decorators/minimum-role.decorator.ts`
- [ ] `apps/api/src/auth/decorators/zone-permission.decorator.ts`
- [ ] `apps/api/src/skills/skills.module.ts`
- [ ] `apps/api/src/skills/skills.service.ts`
- [ ] `apps/api/src/skills/skills.resolver.ts`
- [ ] `apps/api/src/skills/dto/skill.dto.ts`
- [ ] `apps/api/src/skills/dto/skill.input.ts`
- [ ] `apps/api/src/spells/spells.module.ts`
- [ ] `apps/api/src/spells/spells.service.ts`
- [ ] `apps/api/src/spells/spells.resolver.ts`
- [ ] `apps/api/src/spells/dto/spell.dto.ts`
- [ ] `apps/api/src/spells/dto/spell.input.ts`
- [ ] `apps/api/src/races/races.module.ts`
- [ ] `apps/api/src/races/races.service.ts`
- [ ] `apps/api/src/races/races.resolver.ts`
- [ ] `apps/api/src/races/dto/race.dto.ts`
- [ ] `apps/api/src/races/dto/race.input.ts`
- [ ] `apps/api/src/classes/classes.module.ts`
- [ ] `apps/api/src/classes/classes.service.ts`
- [ ] `apps/api/src/classes/classes.resolver.ts`
- [ ] `apps/api/src/classes/dto/class.dto.ts`
- [ ] `apps/api/src/classes/dto/class.input.ts`

### Frontend Files to Create

- [ ] `apps/web/src/components/CharacterLinking/LinkCharacterDialog.tsx`
- [ ] `apps/web/src/hooks/useUserRole.ts`
- [ ] `apps/web/src/app/dashboard/skills/page.tsx`
- [ ] `apps/web/src/app/dashboard/skills/editor/page.tsx`
- [ ] `apps/web/src/app/dashboard/spells/page.tsx`
- [ ] `apps/web/src/app/dashboard/spells/editor/page.tsx`
- [ ] `apps/web/src/app/dashboard/races/page.tsx`
- [ ] `apps/web/src/app/dashboard/races/editor/page.tsx`
- [ ] `apps/web/src/app/dashboard/classes/page.tsx`
- [ ] `apps/web/src/app/dashboard/classes/editor/page.tsx`

### Files to Modify

- [ ] `packages/db/prisma/schema.prisma` (add HEAD_BUILDER enum)
- [ ] `apps/api/src/characters/characters.service.ts` (update linking methods)
- [ ] `apps/api/src/auth/auth.service.ts` (role recalculation on login)
- [ ] `apps/web/src/app/dashboard/characters/page.tsx` (add linking UI)
- [ ] `apps/web/src/app/dashboard/components/Navigation.tsx` (add admin section)

### Test Files to Create

- [ ] `apps/api/src/users/role-calculator.service.spec.ts`
- [ ] `apps/api/src/auth/guards/minimum-role.guard.spec.ts`
- [ ] `apps/api/src/auth/guards/zone-permission.guard.spec.ts`
- [ ] `tests/character-linking.spec.ts`
- [ ] `tests/admin-skills.spec.ts`
- [ ] `tests/admin-spells.spec.ts`

---

## End of Plan Document

This plan will be saved as `/home/strider/Code/mud/muditor/PLAN_CHARACTER_ROLE_SYSTEM.md` for reference across sessions.
