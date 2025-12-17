import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { Position } from '@prisma/client';

// Register Position enum for GraphQL (may already be registered elsewhere)
registerEnumType(Position, { name: 'Position' });

@ObjectType({ description: 'Social command (emote/action)' })
export class SocialDto {
  @Field(() => ID)
  id: number;

  @Field({ description: 'Command name (e.g., smile, bow, hug)' })
  name: string;

  @Field({ description: 'Hide who initiated the action' })
  hide: boolean;

  @Field(() => Position, { description: 'Minimum position for the target' })
  minVictimPosition: Position;

  // No argument messages
  @Field({ nullable: true, description: 'Message to actor when no target' })
  charNoArg?: string;

  @Field({ nullable: true, description: 'Message to room when no target' })
  othersNoArg?: string;

  // Target found messages
  @Field({ nullable: true, description: 'Message to actor when target found' })
  charFound?: string;

  @Field({
    nullable: true,
    description: 'Message to room (excluding target) when target found',
  })
  othersFound?: string;

  @Field({ nullable: true, description: 'Message to target' })
  victFound?: string;

  // Target not found
  @Field({ nullable: true, description: 'Message when target not found' })
  notFound?: string;

  // Self-targeting messages
  @Field({
    nullable: true,
    description: 'Message to actor when targeting self',
  })
  charAuto?: string;

  @Field({
    nullable: true,
    description: 'Message to room when actor targets self',
  })
  othersAuto?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
