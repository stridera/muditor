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
      // Neither the session JWT nor the pending-registration JWT goes in the
      // URL (proxy logs, history, Referer). The web redeems a one-time code,
      // proving it holds the `state` it generated when it started the flow.
      const state = req.query['state'];
      if (typeof state !== 'string' || !OAUTH_STATE_PATTERN.test(state)) {
        throw new Error('Sign-in state missing or invalid');
      }

      // Checked before handleGoogleLogin, which can auto-link or create accounts.
      const profile = req.user as GoogleProfile;
      const result = await this.authService.handleGoogleLogin(profile);

      if (result.needsUsername) {
        if (result.pendingToken === undefined) {
          throw new Error('Registration token missing');
        }
        const code = this.oauthCodes.issue(
          result.pendingToken,
          state,
          'pending-registration'
        );
        return res.redirect(
          `${this.frontendUrl}/auth/google/choose-display-name?code=${encodeURIComponent(code)}`
        );
      }

      if (result.accessToken === undefined) {
        throw new Error('Sign-in token missing');
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
