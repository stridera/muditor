import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { BoardsService } from './boards.service';
import { BoardsResolver, BoardMessagesResolver } from './boards.resolver';

@Module({
  imports: [DatabaseModule],
  providers: [BoardsService, BoardsResolver, BoardMessagesResolver],
  exports: [BoardsService],
})
export class BoardsModule {}
