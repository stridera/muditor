import { Module } from '@nestjs/common';
import { ServerStatusResolver } from './server-status.resolver';
import { ServerStatusService } from './server-status.service';

@Module({
  providers: [ServerStatusService, ServerStatusResolver],
  exports: [ServerStatusService],
})
export class ServerStatusModule {}
