import { ForbiddenException, UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Field,
  GraphQLISODateTime,
  ID,
  Mutation,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { UserRole } from '@muditor/db';
import type { Users } from '@muditor/db';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminUsersService } from './admin-users.service';
import {
  AdminSetUserDeletedInput,
  AdminSetUserRoleInput,
  AdminUnlinkCharacterInput,
} from './dto/admin-user.input';
import {
  AdminUserAccount,
  PasswordResetLink,
} from './entities/admin-user.entity';
import { BanUserInput } from './dto/ban-user.input';
import { UnbanUserInput } from './dto/unban-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UpdatePreferencesInput } from './dto/update-preferences.input';
import { BanRecord } from './entities/ban-record.entity';
import { User } from './entities/user.entity';
import {
  assertCanViewUserAccount,
  canViewUserAccount,
  type UserViewer,
} from './user-access.util';
import { UsersService } from './users.service';

type GqlCtx = { req?: { user?: UserViewer | null | undefined } };

/** Request user attached by GraphQLJwtAuthGuard, if the request was authenticated. */
function viewerOf(ctx: GqlCtx): UserViewer | null {
  return ctx?.req?.user ?? null;
}

interface CurrentUserContext {
  id: string;
  displayName?: string;
  role?: UserRole;
}

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
  isImplementor: boolean;

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
  constructor(
    private readonly usersService: UsersService,
    private readonly adminUsersService: AdminUsersService
  ) {}

  @Query(() => [User])
  @Roles(UserRole.IMMORTAL)
  @UseGuards(GraphQLJwtAuthGuard, RolesGuard)
  async users(): Promise<User[]> {
    return this.usersService.getAllUsersWithBanStatus();
  }

  @Query(() => User, {
    description: 'A user account. Only the account owner or IMMORTAL+.',
  })
  @UseGuards(GraphQLJwtAuthGuard)
  async user(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: Users
  ): Promise<User> {
    assertCanViewUserAccount(currentUser, id);
    return this.usersService.getUserWithBanStatus(id);
  }

  @Query(() => [AdminUserAccount], {
    description: 'All accounts with link/password/character info (IMMORTAL+)',
  })
  @Roles(UserRole.IMMORTAL)
  @UseGuards(GraphQLJwtAuthGuard, RolesGuard)
  async adminUsers(): Promise<AdminUserAccount[]> {
    return this.adminUsersService.listUsers();
  }

  @Mutation(() => AdminUserAccount, {
    description:
      'Set a user role. CODER: only below own role; IMPLEMENTOR: any role on lower ranks, never on another IMPLEMENTOR (never demotes the last IMPLEMENTOR)',
  })
  @Roles(UserRole.CODER)
  @UseGuards(GraphQLJwtAuthGuard, RolesGuard)
  async adminSetUserRole(
    @Args('input') input: AdminSetUserRoleInput,
    @CurrentUser() currentUser: CurrentUserContext
  ): Promise<AdminUserAccount> {
    return this.adminUsersService.setUserRole(
      currentUser.id,
      input.userId,
      input.role
    );
  }

  @Mutation(() => AdminUserAccount, {
    description: 'Soft-delete or restore a user account',
  })
  @Roles(UserRole.CODER)
  @UseGuards(GraphQLJwtAuthGuard, RolesGuard)
  async adminSetUserDeleted(
    @Args('input') input: AdminSetUserDeletedInput,
    @CurrentUser() currentUser: CurrentUserContext
  ): Promise<AdminUserAccount> {
    return this.adminUsersService.setUserDeleted(
      currentUser.id,
      input.userId,
      input.deleted,
      input.reason
    );
  }

  @Mutation(() => AdminUserAccount, {
    description:
      "Unlink a character from its owner and lower the owner's role if needed",
  })
  @Roles(UserRole.CODER)
  @UseGuards(GraphQLJwtAuthGuard, RolesGuard)
  async adminUnlinkCharacter(
    @Args('input') input: AdminUnlinkCharacterInput,
    @CurrentUser() currentUser: CurrentUserContext
  ): Promise<AdminUserAccount> {
    return this.adminUsersService.unlinkCharacter(
      currentUser.id,
      input.characterId
    );
  }

  @Mutation(() => PasswordResetLink, {
    description:
      'Create a password reset link for a user and return it to the admin',
  })
  @Roles(UserRole.CODER)
  @UseGuards(GraphQLJwtAuthGuard, RolesGuard)
  async adminCreatePasswordResetLink(
    @Args('userId', { type: () => ID }) userId: string,
    @CurrentUser() currentUser: CurrentUserContext
  ): Promise<PasswordResetLink> {
    return this.adminUsersService.createPasswordResetLink(
      currentUser.id,
      userId
    );
  }

  @Query(() => [BanRecord])
  @Roles(UserRole.IMMORTAL)
  @UseGuards(GraphQLJwtAuthGuard, RolesGuard)
  async banHistory(
    @Args('userId', { type: () => ID }) userId: string
  ): Promise<BanRecord[]> {
    return this.usersService.getBanHistory(userId);
  }

  @Mutation(() => User)
  @Roles(UserRole.CODER)
  @UseGuards(GraphQLJwtAuthGuard, RolesGuard)
  async updateUser(
    @Args('input') input: UpdateUserInput,
    @CurrentUser() currentUser: CurrentUserContext
  ): Promise<User> {
    // Rank check before ANY field write (email change = account takeover).
    await this.adminUsersService.assertActorMayManageUser(
      currentUser.id,
      input.id
    );
    // Role changes go through the same rank rules as the admin users page
    // (a CODER must not be able to mint IMPLEMENTORs through this mutation).
    if (input.role) {
      await this.adminUsersService.setUserRole(
        currentUser.id,
        input.id,
        input.role
      );
    }
    return this.usersService.updateUser(input);
  }

  @Mutation(() => BanRecord)
  @Roles(UserRole.IMMORTAL)
  @UseGuards(GraphQLJwtAuthGuard, RolesGuard)
  async banUser(
    @Args('input') input: BanUserInput,
    @CurrentUser() currentUser: CurrentUserContext
  ): Promise<BanRecord> {
    return this.usersService.banUser(input, currentUser.id);
  }

  @Mutation(() => BanRecord)
  @Roles(UserRole.IMMORTAL)
  @UseGuards(GraphQLJwtAuthGuard, RolesGuard)
  async unbanUser(
    @Args('input') input: UnbanUserInput,
    @CurrentUser() currentUser: CurrentUserContext
  ): Promise<BanRecord> {
    return this.usersService.unbanUser(input.userId, currentUser.id);
  }

  // Sensitive User fields: only the account itself or IMMORTAL+ may read them.

  @ResolveField(() => String)
  email(@Parent() user: User, @Context() ctx: GqlCtx): string {
    if (!canViewUserAccount(viewerOf(ctx), user)) {
      throw new ForbiddenException('You do not have access to this account');
    }
    return user.email;
  }

  @ResolveField(() => GraphQLISODateTime, { nullable: true })
  lastLoginAt(@Parent() user: User, @Context() ctx: GqlCtx): Date | null {
    if (!canViewUserAccount(viewerOf(ctx), user)) return null;
    return user.lastLoginAt ?? null;
  }

  @ResolveField(() => [BanRecord], { nullable: true })
  async banRecords(
    @Parent() user: User,
    @Context() ctx: GqlCtx
  ): Promise<BanRecord[] | null> {
    if (!canViewUserAccount(viewerOf(ctx), user)) return null;
    return this.usersService.getBanHistory(user.id);
  }

  @Query(() => UserPermissions, { name: 'myPermissions' })
  @UseGuards(GraphQLJwtAuthGuard)
  async getMyPermissions(
    @CurrentUser() user: CurrentUserContext
  ): Promise<UserPermissions> {
    const full = await this.usersService.findOne(user.id);
    return this.usersService.getUserPermissions(full);
  }

  @Query(() => UserPermissions, { name: 'userPermissions' })
  @Roles(UserRole.IMMORTAL)
  @UseGuards(GraphQLJwtAuthGuard, RolesGuard)
  async getUserPermissions(
    @Args('userId', { type: () => ID }) userId: string
  ): Promise<UserPermissions> {
    const user = await this.usersService.findOne(userId);
    return this.usersService.getUserPermissions(user);
  }

  @Mutation(() => User)
  @UseGuards(GraphQLJwtAuthGuard)
  async updateUserPreferences(
    @Args('input') input: UpdatePreferencesInput,
    @CurrentUser() currentUser: CurrentUserContext
  ): Promise<User> {
    return this.usersService.updateUserPreferences(currentUser.id, input);
  }
}
