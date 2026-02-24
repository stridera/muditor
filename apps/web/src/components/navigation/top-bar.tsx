'use client';

import { Breadcrumb } from '@/components/navigation/breadcrumb';
import { ZoneEntityTabs } from '@/components/navigation/zone-entity-tabs';
import { openMobileSidebar } from '@/components/navigation/sidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export function TopBar() {
  return (
    <header className='h-12 flex items-center gap-4 px-4 border-b border-border bg-background/80 backdrop-blur-sm flex-shrink-0'>
      {/* Mobile hamburger */}
      <Button
        variant='ghost'
        size='sm'
        onClick={openMobileSidebar}
        className='h-8 w-8 p-0 md:hidden'
      >
        <Menu className='h-5 w-5' />
      </Button>

      {/* Breadcrumbs */}
      <div className='flex-1 min-w-0'>
        <Breadcrumb />
      </div>

      {/* Zone entity tabs */}
      <ZoneEntityTabs />
    </header>
  );
}
