import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { CommandCategory } from '@prisma/client';

// Register the enum for GraphQL
registerEnumType(CommandCategory, {
  name: 'CommandCategory',
  description: 'Category of MUD commands',
});

@ObjectType({
  description: 'MUD command definition with permission requirements',
})
export class CommandDto {
  @Field({ description: 'Primary command name' })
  name: string;

  @Field(() => [String], {
    description: 'Alternative names/aliases for the command',
  })
  aliases: string[];

  @Field(() => CommandCategory, {
    description: 'Command category for organization',
  })
  category: CommandCategory;

  @Field({
    nullable: true,
    description: 'Brief description of what the command does',
  })
  description?: string;

  @Field({ nullable: true, description: 'Usage syntax example' })
  usage?: string;

  @Field({ description: 'Whether this command requires an immortal level' })
  immortalOnly: boolean;

  @Field(() => [String], {
    description: 'Permission flags required to use this command',
  })
  permissions: string[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
