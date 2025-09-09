import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(DatabaseService.name);

  constructor() {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
    });
  }

  async onModuleInit() {
    // Log Prisma events in development
    if (process.env.NODE_ENV === 'development') {
      this.$on('query', (e: any) => {
        this.logger.debug(
          `Query: ${e.query} - Params: ${e.params} - Duration: ${e.duration}ms`
        );
      });

      this.$on('error', (e: any) => {
        this.logger.error('Database error:', e);
      });

      this.$on('warn', (e: any) => {
        this.logger.warn('Database warning:', e);
      });

      this.$on('info', (e: any) => {
        this.logger.log('Database info:', e);
      });
    }

    try {
      await this.$connect();
      this.logger.log('✅ Database connected successfully');
    } catch (error) {
      this.logger.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('✅ Database disconnected successfully');
    } catch (error) {
      this.logger.error('❌ Database disconnection failed:', error);
    }
  }

  async healthCheck() {
    try {
      await this.$queryRaw`SELECT 1`;
      return { healthy: true, message: 'Database is healthy' };
    } catch (error) {
      return {
        healthy: false,
        message: `Database health check failed: ${error}`,
      };
    }
  }
}
