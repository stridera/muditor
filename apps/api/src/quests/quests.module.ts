import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { GrantsModule } from '../grants/grants.module';
import { DatabaseModule } from '../database/database.module';
import { QuestsService } from './quests.service';
import { QuestsResolver } from './quests.resolver';
import { DialogueTreeService } from './dialogue-tree.service';
import { DialogueTreeResolver } from './dialogue-tree.resolver';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule, GrantsModule],
  providers: [
    QuestsService,
    QuestsResolver,
    DialogueTreeService,
    DialogueTreeResolver,
  ],
  exports: [QuestsService],
})
export class QuestsModule {}
