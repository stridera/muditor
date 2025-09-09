import {
  Resolver,
  Query,
  Args,
  ID,
  Mutation,
  ResolveField,
  Parent,
  ObjectType,
  Field,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { BanRecord } from './entities/ban-record.entity';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { UpdateUserInput } from './dto/update-user.input';
import { BanUserInput } from './dto/ban-user.input';
import { UnbanUserInput } from './dto/unban-user.input';

@ObjectType()
export class UserPermissions {
  @Field()
  isPlayer: boolean;

  @Field()
  isImmortal: boolean;

  @Field()
  isBuilder: boolean;

  @Field()
  isCoder: boolean;

  @Field()
  isGod: boolean;

  @Field()
  canAccessDashboard: boolean;

  @Field()
  canManageUsers: boolean;

  @Field()
  canViewValidation: boolean;

  @Field()
  maxCharacterLevel: number;

  @Field(() => UserRole)
  role: UserRole;
}

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User])
  @Roles(UserRole.IMMORTAL, UserRole.CODER, UserRole.GOD)
  @UseGuards(GraphQLJwtAuthGuard, RolesGuard)
  async users(): Promise<User[]> {
    return this.usersService.getAllUsersWithBanStatus();
  }

  @Query(() => User)
  async user(@Args('id', { type: () => ID }) id: string): Promise<User> {
    return this.usersService.getUserWithBanStatus(id);
  }

  @Query(() => [BanRecord])
  @Roles(UserRole.IMMORTAL, UserRole.CODER, UserRole.GOD)
  @UseGuards(GraphQLJwtAuthGuard, RolesGuard)
  async banHistory(
    @Args('userId', { type: () => ID }) userId: string
  ): Promise<BanRecord[]> {
    return this.usersService.getBanHistory(userId);
  }

  @Mutation(() => User)
  @Roles(UserRole.CODER, UserRole.GOD)
  @UseGuards(GraphQLJwtAuthGuard, RolesGuard)
  async updateUser(@Args('input') input: UpdateUserInput): Promise<User> {
    return this.usersService.updateUser(input);
  }

  @Mutation(() => BanRecord)
  @Roles(UserRole.IMMORTAL, UserRole.CODER, UserRole.GOD)
  @UseGuards(GraphQLJwtAuthGuard, RolesGuard)
  async banUser(
    @Args('input') input: BanUserInput,
    @CurrentUser() currentUser: any
  ): Promise<BanRecord> {
    return this.usersService.banUser(input, currentUser.id);
  }

  @Mutation(() => BanRecord)
  @Roles(UserRole.IMMORTAL, UserRole.CODER, UserRole.GOD)
  @UseGuards(GraphQLJwtAuthGuard, RolesGuard)
  async unbanUser(
    @Args('input') input: UnbanUserInput,
    @CurrentUser() currentUser: any
  ): Promise<BanRecord> {
    return this.usersService.unbanUser(input.userId, currentUser.id);
  }

  @ResolveField(() => [BanRecord])
  async banRecords(@Parent() user: User): Promise<BanRecord[]> {
    return this.usersService.getBanHistory(user.id);
  }

  @Query(() => UserPermissions, { name: 'myPermissions' })
  @UseGuards(GraphQLJwtAuthGuard)
  async getMyPermissions(@CurrentUser() user: any): Promise<UserPermissions> {
    return this.usersService.getUserPermissions(user);
  }

  @Query(() => UserPermissions, { name: 'userPermissions' })
  @Roles(UserRole.IMMORTAL, UserRole.CODER, UserRole.GOD)
  @UseGuards(GraphQLJwtAuthGuard, RolesGuard)
  async getUserPermissions(
    @Args('userId', { type: () => ID }) userId: string
  ): Promise<UserPermissions> {
    const user = await this.usersService.findOne(userId);
    return this.usersService.getUserPermissions(user);
  }
}
