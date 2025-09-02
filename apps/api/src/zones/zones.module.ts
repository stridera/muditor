import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ZonesService } from './zones.service';
import { ZonesResolver } from './zones.resolver';

@Module({
  imports: [DatabaseModule],
  providers: [ZonesService, ZonesResolver],
  exports: [ZonesService],
})
export class ZonesModule {}