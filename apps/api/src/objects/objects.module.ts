import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ObjectsService } from './objects.service';
import { ObjectsResolver } from './objects.resolver';

@Module({
  imports: [DatabaseModule],
  providers: [ObjectsService, ObjectsResolver],
  exports: [ObjectsService],
})
export class ObjectsModule {}