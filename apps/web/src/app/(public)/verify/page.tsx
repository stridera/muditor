import type { Metadata } from 'next';
import { Suspense } from 'react';

import { GameLoginApproval } from '@/components/public/GameLoginApproval';
import { PublicPageShell } from '@/components/public/PublicPageShell';
import { QueryLoading } from '@/components/public/QueryState';

export const metadata: Metadata = { title: 'Approve game login' };

export default function VerifyPage() {
  return (
    <PublicPageShell
      title='Approve game login'
      subtitle='Confirm the login code your game client is waiting on.'
    >
      <Suspense fallback={<QueryLoading />}>
        <GameLoginApproval />
      </Suspense>
    </PublicPageShell>
  );
}
