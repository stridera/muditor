import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import type { Users } from '@muditor/db';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { AccountStorageDto, WealthDisplayDto } from './account-storage.dto';
import { AccountStorageService } from './account-storage.service';

@Resolver()
@UseGuards(GraphQLJwtAuthGuard)
export class AccountStorageResolver {
  constructor(private readonly accountStorageService: AccountStorageService) {}

  // ============================================================================
  // QUERIES (read-only).
  // Item and wealth movement is deliberately NOT exposed here: the game is the
  // source of truth (chest/bank commands). Web-side writes can mint or duplicate
  // value against the game's in-memory state.
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
}
