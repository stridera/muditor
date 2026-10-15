import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { GrantsModule } from '../grants/grants.module';
import { UsersModule } from '../users/users.module';
import { ScriptLibrariesResolver } from './script-libraries.resolver';
import { ScriptLibrariesService } from './script-libraries.service';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule, GrantsModule],
  providers: [ScriptLibrariesResolver, ScriptLibrariesService],
})
export class ScriptLibrariesModule {}
