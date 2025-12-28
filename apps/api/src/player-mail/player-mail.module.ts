import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { UsersModule } from '../users/users.module';
import { PlayerMailResolver } from './player-mail.resolver';
import { PlayerMailService } from './player-mail.service';

@Module({
  imports: [DatabaseModule, UsersModule],
  providers: [PlayerMailService, PlayerMailResolver],
  exports: [PlayerMailService],
})
export class PlayerMailModule {}
