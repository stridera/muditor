import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt } from 'class-validator';

/** Composite primary key (zoneId, id) of a world entity */
@InputType()
export class EntityKeyInput {
  @Field(() => Int)
  @IsInt()
  zoneId: number;

  @Field(() => Int)
  @IsInt()
  id: number;
}
