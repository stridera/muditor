import { Module } from '@nestjs/common';
import { TriggersResolver } from './triggers.resolver';
import { TriggersService } from './triggers.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [TriggersResolver, TriggersService],
  exports: [TriggersService],
})
export class TriggersModule {}
