// User-related types for Muditor
export interface User {
  id: string;
  email: string;
  username: string;
  role: 'PLAYER' | 'IMMORTAL' | 'CODER' | 'GOD';
  createdAt: Date;
  updatedAt: Date;
}

export interface Character {
  id: string;
  name: string;
  level: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}