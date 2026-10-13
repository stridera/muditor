import { Module } from '@nestjs/common';
import { MountTypesService } from './mount-types.service';
import { MountTypesResolver } from './mount-types.resolver';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule],
  providers: [MountTypesService, MountTypesResolver],
  exports: [MountTypesService],
})
export class MountTypesModule {}
