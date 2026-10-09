import { Module } from '@nestjs/common';
import { SpellSyllablesService } from './spell-syllables.service';
import { SpellSyllablesResolver } from './spell-syllables.resolver';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule],
  providers: [SpellSyllablesService, SpellSyllablesResolver],
  exports: [SpellSyllablesService],
})
export class SpellSyllablesModule {}
