'use client';

import { installGlobalErrorHandlers } from '@/lib/client-error-reporter';
import { useEffect } from 'react';

/** Registers window.onerror / unhandledrejection reporting once per page load. */
export function ClientErrorHandlers() {
  useEffect(() => {
    installGlobalErrorHandlers();
  }, []);
  return null;
}
