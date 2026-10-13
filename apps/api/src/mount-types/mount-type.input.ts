import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export const MAX_MOUNT_LEVEL = 105;
export const MAX_MOUNT_ALIGNMENT = 1000;
export const MAX_MOUNT_BONUS = 10_000;

@InputType({
  description:
    'Fields of a summon-mount tier that can be edited (tier and alignment side identify the row)',
})
export class UpdateMountTypeInput {
  @Field(() => Int)
  @IsInt()
  id: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_MOUNT_LEVEL)
  minLevel?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_MOUNT_ALIGNMENT)
  minAlignment?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  mobZoneId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  mobId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_MOUNT_BONUS)
  hpBonus?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_MOUNT_BONUS)
  mvBonus?: number;
}
