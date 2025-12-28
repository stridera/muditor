import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { ConfigValueType } from '@prisma/client';

registerEnumType(ConfigValueType, {
  name: 'ConfigValueType',
  description: 'Type of configuration value',
});

@ObjectType({ description: 'Game configuration entry' })
export class GameConfigDto {
  @Field(() => ID)
  id: number;

  @Field({
    description: 'Configuration category (e.g., server, combat, progression)',
  })
  category: string;

  @Field({ description: 'Configuration key within category' })
  key: string;

  @Field({ description: 'Configuration value as string' })
  value: string;

  @Field(() => ConfigValueType, { description: 'Type of the value' })
  valueType: ConfigValueType;

  @Field({ nullable: true, description: 'Human-readable description' })
  description?: string;

  @Field({ nullable: true, description: 'Minimum valid value' })
  minValue?: string;

  @Field({ nullable: true, description: 'Maximum valid value' })
  maxValue?: string;

  @Field({ description: 'Whether this config contains sensitive data' })
  isSecret: boolean;

  @Field({ description: 'Whether changing this requires server restart' })
  restartReq: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
