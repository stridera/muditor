import { Module } from '@nestjs/common';
import { EffectAurasService } from './effect-auras.service';
import { EffectAurasResolver } from './effect-auras.resolver';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule],
  providers: [EffectAurasService, EffectAurasResolver],
  exports: [EffectAurasService],
})
export class EffectAurasModule {}
