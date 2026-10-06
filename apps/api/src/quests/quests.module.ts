import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { GrantsModule } from '../grants/grants.module';
import { DatabaseModule } from '../database/database.module';
import { QuestsService } from './quests.service';
import { QuestsResolver } from './quests.resolver';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule, GrantsModule],
  providers: [QuestsService, QuestsResolver],
  exports: [QuestsService],
})
export class QuestsModule {}
