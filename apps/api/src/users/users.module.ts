import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { RoleCalculatorService } from './services/role-calculator.service';
import { MinimumRoleGuard } from '../auth/guards/minimum-role.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [UsersService, UsersResolver, RoleCalculatorService, MinimumRoleGuard],
  exports: [UsersService, RoleCalculatorService, MinimumRoleGuard],
})
export class UsersModule {}
