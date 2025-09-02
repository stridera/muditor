import { UserRole } from '@muditor/db';

export interface JwtPayload {
  sub: string; // User ID
  username: string;
  role: UserRole;
  godLevel: number;
  iat?: number;
  exp?: number;
}