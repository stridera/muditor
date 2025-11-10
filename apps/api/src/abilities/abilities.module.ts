import { Module } from '@nestjs/common';
import { AbilitiesResolver } from './abilities.resolver';
import { AbilitiesService } from './abilities.service';
import { DatabaseModule } from '../database/database.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [DatabaseModule, UsersModule],
  providers: [AbilitiesResolver, AbilitiesService],
  exports: [AbilitiesService],
})
export class AbilitiesModule {}
