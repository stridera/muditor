import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { GraphQLSchemaHost } from '@nestjs/graphql';
import { AppModule } from './app.module';
import { LoggingService } from './common/logging/logging.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get logging service for setup
  const loggingService = app.get(LoggingService);

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Enable CORS for development
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? false : true,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  const port = process.env.API_PORT || 4000;
  const host = process.env.API_HOST || 'localhost';

  // Set up graceful shutdown
  process.on('SIGINT', async () => {
    Logger.log('Received SIGINT signal, shutting down gracefully...');
    await loggingService.logInfo('Application shutdown initiated', 'Bootstrap');
    await app.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    Logger.log('Received SIGTERM signal, shutting down gracefully...');
    await loggingService.logInfo('Application shutdown initiated', 'Bootstrap');
    await app.close();
    process.exit(0);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', async error => {
    Logger.error('Uncaught Exception:', error);
    await loggingService.logError(
      'Uncaught Exception',
      'Process',
      { error: error.message },
      error.stack
    );
    process.exit(1);
  });

  process.on('unhandledRejection', async (reason, promise) => {
    Logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    await loggingService.logError('Unhandled Rejection', 'Process', {
      reason,
      promise,
    });
  });

  // Clean up old logs on startup
  await loggingService.cleanupLogs();

  // Set up periodic log cleanup (every 24 hours)
  setInterval(
    async () => {
      await loggingService.cleanupLogs();
    },
    24 * 60 * 60 * 1000
  );

  // Defer schema validation until after listen to ensure ApolloDriver completed schema build.
  // (Accessing GraphQLSchemaHost.schema too early causes "schema has not yet been created" errors.)
  const validateSchema = async () => {
    try {
      const schemaHost = app.get(GraphQLSchemaHost, { strict: false });
      const schema = schemaHost?.schema;
      if (!schema) {
        await loggingService.logError(
          'GraphQL schema unavailable after initialization',
          'Bootstrap',
          {}
        );
        Logger.error('GraphQL schema not yet created (post-listen).');
        return;
      }
      const requiredEnums = [
        'ObjectType',
        'ObjectFlag',
        'EffectFlag',
        'WearFlag',
        'Race',
        'MobFlag',
        'RoomFlag',
      ];
      const missingEnums = requiredEnums.filter(name => !schema.getType(name));
      if (missingEnums.length) {
        await loggingService.logError(
          'Missing GraphQL enum registrations',
          'Bootstrap',
          { missing: missingEnums }
        );
        Logger.error(
          `Missing GraphQL enums: ${missingEnums.join(', ')}. Schema may be incomplete.`
        );
      } else {
        await loggingService.logInfo(
          'All required GraphQL enums present',
          'Bootstrap',
          { count: requiredEnums.length }
        );
      }
    } catch (err) {
      Logger.error('Schema validation threw error', err as Error);
    }
  };

  await app.listen(port, host);
  // Perform schema validation asynchronously (non-blocking startup)
  setTimeout(validateSchema, 0);

  Logger.log(`🚀 API is running on: http://${host}:${port}/${globalPrefix}`);
  Logger.log(`📊 GraphQL Playground: http://${host}:${port}/graphql`);
  Logger.log(`📝 Error logs will be saved to: logs/error.log`);

  await loggingService.logInfo(
    'Application started successfully',
    'Bootstrap',
    {
      port,
      host,
      environment: process.env.NODE_ENV || 'development',
      globalPrefix,
    }
  );
}

bootstrap();
