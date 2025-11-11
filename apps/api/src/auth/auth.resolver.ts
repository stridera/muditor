import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { Users as PrismaUser } from '@prisma/client';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthPayload } from './dto/auth.payload';
import { LoginInput } from './dto/login.input';
import {
  ChangePasswordInput,
  PasswordResetResponse,
  RequestPasswordResetInput,
  ResetPasswordInput,
  UpdateProfileInput,
} from './dto/password-reset.input';
import { RegisterInput } from './dto/register.input';
import { GraphQLJwtAuthGuard } from './guards/graphql-jwt-auth.guard';

@Resolver()
export class AuthResolver {
  constructor(
    private authService: AuthService,
    private usersService: UsersService
  ) {}

  @Mutation(() => AuthPayload)
  async register(
    @Args('input') registerInput: RegisterInput
  ): Promise<AuthPayload> {
    return this.authService.register(registerInput);
  }

  @Mutation(() => AuthPayload)
  async login(@Args('input') loginInput: LoginInput): Promise<AuthPayload> {
    return this.authService.login(loginInput);
  }

  @Query(() => User)
  @UseGuards(GraphQLJwtAuthGuard)
  async me(@CurrentUser() user: PrismaUser): Promise<PrismaUser> {
    return this.usersService.getUserWithBanStatus(user.id);
  }

  @Mutation(() => String)
  @UseGuards(GraphQLJwtAuthGuard)
  async refreshToken(@CurrentUser('id') userId: string): Promise<string> {
    return this.authService.refreshToken(userId);
  }

  @Mutation(() => PasswordResetResponse)
  async requestPasswordReset(
    @Args('input') input: RequestPasswordResetInput
  ): Promise<PasswordResetResponse> {
    const success = await this.authService.requestPasswordReset(input.email);
    return {
      success,
      message: success
        ? 'Password reset email sent successfully'
        : 'Failed to send password reset email',
    };
  }

  @Mutation(() => PasswordResetResponse)
  async resetPassword(
    @Args('input') input: ResetPasswordInput
  ): Promise<PasswordResetResponse> {
    const success = await this.authService.resetPassword(
      input.token,
      input.newPassword
    );
    return {
      success,
      message: success
        ? 'Password reset successfully'
        : 'Failed to reset password',
    };
  }

  @Mutation(() => User)
  @UseGuards(GraphQLJwtAuthGuard)
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Args('input') input: UpdateProfileInput
  ): Promise<PrismaUser> {
    return this.authService.updateProfile(userId, input);
  }

  @Mutation(() => PasswordResetResponse)
  @UseGuards(GraphQLJwtAuthGuard)
  async changePassword(
    @CurrentUser('id') userId: string,
    @Args('input') input: ChangePasswordInput
  ): Promise<PasswordResetResponse> {
    const success = await this.authService.changePassword(
      userId,
      input.currentPassword,
      input.newPassword
    );
    return {
      success,
      message: success
        ? 'Password changed successfully'
        : 'Failed to change password',
    };
  }
}
