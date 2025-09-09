import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
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

  await app.listen(port, host);

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
