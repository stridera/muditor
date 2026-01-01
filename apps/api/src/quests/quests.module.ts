import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { QuestsService } from './quests.service';
import { QuestsResolver } from './quests.resolver';

@Module({
  imports: [DatabaseModule],
  providers: [QuestsService, QuestsResolver],
  exports: [QuestsService],
})
export class QuestsModule {}
