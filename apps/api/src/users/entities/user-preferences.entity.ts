import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RoomReference {
  @Field(() => Int)
  zoneId: number;

  @Field(() => Int)
  vnum: number;
}

@ObjectType()
export class UserPreferences {
  @Field({ nullable: true, description: 'Theme preference: light, dark, or system' })
  theme?: string;

  @Field({ nullable: true, description: 'View mode preference: player or admin' })
  viewMode?: string;

  @Field(() => [Int], { nullable: true, description: 'List of favorite zone IDs' })
  favoriteZones?: number[];

  @Field(() => [Int], { nullable: true, description: 'Recently visited zone IDs (max 5)' })
  recentZones?: number[];

  @Field(() => [RoomReference], { nullable: true, description: 'Recently visited rooms (max 10)' })
  recentRooms?: RoomReference[];
}
