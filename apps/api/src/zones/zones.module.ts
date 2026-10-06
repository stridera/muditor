import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { GrantsModule } from '../grants/grants.module';
import { DatabaseModule } from '../database/database.module';
import { ZonesService } from './zones.service';
import { ZonesResolver } from './zones.resolver';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule, GrantsModule],
  providers: [ZonesService, ZonesResolver],
  exports: [ZonesService],
})
export class ZonesModule {}
