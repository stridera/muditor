import { Module } from '@nestjs/common';
import { ReservedNamesService } from './reserved-names.service';
import { ReservedNamesResolver } from './reserved-names.resolver';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule],
  providers: [ReservedNamesService, ReservedNamesResolver],
  exports: [ReservedNamesService],
})
export class ReservedNamesModule {}
