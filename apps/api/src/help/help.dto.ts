import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType({ description: 'Help entry for in-game documentation' })
export class HelpEntryDto {
  @Field(() => ID)
  id: number;

  @Field(() => [String], {
    description: 'Keywords for looking up this help entry',
  })
  keywords: string[];

  @Field({ description: 'Primary display title' })
  title: string;

  @Field({ description: 'Full help text content' })
  content: string;

  @Field(() => Int, {
    description: 'Minimum player level to view (0 = all, 100+ = immortal only)',
  })
  minLevel: number;

  @Field({
    nullable: true,
    description: 'Category (e.g., spell, skill, command, class, area)',
  })
  category?: string;

  @Field({ nullable: true, description: 'Usage syntax' })
  usage?: string;

  @Field({ nullable: true, description: 'Duration description' })
  duration?: string;

  @Field({
    nullable: true,
    description: 'Spell sphere (fire, water, healing, etc.)',
  })
  sphere?: string;

  @Field(() => GraphQLJSON, {
    nullable: true,
    description: 'Class/circle requirements (e.g., {"Pyromancer": 7})',
  })
  classes?: Record<string, number>;

  @Field({ nullable: true, description: 'Original help file this came from' })
  sourceFile?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
