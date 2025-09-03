import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ShopsService } from './shops.service';
import { ShopsResolver } from './shops.resolver';

@Module({
  imports: [DatabaseModule],
  providers: [ShopsService, ShopsResolver],
  exports: [ShopsService],
})
export class ShopsModule {}