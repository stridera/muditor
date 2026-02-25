import { UserRole } from '@muditor/db';

export interface JwtPayload {
  sub: string; // User ID
  displayName: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
