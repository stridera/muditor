import { UserRole } from '@muditor/db';

export interface JwtPayload {
  sub: string; // User ID
  displayName: string;
  role: UserRole;
  iat?: number;
  /** Unix seconds of the last real sign-in; preserved across token refreshes. */
  authAt?: number;
  exp?: number;
}
