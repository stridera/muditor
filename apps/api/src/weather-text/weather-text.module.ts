import { Module } from '@nestjs/common';
import { WeatherTextService } from './weather-text.service';
import { WeatherTextResolver } from './weather-text.resolver';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule],
  providers: [WeatherTextService, WeatherTextResolver],
  exports: [WeatherTextService],
})
export class WeatherTextModule {}
