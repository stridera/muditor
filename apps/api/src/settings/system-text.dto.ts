import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { SystemTextCategory } from '@prisma/client';

registerEnumType(SystemTextCategory, {
  name: 'SystemTextCategory',
  description: 'Category of system text',
});

@ObjectType({ description: 'System text content (MOTD, news, credits, etc.)' })
export class SystemTextDto {
  @Field(() => ID)
  id: number;

  @Field({ description: 'Unique key identifier' })
  key: string;

  @Field(() => SystemTextCategory, { description: 'Text category' })
  category: SystemTextCategory;

  @Field({ nullable: true, description: 'Display title' })
  title?: string;

  @Field({ description: 'Text content' })
  content: string;

  @Field(() => Int, { description: 'Minimum level to view this text' })
  minLevel: number;

  @Field({ description: 'Whether this text is active' })
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
