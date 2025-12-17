import { Module } from '@nestjs/common';
import { HelpService } from './help.service';
import { HelpResolver } from './help.resolver';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule],
  providers: [HelpService, HelpResolver],
  exports: [HelpService],
})
export class HelpModule {}
