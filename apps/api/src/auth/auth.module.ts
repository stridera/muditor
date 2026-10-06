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
import { jwtModuleOptionsFactory } from './jwt-secret';
import { UsersModule } from '../users/users.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    PassportModule.register({ session: false }),
    JwtModule.registerAsync({
      useFactory: jwtModuleOptionsFactory,
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
  ],
  exports: [AuthService, GraphQLJwtAuthGuard],
})
export class AuthModule {}
