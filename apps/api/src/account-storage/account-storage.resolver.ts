import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { Users } from '@prisma/client';
import { BigIntResolver } from 'graphql-scalars';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import {
  AccountItemDto,
  AccountStorageDto,
  WealthDisplayDto,
} from './account-storage.dto';
import { AccountStorageService } from './account-storage.service';

@Resolver()
@UseGuards(GraphQLJwtAuthGuard)
export class AccountStorageResolver {
  constructor(private readonly accountStorageService: AccountStorageService) {}

  // ============================================================================
  // QUERIES
  // ============================================================================

  @Query(() => AccountStorageDto, { name: 'myAccountStorage' })
  async getMyStorage(@CurrentUser() user: Users): Promise<AccountStorageDto> {
    return this.accountStorageService.getAccountStorage(user.id);
  }

  @Query(() => WealthDisplayDto, { name: 'myAccountWealthDisplay' })
  async getMyWealthDisplay(
    @CurrentUser() user: Users
  ): Promise<WealthDisplayDto> {
    const storage = await this.accountStorageService.getAccountStorage(user.id);
    return this.accountStorageService.wealthToDisplay(storage.accountWealth);
  }

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  @Mutation(() => AccountItemDto)
  async depositItem(
    @Args('characterId') characterId: string,
    @Args('objectZoneId', { type: () => Int }) objectZoneId: number,
    @Args('objectId', { type: () => Int }) objectId: number,
    @Args('quantity', { type: () => Int, defaultValue: 1 }) quantity: number,
    @CurrentUser() user: Users
  ): Promise<AccountItemDto> {
    return this.accountStorageService.depositItem(
      user.id,
      characterId,
      objectZoneId,
      objectId,
      quantity
    );
  }

  @Mutation(() => Boolean)
  async withdrawItem(
    @Args('accountItemId', { type: () => Int }) accountItemId: number,
    @Args('characterId') characterId: string,
    @CurrentUser() user: Users
  ): Promise<boolean> {
    return this.accountStorageService.withdrawItem(
      user.id,
      accountItemId,
      characterId
    );
  }

  @Mutation(() => BigIntResolver)
  async depositWealth(
    @Args('characterId') characterId: string,
    @Args('amount', { type: () => BigIntResolver }) amount: bigint,
    @CurrentUser() user: Users
  ): Promise<bigint> {
    return this.accountStorageService.depositWealth(
      user.id,
      characterId,
      amount
    );
  }

  @Mutation(() => BigIntResolver)
  async withdrawWealth(
    @Args('characterId') characterId: string,
    @Args('amount', { type: () => BigIntResolver }) amount: bigint,
    @CurrentUser() user: Users
  ): Promise<bigint> {
    return this.accountStorageService.withdrawWealth(
      user.id,
      characterId,
      amount
    );
  }
}
