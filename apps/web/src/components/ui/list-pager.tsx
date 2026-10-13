'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ListPagerProps {
  /** 1-based current page. */
  page: number;
  pageSize: number;
  /** Matching rows across every page (from the server's count query). */
  total: number;
  /** Rows on the current page. */
  shown: number;
  onPageChange: (page: number) => void;
  noun?: string;
}

/** "Showing 51-100 of 446 commands" with previous/next, for server-paged lists. */
export function ListPager({
  page,
  pageSize,
  total,
  shown,
  onPageChange,
  noun = 'results',
}: ListPagerProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const first = shown > 0 ? (page - 1) * pageSize + 1 : 0;
  const last = (page - 1) * pageSize + shown;
  return (
    <div className='flex items-center justify-between mt-4 text-sm text-muted-foreground'>
      <span data-testid='list-pager-range'>
        Showing {first}-{last} of {total} {noun}
      </span>
      {totalPages > 1 && (
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            aria-label='Previous page'
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <span>
            Page {page} of {totalPages}
          </span>
          <Button
            variant='outline'
            size='sm'
            aria-label='Next page'
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
      )}
    </div>
  );
}
