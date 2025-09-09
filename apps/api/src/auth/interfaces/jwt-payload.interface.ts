import { UserRole } from '@prisma/client';

export interface JwtPayload {
  sub: string; // User ID
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
