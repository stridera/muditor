import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

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
      // TODO(prisma-wrapper): Replace direct $on listeners with a lightweight wrapper service
      // that normalizes event payloads and enforces typed query logging.
      // Issue: Subclassing PrismaClient with custom log config + strict optional types forces
      // us to use @ts-expect-error here. Wrapper will expose onQuery/onError hooks instead.
      // Restore listeners with explicit ts-expect-error due to subclass narrowing bug under strict optional types
      // @ts-expect-error Prisma typing issue when subclassing with custom log configuration
      this.$on('query', (e: Prisma.QueryEvent) => {
        this.logger.debug(
          `Query: ${e.query} - Params: ${e.params} - Duration: ${e.duration}ms`
        );
      });
      // @ts-expect-error see note above
      this.$on('error', (e: Prisma.LogEvent) => {
        this.logger.error('Database error:', e);
      });
      // @ts-expect-error see note above
      this.$on('warn', (e: Prisma.LogEvent) => {
        this.logger.warn('Database warning:', e);
      });
      // @ts-expect-error see note above
      this.$on('info', (e: Prisma.LogEvent) => {
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
