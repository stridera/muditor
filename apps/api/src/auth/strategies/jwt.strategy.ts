import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { getJwtSecret } from '../jwt-secret';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';
import type { Users } from '@muditor/db';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
    });
  }

  async validate(payload: JwtPayload): Promise<Users> {
    try {
      const user = await this.authService.validateJwtPayload(payload);
      // Time of the last real sign-in (refreshes keep it); lets sensitive
      // mutations demand a recent authentication.
      return Object.assign(user, { authAt: payload.authAt ?? payload.iat });
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
