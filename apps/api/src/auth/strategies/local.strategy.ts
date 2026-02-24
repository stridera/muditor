import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import type { User } from '../../users/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'identifier', // Allow login with email or username
    });
  }

  async validate(identifier: string, password: string): Promise<User> {
    try {
      const result = await this.authService.login({ identifier, password });
      return result.user;
    } catch {
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
