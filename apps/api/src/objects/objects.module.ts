import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ObjectsService } from './objects.service';
import { ObjectsResolver } from './objects.resolver';
import { ObjectResetService } from './object-reset.service';
import { ObjectResetResolver } from './object-reset.resolver';

@Module({
  imports: [DatabaseModule],
  providers: [
    ObjectsService,
    ObjectsResolver,
    ObjectResetService,
    ObjectResetResolver,
  ],
  exports: [ObjectsService, ObjectResetService],
})
export class ObjectsModule {}
