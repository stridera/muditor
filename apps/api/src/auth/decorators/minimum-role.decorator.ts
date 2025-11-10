import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { MINIMUM_ROLE_KEY } from '../guards/minimum-role.guard';

/**
 * Decorator to set minimum role requirement for GraphQL resolvers
 *
 * Usage:
 * @MinimumRole(UserRole.CODER)
 * @Mutation(() => SkillDto)
 * async createSkill(@Args('data') data: CreateSkillInput) { ... }
 *
 * Role hierarchy (ascending):
 * PLAYER < IMMORTAL < BUILDER < HEAD_BUILDER < CODER < GOD
 */
export const MinimumRole = (role: UserRole) => SetMetadata(MINIMUM_ROLE_KEY, role);
