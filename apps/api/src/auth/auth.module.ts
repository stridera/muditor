import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { GraphQLJwtAuthGuard } from './guards/graphql-jwt-auth.guard';
import { UsersModule } from '../users/users.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback-secret-key',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
      global: true,
    }),
    UsersModule,
    EmailModule,
  ],
  providers: [
    AuthService,
    AuthResolver,
    JwtStrategy,
    LocalStrategy,
    GraphQLJwtAuthGuard,
  ],
  exports: [AuthService, GraphQLJwtAuthGuard],
})
export class AuthModule {}
