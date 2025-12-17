import { Module } from '@nestjs/common';
import { SocialsService } from './socials.service';
import { SocialsResolver } from './socials.resolver';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule],
  providers: [SocialsService, SocialsResolver],
  exports: [SocialsService],
})
export class SocialsModule {}
