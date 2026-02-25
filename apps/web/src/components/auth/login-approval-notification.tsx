'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { apolloClient } from '@/lib/apollo-client';
import { gql } from '@apollo/client';
import { useQuery, useSubscription } from '@apollo/client/react';
import { useCallback, useEffect, useState } from 'react';

const PENDING_LOGIN_REQUESTS = gql`
  query PendingLoginRequests {
    pendingLoginRequests {
      id
      userId
      status
      ipAddress
      expiresAt
      createdAt
    }
  }
`;

const APPROVE_LOGIN_REQUEST = gql`
  mutation ApproveLoginRequest($requestId: String!) {
    approveLoginRequest(requestId: $requestId) {
      id
      status
      resolvedAt
    }
  }
`;

const DENY_LOGIN_REQUEST = gql`
  mutation DenyLoginRequest($requestId: String!) {
    denyLoginRequest(requestId: $requestId) {
      id
      status
      resolvedAt
    }
  }
`;

const LOGIN_REQUEST_SUBSCRIPTION = gql`
  subscription OnLoginRequestCreated {
    loginRequestCreated {
      id
      userId
      status
      ipAddress
      expiresAt
      createdAt
    }
  }
`;

interface LoginRequest {
  id: string;
  userId: string;
  status: string;
  ipAddress?: string;
  expiresAt: string;
  createdAt: string;
}

export function LoginApprovalNotification() {
  const [activeRequest, setActiveRequest] = useState<LoginRequest | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Poll for pending requests as fallback
  const { data, refetch } = useQuery<{
    pendingLoginRequests: LoginRequest[];
  }>(PENDING_LOGIN_REQUESTS, {
    pollInterval: 10000,
    fetchPolicy: 'network-only',
  });

  // Subscribe for real-time events — always use the newest request
  useSubscription<{ loginRequestCreated: LoginRequest }>(
    LOGIN_REQUEST_SUBSCRIPTION,
    {
      onData: ({ data: subData }) => {
        const request = subData?.data?.loginRequestCreated;
        if (request && request.status === 'PENDING') {
          setActiveRequest(request);
          setIsProcessing(false);
        }
      },
    }
  );

  // Show first pending request from query (newest first)
  useEffect(() => {
    const pending = data?.pendingLoginRequests;
    const first = pending?.[0];
    if (first) {
      // Always update to the latest pending request from the server
      setActiveRequest(prev => (!prev || prev.id !== first.id ? first : prev));
    }
  }, [data]);

  // Countdown timer
  useEffect(() => {
    if (!activeRequest) return;

    const updateCountdown = () => {
      const expiresAt = new Date(activeRequest.expiresAt).getTime();
      const remaining = Math.max(
        0,
        Math.floor((expiresAt - Date.now()) / 1000)
      );
      setCountdown(remaining);

      if (remaining <= 0) {
        setActiveRequest(null);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [activeRequest]);

  const handleApprove = useCallback(async () => {
    if (!activeRequest || isProcessing) return;
    setIsProcessing(true);
    try {
      await apolloClient.mutate({
        mutation: APPROVE_LOGIN_REQUEST,
        variables: { requestId: activeRequest.id },
      });
      setActiveRequest(null);
      refetch();
    } catch (err) {
      // Request was already resolved (expired, approved by another tab, etc.)
      // Clear it and refetch to pick up any newer pending requests
      console.warn('Login request no longer pending, refreshing:', err);
      setActiveRequest(null);
      refetch();
    } finally {
      setIsProcessing(false);
    }
  }, [activeRequest, isProcessing, refetch]);

  const handleDeny = useCallback(async () => {
    if (!activeRequest || isProcessing) return;
    setIsProcessing(true);
    try {
      await apolloClient.mutate({
        mutation: DENY_LOGIN_REQUEST,
        variables: { requestId: activeRequest.id },
      });
      setActiveRequest(null);
      refetch();
    } catch (err) {
      console.warn('Login request no longer pending, refreshing:', err);
      setActiveRequest(null);
      refetch();
    } finally {
      setIsProcessing(false);
    }
  }, [activeRequest, isProcessing, refetch]);

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!activeRequest) return null;

  return (
    <AlertDialog open={!!activeRequest}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className='flex items-center gap-2'>
            Game Login Request
            <Badge variant={countdown <= 30 ? 'destructive' : 'secondary'}>
              {formatCountdown(countdown)}
            </Badge>
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className='space-y-3'>
              <p>Someone is trying to log into FieryMUD with your account.</p>
              {activeRequest.ipAddress && (
                <p className='text-sm'>
                  <span className='font-medium'>IP Address:</span>{' '}
                  {activeRequest.ipAddress}
                </p>
              )}
              <p className='text-sm text-destructive font-medium'>
                Only approve this if you initiated the login. If you did not
                attempt to log in, deny this request immediately.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleDeny} disabled={isProcessing}>
            Deny
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleApprove} disabled={isProcessing}>
            Approve
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
