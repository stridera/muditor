import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { GraphQLJwtAuthGuard } from './guards/graphql-jwt-auth.guard';
import { ZonePermissionGuard } from './guards/zone-permission.guard';
import { UsersModule } from '../users/users.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    PassportModule.register({ session: false }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback-secret-key',
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN ||
          '7d') as `${number}${'s' | 'm' | 'h' | 'd'}`,
      },
      global: true,
    }),
    forwardRef(() => UsersModule),
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthResolver,
    GoogleStrategy,
    JwtStrategy,
    LocalStrategy,
    GraphQLJwtAuthGuard,
    ZonePermissionGuard,
  ],
  exports: [AuthService, GraphQLJwtAuthGuard, ZonePermissionGuard],
})
export class AuthModule {}
