import { Module } from '@nestjs/common';
import { ValidationService } from './validation.service';
import { ValidationResolver } from './validation.resolver';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [ValidationService, ValidationResolver],
  exports: [ValidationService],
})
export class ValidationModule {}
