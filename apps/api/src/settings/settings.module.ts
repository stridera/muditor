import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsResolver } from './settings.resolver';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule],
  providers: [SettingsService, SettingsResolver],
  exports: [SettingsService],
})
export class SettingsModule {}
