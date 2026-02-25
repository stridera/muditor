import { Controller, Get, Logger, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import type { GoogleProfile } from './strategies/google.strategy';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  private readonly frontendUrl: string;

  constructor(
    private readonly authService: AuthService,
    configService: ConfigService
  ) {
    this.frontendUrl =
      configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const profile = req.user as GoogleProfile;
      const result = await this.authService.handleGoogleLogin(profile);

      if (result.needsUsername) {
        return res.redirect(
          `${this.frontendUrl}/auth/google/choose-display-name?token=${result.pendingToken}`
        );
      }

      return res.redirect(
        `${this.frontendUrl}/auth/google/callback?token=${result.accessToken}`
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Authentication failed';
      this.logger.error(`Google OAuth callback error: ${message}`);
      return res.redirect(
        `${this.frontendUrl}/login?error=${encodeURIComponent(message)}`
      );
    }
  }
}
