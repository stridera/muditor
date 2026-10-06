import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { CharactersModule } from '../characters/characters.module';
import { UsersModule } from '../users/users.module';
import { GameLoginService } from './game-login.service';
import { GameLoginResolver } from './game-login.resolver';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule, CharactersModule],
  providers: [GameLoginService, GameLoginResolver],
  exports: [GameLoginService],
})
export class GameLoginModule {}
