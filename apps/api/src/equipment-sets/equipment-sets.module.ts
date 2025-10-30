import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { EquipmentSetsService } from './equipment-sets.service';
import { EquipmentSetsResolver } from './equipment-sets.resolver';

@Module({
  imports: [DatabaseModule],
  providers: [EquipmentSetsService, EquipmentSetsResolver],
  exports: [EquipmentSetsService],
})
export class EquipmentSetsModule {}