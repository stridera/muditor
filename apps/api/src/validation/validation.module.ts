import { Module } from '@nestjs/common';
import { ValidationService } from './validation.service';
import { ValidationResolver } from './validation.resolver';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule],
  providers: [ValidationService, ValidationResolver],
  exports: [ValidationService],
})
export class ValidationModule {}
