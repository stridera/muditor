import { Module } from '@nestjs/common';
import { StatusFlagValuesService } from './status-flag-values.service';
import { StatusFlagValuesResolver } from './status-flag-values.resolver';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule],
  providers: [StatusFlagValuesService, StatusFlagValuesResolver],
  exports: [StatusFlagValuesService],
})
export class StatusFlagValuesModule {}
