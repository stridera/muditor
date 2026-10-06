import { Module } from '@nestjs/common';
import { SiteContentService } from './site-content.service';
import { SiteContentResolver } from './site-content.resolver';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule],
  providers: [SiteContentService, SiteContentResolver],
  exports: [SiteContentService],
})
export class SiteContentModule {}
