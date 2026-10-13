import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { GrantsModule } from '../grants/grants.module';
import { DatabaseModule } from '../database/database.module';
import { ObjectsService } from './objects.service';
import { ObjectsResolver } from './objects.resolver';
import { ObjectAbilitiesService } from './object-abilities.service';
import { ObjectAbilitiesResolver } from './object-abilities.resolver';
import { ObjectResetService } from './object-reset.service';
import { ObjectResetResolver } from './object-reset.resolver';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule, GrantsModule],
  providers: [
    ObjectsService,
    ObjectsResolver,
    ObjectResetService,
    ObjectResetResolver,
    ObjectAbilitiesService,
    ObjectAbilitiesResolver,
  ],
  exports: [ObjectsService, ObjectResetService],
})
export class ObjectsModule {}
