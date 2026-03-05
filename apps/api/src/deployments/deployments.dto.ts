import {
  Field,
  ID,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { DeploymentStatus } from '@muditor/db';

registerEnumType(DeploymentStatus, {
  name: 'DeploymentStatus',
  description: 'Status of a deployment package',
});

@ObjectType()
export class DeploymentChangeDto {
  @Field(() => Int)
  id: number;

  @Field()
  packageId: string;

  @Field()
  entityType: string;

  @Field()
  entityKey: string;

  @Field()
  changeType: string;

  @Field(() => GraphQLJSON, { nullable: true })
  beforeSnapshot: unknown | null;

  @Field(() => GraphQLJSON, { nullable: true })
  afterSnapshot: unknown | null;
}

@ObjectType()
export class DeploymentPackageDto {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => DeploymentStatus)
  status: DeploymentStatus;

  @Field(() => [Int])
  zoneIds: number[];

  @Field()
  createdBy: string;

  @Field(() => Date, { nullable: true })
  deployedAt: Date | null;

  @Field(() => GraphQLJSON, { nullable: true })
  snapshotData: unknown | null;

  @Field(() => [DeploymentChangeDto])
  changes: DeploymentChangeDto[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class CreateDeploymentInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [Int])
  zoneIds: number[];
}
