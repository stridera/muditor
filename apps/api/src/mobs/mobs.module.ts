import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { MobsService } from './mobs.service';
import { MobsResolver } from './mobs.resolver';
import { MobResetService } from './mob-reset.service';
import { MobResetResolver } from './mob-reset.resolver';

@Module({
  imports: [DatabaseModule],
  providers: [MobsService, MobsResolver, MobResetService, MobResetResolver],
  exports: [MobsService, MobResetService],
})
export class MobsModule {}
