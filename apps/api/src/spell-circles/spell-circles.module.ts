import { Module } from '@nestjs/common';
import { SpellCirclesService } from './spell-circles.service';
import { SpellCirclesResolver } from './spell-circles.resolver';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule],
  providers: [SpellCirclesService, SpellCirclesResolver],
  exports: [SpellCirclesService],
})
export class SpellCirclesModule {}
