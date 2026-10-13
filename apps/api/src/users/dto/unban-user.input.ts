import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class UnbanUserInput {
  @Field(() => ID)
  @IsString()
  userId: string;
}
