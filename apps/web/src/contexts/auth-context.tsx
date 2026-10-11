'use client';

import { apolloClient } from '@/lib/apollo-client';
import { gql } from '@apollo/client';
import type { UserRole } from '@/lib/roles';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useEffect, useState } from 'react';

// GraphQL queries and mutations
const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      user {
        id
        displayName
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
        displayName
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
      displayName
      email
      role
      createdAt
    }
  }
`;

export interface User {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  loginWithOAuthCode: (code: string) => Promise<void>;
  register: (
    displayName: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  refetchUser: () => Promise<void>;
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
        router.push(consumePostLoginPath());
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

  const loginWithToken = async (token: string) => {
    setStoredToken(token);
    try {
      const result = await apolloClient.query({
        query: ME_QUERY,
        fetchPolicy: 'network-only',
      });
      if ((result.data as any)?.me) {
        setUser((result.data as any).me);
        setStoredUser((result.data as any).me);
        router.push(consumePostLoginPath());
      }
    } catch {
      removeStoredToken();
      removeStoredUser();
      throw new Error('Failed to authenticate with token');
    }
  };

  // Redeem the one-time code from the Google redirect. The state was generated
  // in this browser when the flow started (startGoogleLogin); the API only
  // releases the token if it matches the state the code was issued under.
  const loginWithOAuthCode = async (code: string) => {
    const state = sessionStorage.getItem(GOOGLE_OAUTH_STATE_KEY);
    sessionStorage.removeItem(GOOGLE_OAUTH_STATE_KEY);
    if (!state) throw new Error('Missing sign-in state');
    const result = await apolloClient.mutate({
      mutation: EXCHANGE_OAUTH_CODE_MUTATION,
      variables: { code, state },
    });
    const token = (result.data as any)?.exchangeOAuthCode as string | undefined;
    if (!token) throw new Error('Sign-in code was rejected');
    await loginWithToken(token);
  };

  const register = async (
    displayName: string,
    email: string,
    password: string
  ) => {
    try {
      const result = await apolloClient.mutate({
        mutation: REGISTER_MUTATION,
        variables: {
          input: { displayName, email, password },
        },
      });

      if ((result.data as any)?.register) {
        const { accessToken, user: registerUser } = (result.data as any)
          .register;
        setStoredToken(accessToken);
        setStoredUser(registerUser);
        setUser(registerUser);
        router.push(consumePostLoginPath());
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

  const refetchUser = async () => {
    try {
      const result = await apolloClient.query({
        query: ME_QUERY,
        fetchPolicy: 'network-only', // Force refetch from server
      });

      if ((result.data as any)?.me) {
        setUser((result.data as any).me);
        setStoredUser((result.data as any).me);
      }
    } catch (error) {
      console.error('Failed to refetch user:', error);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithToken,
        loginWithOAuthCode,
        register,
        logout,
        refetchUser,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Post-login redirect: the login page stashes a safe in-app path (from ?redirect=)
// in sessionStorage so password, Google, and registration flows all return to it.
const POST_LOGIN_KEY = 'post-login-redirect';

export const GOOGLE_OAUTH_STATE_KEY = 'google-oauth-state';

const EXCHANGE_OAUTH_CODE_MUTATION = gql`
  mutation ExchangeOAuthCode($code: String!, $state: String!) {
    exchangeOAuthCode(code: $code, state: $state)
  }
`;

// Begin Google sign-in: generate a random state, remember it in this tab, and
// send it through the OAuth round trip. The callback page must present it back
// to redeem the code, so a callback URL forged by someone else is rejected.
export const startGoogleLogin = (apiUrl: string): void => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const state = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  sessionStorage.setItem(GOOGLE_OAUTH_STATE_KEY, state);
  window.location.href = `${apiUrl}/api/auth/google?state=${encodeURIComponent(state)}`;
};

// Resolve against our own origin; anything that leaves it (or fails to parse)
// is rejected. Returns the normalised same-origin path + query, or null.
//
// The result is checked after normalisation, because URL parsing happily turns
// `/.//evil.com` or `/%2e//evil.com` into `//evil.com`, which router.push would
// treat as a protocol-relative (off-site) URL.
export const safeRedirectPath = (path: string | null): string | null => {
  if (!path || typeof window === 'undefined') return null;
  // eslint-disable-next-line no-control-regex -- deliberately rejecting control characters
  if (/[\\\u0000-\u001f\u007f]/.test(path)) return null;
  try {
    const u = new URL(path, window.location.origin);
    if (u.origin !== window.location.origin) return null;
    const result = u.pathname + u.search;
    // Exactly one leading slash, followed by something other than / or \.
    if (!/^\/(?![/\\])/.test(result)) return null;
    // eslint-disable-next-line no-control-regex
    if (/[\\\u0000-\u001f\u007f]/.test(result)) return null;
    return result;
  } catch {
    return null;
  }
};

export const setPostLoginPath = (path: string | null): void => {
  if (typeof window === 'undefined') return;
  const safe = safeRedirectPath(path);
  if (safe) sessionStorage.setItem(POST_LOGIN_KEY, safe);
  else sessionStorage.removeItem(POST_LOGIN_KEY);
};

const consumePostLoginPath = (): string => {
  if (typeof window === 'undefined') return '/dashboard';
  const path = sessionStorage.getItem(POST_LOGIN_KEY);
  sessionStorage.removeItem(POST_LOGIN_KEY);
  return safeRedirectPath(path) ?? '/dashboard';
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
