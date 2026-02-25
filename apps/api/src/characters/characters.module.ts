import { Module } from '@nestjs/common';
import { CharactersService } from './characters.service';
import { CharactersResolver } from './characters.resolver';
import { DatabaseModule } from '../database/database.module';
import { UsersModule } from '../users/users.module';
import { RateLimitGuard } from '../bridge/rate-limit.guard';

@Module({
  imports: [DatabaseModule, UsersModule],
  providers: [CharactersService, CharactersResolver, RateLimitGuard],
  exports: [CharactersService],
})
export class CharactersModule {}
