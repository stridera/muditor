import { UserRole } from '@muditor/db';

export interface JwtPayload {
  sub: string; // User ID
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
