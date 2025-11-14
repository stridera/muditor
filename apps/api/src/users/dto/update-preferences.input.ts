import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class RoomReferenceInput {
  @Field(() => Int)
  zoneId: number;

  @Field(() => Int)
  vnum: number;
}

@InputType()
export class UpdatePreferencesInput {
  @Field({ nullable: true, description: 'Theme preference: light, dark, or system' })
  theme?: string;

  @Field({ nullable: true, description: 'View mode preference: player or admin' })
  viewMode?: string;

  @Field(() => [Int], { nullable: true, description: 'List of favorite zone IDs' })
  favoriteZones?: number[];

  @Field(() => [Int], { nullable: true, description: 'Recently visited zone IDs' })
  recentZones?: number[];

  @Field(() => [RoomReferenceInput], { nullable: true, description: 'Recently visited rooms' })
  recentRooms?: RoomReferenceInput[];
}
