import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsResolver } from './rooms.resolver';
import { DatabaseModule } from '../database/database.module';
import { ShopsModule } from '../shops/shops.module';

@Module({
  imports: [DatabaseModule, ShopsModule],
  providers: [RoomsService, RoomsResolver],
  exports: [RoomsService],
})
export class RoomsModule {}