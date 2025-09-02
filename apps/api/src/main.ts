import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  
  // Enable CORS for development
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? false : true,
    credentials: true,
  });
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  const port = process.env.API_PORT || 4000;
  const host = process.env.API_HOST || 'localhost';
  
  await app.listen(port, host);
  
  Logger.log(`🚀 API is running on: http://${host}:${port}/${globalPrefix}`);
  Logger.log(`📊 GraphQL Playground: http://${host}:${port}/graphql`);
}

bootstrap();