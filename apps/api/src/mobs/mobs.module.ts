import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { GrantsModule } from '../grants/grants.module';
import { DatabaseModule } from '../database/database.module';
import { MobsService } from './mobs.service';
import { MobsResolver } from './mobs.resolver';
import { MobResetService } from './mob-reset.service';
import { MobResetResolver } from './mob-reset.resolver';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule, GrantsModule],
  providers: [MobsService, MobsResolver, MobResetService, MobResetResolver],
  exports: [MobsService, MobResetService],
})
export class MobsModule {}
