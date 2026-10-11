import {
  BadRequestException,
  Injectable,
  type ExecutionContext,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { OAUTH_STATE_PATTERN } from '../oauth-code.service';

/**
 * Google OAuth guard that threads the browser-generated CSRF `state` through
 * the authorization request. Google echoes it back on the callback, where the
 * controller binds it to the one-time code. The strategy runs sessionless, so
 * we pass `state` per request instead of using passport's session state store.
 */
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  override getAuthenticateOptions(
    context: ExecutionContext
  ): Record<string, unknown> | undefined {
    const req = context.switchToHttp().getRequest<Request>();
    // Only the initial request carries the state in the query; on the callback
    // the same query param is Google's echo and passport ignores it here.
    if (req.path.endsWith('/callback')) return undefined;
    const state = req.query['state'];
    if (typeof state !== 'string' || !OAUTH_STATE_PATTERN.test(state)) {
      throw new BadRequestException('Missing or invalid OAuth state');
    }
    return { state };
  }
}
