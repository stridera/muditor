import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType({ description: 'Level definition with experience and permissions' })
export class LevelDefinitionDto {
  @Field(() => Int, { description: 'Level number (1-105)' })
  level: number;

  @Field({ nullable: true, description: 'Display name for immortal levels' })
  name?: string;

  @Field(() => Int, { description: 'Experience required to reach this level' })
  expRequired: number;

  @Field(() => Int, { description: 'HP gained at this level' })
  hpGain: number;

  @Field(() => Int, { description: 'Stamina gained at this level' })
  staminaGain: number;

  @Field({ description: 'Whether this is an immortal level (100+)' })
  isImmortal: boolean;

  @Field(() => [String], { description: 'Permissions granted at this level' })
  permissions: string[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
