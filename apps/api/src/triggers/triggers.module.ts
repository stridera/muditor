import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { GrantsModule } from '../grants/grants.module';
import { TriggersResolver } from './triggers.resolver';
import { TriggersService } from './triggers.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule, GrantsModule],
  providers: [TriggersResolver, TriggersService],
  exports: [TriggersService],
})
export class TriggersModule {}
