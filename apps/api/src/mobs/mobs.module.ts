import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { MobsService } from './mobs.service';
import { MobsResolver } from './mobs.resolver';

@Module({
  imports: [DatabaseModule],
  providers: [MobsService, MobsResolver],
  exports: [MobsService],
})
export class MobsModule {}