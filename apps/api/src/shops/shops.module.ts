import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { GrantsModule } from '../grants/grants.module';
import { DatabaseModule } from '../database/database.module';
import { ShopsService } from './shops.service';
import { ShopsResolver } from './shops.resolver';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule, GrantsModule],
  providers: [ShopsService, ShopsResolver],
  exports: [ShopsService],
})
export class ShopsModule {}
