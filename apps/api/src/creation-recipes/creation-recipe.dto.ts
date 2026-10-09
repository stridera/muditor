import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Ability summary shown on a creation recipe' })
export class CreationRecipeAbilityDto {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;
}

@ObjectType({ description: 'Class summary shown on a creation recipe' })
export class CreationRecipeClassDto {
  @Field(() => ID)
  id: number;

  @Field({ description: 'Display name (may contain color codes)' })
  name: string;

  @Field({ description: 'Plain text name' })
  plainName: string;
}

@ObjectType({
  description:
    'What a creation spell (Minor Creation, Create Food, ...) conjures',
})
export class CreationRecipeDto {
  @Field(() => ID)
  id: number;

  @Field(() => Int)
  abilityId: number;

  @Field(() => CreationRecipeAbilityDto)
  ability: CreationRecipeAbilityDto;

  @Field(() => String, {
    nullable: true,
    description:
      'Word the caster types (matched as an abbreviation in id order); null for spells that take no word',
  })
  keyword?: string | null;

  @Field(() => Int, {
    nullable: true,
    description:
      'Applies to this caster class only; null is the default for every other class',
  })
  classId?: number | null;

  @Field(() => CreationRecipeClassDto, { nullable: true })
  characterClass?: CreationRecipeClassDto | null;

  @Field(() => Int, { description: 'Zone of the object to create' })
  objectZoneId: number;

  @Field(() => Int, {
    nullable: true,
    description:
      'Local object id; null means any FOOD object in the zone, picked by caster skill',
  })
  objectId?: number | null;
}
