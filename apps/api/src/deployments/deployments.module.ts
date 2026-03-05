import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { DeploymentsService } from './deployments.service';
import { DeploymentsResolver } from './deployments.resolver';

@Module({
  imports: [DatabaseModule],
  providers: [DeploymentsService, DeploymentsResolver],
  exports: [DeploymentsService],
})
export class DeploymentsModule {}
