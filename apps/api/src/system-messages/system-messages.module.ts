import { Module } from '@nestjs/common';
import { SystemMessagesService } from './system-messages.service';
import { SystemMessagesResolver } from './system-messages.resolver';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule],
  providers: [SystemMessagesService, SystemMessagesResolver],
  exports: [SystemMessagesService],
})
export class SystemMessagesModule {}
