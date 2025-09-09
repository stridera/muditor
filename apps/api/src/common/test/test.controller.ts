import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { LoggingService } from '../logging/logging.service';

@Controller('test')
export class TestController {
  constructor(private readonly loggingService: LoggingService) {}

  @Get('error')
  async testError(@Query('type') type?: string) {
    await this.loggingService.logInfo(
      'Test error endpoint called',
      'TestController',
      { type }
    );

    switch (type) {
      case 'http':
        throw new HttpException(
          'This is a test HTTP exception',
          HttpStatus.BAD_REQUEST
        );

      case 'runtime':
        // Force a runtime error
        const obj: any = null;
        return obj.someProperty.that.doesnt.exist;

      case 'async':
        // Simulate async error
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            reject(new Error('This is a test async error'));
          }, 100);
        });

      case 'validation':
        throw new HttpException(
          {
            message: 'Validation failed',
            errors: ['Field is required', 'Invalid format'],
          },
          HttpStatus.UNPROCESSABLE_ENTITY
        );

      default:
        throw new Error('This is a test generic error');
    }
  }

  @Get('logs')
  async getLogs(
    @Query('level') level?: string,
    @Query('limit') limit?: string
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.loggingService.getRecentLogs(level, limitNum);
  }

  @Post('log')
  async createTestLog(
    @Body() body: { message: string; level?: string; data?: any }
  ) {
    const { message, level = 'info', data } = body;

    switch (level) {
      case 'error':
        await this.loggingService.logError(message, 'TestController', data);
        break;
      case 'warn':
        await this.loggingService.logWarn(message, 'TestController', data);
        break;
      case 'debug':
        await this.loggingService.logDebug(message, 'TestController', data);
        break;
      default:
        await this.loggingService.logInfo(message, 'TestController', data);
    }

    return { success: true, message: 'Log created' };
  }
}
