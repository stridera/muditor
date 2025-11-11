import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
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
      case 'runtime': {
        return (
          null as unknown as {
            someProperty: { that: { doesnt: { exist: unknown } } };
          }
        ).someProperty.that.doesnt.exist;
      }
      case 'async':
        return new Promise((_, reject) => {
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
    const allowed: Array<'error' | 'info' | 'warn' | 'debug'> = [
      'error',
      'info',
      'warn',
      'debug',
    ];
    const levelTyped =
      level && (allowed as readonly string[]).includes(level)
        ? (level as (typeof allowed)[number])
        : undefined;
    return this.loggingService.getRecentLogs(levelTyped, limitNum);
  }

  @Post('log')
  async createTestLog(
    @Body()
    body: {
      message: string;
      level?: 'error' | 'info' | 'warn' | 'debug';
      data?: unknown;
    }
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
