import { Controller, Get, Logger, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { OAUTH_STATE_PATTERN, OAuthCodeService } from './oauth-code.service';
import type { GoogleProfile } from './strategies/google.strategy';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  private readonly frontendUrl: string;

  constructor(
    private readonly authService: AuthService,
    private readonly oauthCodes: OAuthCodeService,
    configService: ConfigService
  ) {
    this.frontendUrl =
      configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const profile = req.user as GoogleProfile;
      const result = await this.authService.handleGoogleLogin(profile);

      if (result.needsUsername) {
        return res.redirect(
          `${this.frontendUrl}/auth/google/choose-display-name?token=${result.pendingToken}`
        );
      }

      // The JWT never goes in the URL (proxy logs, history, Referer). The web
      // callback redeems this one-time code, proving it holds the `state` it
      // generated when it started the flow.
      const state = req.query['state'];
      if (
        result.accessToken === undefined ||
        typeof state !== 'string' ||
        !OAUTH_STATE_PATTERN.test(state)
      ) {
        throw new Error('Sign-in state missing or invalid');
      }
      const code = this.oauthCodes.issue(result.accessToken, state);
      return res.redirect(
        `${this.frontendUrl}/auth/google/callback?code=${encodeURIComponent(code)}`
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
