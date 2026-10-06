import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserRole, type Users } from '@muditor/db';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MinimumRole } from '../auth/decorators/minimum-role.decorator';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { MinimumRoleGuard } from '../auth/guards/minimum-role.guard';
import {
  AccountLockStatus,
  CharacterPasswordStatus,
  GameLoginCodeDto,
} from './game-login.dto';
import { GameLoginService } from './game-login.service';

@Resolver()
export class GameLoginResolver {
  constructor(private readonly gameLogin: GameLoginService) {}

  @Query(() => GameLoginCodeDto, {
    name: 'gameLoginCode',
    description:
      'Look up a pending game login code (ABCD-EFGH) shown at the telnet prompt',
  })
  @UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
  @MinimumRole(UserRole.PLAYER)
  async gameLoginCode(@Args('code') code: string, @CurrentUser() user: Users) {
    return this.gameLogin.lookup(code, user.id);
  }

  @Mutation(() => GameLoginCodeDto, {
    description:
      'Approve a pending game login for one of your characters. For a character not yet linked to any account, characterPassword (its game password) is required and the character is linked to you',
  })
  @UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
  @MinimumRole(UserRole.PLAYER)
  async approveGameLogin(
    @Args('code') code: string,
    @Args('characterPassword', { type: () => String, nullable: true })
    characterPassword: string | null | undefined,
    @CurrentUser() user: Users
  ) {
    return this.gameLogin.approve(code, user.id, characterPassword);
  }

  @Mutation(() => Boolean, {
    description: 'Deny a pending game login request',
  })
  @UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
  @MinimumRole(UserRole.PLAYER)
  async denyGameLogin(@Args('code') code: string, @CurrentUser() user: Users) {
    return this.gameLogin.deny(code, user.id);
  }

  @Query(() => [CharacterPasswordStatus], {
    description: 'Per-character game password status',
  })
  @UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
  @MinimumRole(UserRole.PLAYER)
  async gamePasswordStatus(@CurrentUser() user: Users) {
    return this.gameLogin.gamePasswordStatus(user.id);
  }

  @Mutation(() => Boolean, {
    description:
      'Set the game password (Characters.passwordHash) for all your characters, or one when characterName is given. Must differ from the website password',
  })
  @UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
  @MinimumRole(UserRole.PLAYER)
  async setGamePassword(
    @Args('password') password: string,
    @Args('characterName', { type: () => String, nullable: true })
    characterName: string | null | undefined,
    @CurrentUser() user: Users
  ) {
    return this.gameLogin.setGamePassword(user.id, password, characterName);
  }

  @Query(() => AccountLockStatus, {
    description: 'Game-side account lock and character-link lockout state',
  })
  @UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
  @MinimumRole(UserRole.PLAYER)
  async accountLockStatus(@CurrentUser() user: Users) {
    return this.gameLogin.accountLockStatus(user.id);
  }

  @Mutation(() => AccountLockStatus, {
    description:
      'Clear your game-side account lock and character-link lockouts (does not affect staff bans)',
  })
  @UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
  @MinimumRole(UserRole.PLAYER)
  async clearAccountLock(
    @CurrentUser() user: Users,
    @Context() ctx: { req?: { ip?: string } }
  ) {
    return this.gameLogin.clearAccountLock(user.id, ctx.req?.ip);
  }
}
