import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { BridgeModule } from '../bridge/bridge.module';
import { LoginRequestsResolver } from './login-requests.resolver';
import { LoginRequestsService } from './login-requests.service';

@Module({
  imports: [DatabaseModule, BridgeModule],
  providers: [LoginRequestsService, LoginRequestsResolver],
  exports: [LoginRequestsService],
})
export class LoginRequestsModule {}
