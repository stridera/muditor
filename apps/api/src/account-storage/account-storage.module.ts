import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AccountStorageResolver } from './account-storage.resolver';
import { AccountStorageService } from './account-storage.service';

@Module({
  imports: [DatabaseModule],
  providers: [AccountStorageService, AccountStorageResolver],
  exports: [AccountStorageService],
})
export class AccountStorageModule {}
