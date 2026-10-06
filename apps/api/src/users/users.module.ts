import { Module, forwardRef } from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { RoleCalculatorService } from './services/role-calculator.service';
import { MinimumRoleGuard } from '../auth/guards/minimum-role.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [
    UsersService,
    AdminUsersService,
    UsersResolver,
    RoleCalculatorService,
    MinimumRoleGuard,
  ],
  exports: [UsersService, RoleCalculatorService, MinimumRoleGuard],
})
export class UsersModule {}
