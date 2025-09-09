'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { gql } from '@apollo/client';
import { apolloClient } from '@/lib/apollo-client';

// GraphQL queries and mutations
const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      user {
        id
        username
        email
        role
        createdAt
      }
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      user {
        id
        username
        email
        role
        createdAt
      }
    }
  }
`;

const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      email
      role
      godLevel
      createdAt
    }
  }
`;

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'PLAYER' | 'IMMORTAL' | 'BUILDER' | 'CODER' | 'GOD';
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // On mount, check if we have a stored token
    const token = getStoredToken();

    if (token) {
      // Verify the token by fetching the user
      apolloClient
        .query({
          query: ME_QUERY,
        })
        .then((result: any) => {
          if (result.data?.me) {
            setUser(result.data.me);
            setStoredUser(result.data.me);
          }
          setLoading(false);
        })
        .catch(() => {
          // Token might be invalid, clear it
          removeStoredToken();
          removeStoredUser();
          setUser(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      const result = await apolloClient.mutate({
        mutation: LOGIN_MUTATION,
        variables: {
          input: { identifier, password },
        },
      });

      if ((result.data as any)?.login) {
        const { accessToken, user: loginUser } = (result.data as any).login;
        setStoredToken(accessToken);
        setStoredUser(loginUser);
        setUser(loginUser);
        router.push('/dashboard');
      }
    } catch (error: any) {
      // Extract meaningful error message
      const errorMessage =
        error.graphQLErrors?.[0]?.message ||
        error.networkError?.message ||
        'Login failed. Please try again.';
      throw new Error(errorMessage);
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    try {
      const result = await apolloClient.mutate({
        mutation: REGISTER_MUTATION,
        variables: {
          input: { username, email, password },
        },
      });

      if ((result.data as any)?.register) {
        const { accessToken, user: registerUser } = (result.data as any)
          .register;
        setStoredToken(accessToken);
        setStoredUser(registerUser);
        setUser(registerUser);
        router.push('/dashboard');
      }
    } catch (error: any) {
      // Extract meaningful error message
      const errorMessage =
        error.graphQLErrors?.[0]?.message ||
        error.networkError?.message ||
        'Registration failed. Please try again.';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    removeStoredToken();
    removeStoredUser();
    setUser(null);
    router.push('/login');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Token management utilities
const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth-token');
};

const setStoredToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth-token', token);
};

const removeStoredToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth-token');
};

const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('auth-user');
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

const setStoredUser = (user: User): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth-user', JSON.stringify(user));
};

const removeStoredUser = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth-user');
};

export { getStoredToken };
