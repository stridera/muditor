import { Module } from '@nestjs/common';
import { CreationRecipesService } from './creation-recipes.service';
import { CreationRecipesResolver } from './creation-recipes.resolver';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule],
  providers: [CreationRecipesService, CreationRecipesResolver],
  exports: [CreationRecipesService],
})
export class CreationRecipesModule {}
