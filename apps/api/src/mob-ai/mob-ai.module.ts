import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { GrantsModule } from '../grants/grants.module';
import { UsersModule } from '../users/users.module';
import { ClassAiRulesResolver } from './class-ai-rules.resolver';
import { MobAiRulesResolver } from './mob-ai-rules.resolver';
import { MobAiService } from './mob-ai.service';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule, GrantsModule],
  providers: [MobAiService, ClassAiRulesResolver, MobAiRulesResolver],
  exports: [MobAiService],
})
export class MobAiModule {}
