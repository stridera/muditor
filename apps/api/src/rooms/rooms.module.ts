import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { GrantsModule } from '../grants/grants.module';
import { RoomsService } from './rooms.service';
import { RoomsResolver } from './rooms.resolver';
import { DatabaseModule } from '../database/database.module';
import { ShopsModule } from '../shops/shops.module';

@Module({
  imports: [DatabaseModule, ShopsModule, AuthModule, UsersModule, GrantsModule],
  providers: [RoomsService, RoomsResolver],
  exports: [RoomsService],
})
export class RoomsModule {}
