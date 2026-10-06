'use client';

import { BuilderGuard } from '@/components/site-content/BuilderGuard';
import { SiteContentForm } from '@/components/site-content/SiteContentForm';

export default function NewSiteContentPage() {
  return (
    <BuilderGuard>
      <SiteContentForm />
    </BuilderGuard>
  );
}
