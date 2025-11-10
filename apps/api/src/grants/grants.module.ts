import { Module } from '@nestjs/common';
import { GrantsService } from './grants.service';
import { GrantsResolver } from './grants.resolver';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule],
  providers: [GrantsService, GrantsResolver],
  exports: [GrantsService],
})
export class GrantsModule {}
