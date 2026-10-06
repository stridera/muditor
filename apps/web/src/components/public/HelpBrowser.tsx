'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  HELP_SEARCH_MIN_CHARS,
  useDebouncedValue,
  useHelpCategories,
  usePublicHelpList,
} from '@/hooks/use-public-help';
import { cn } from '@/lib/utils';
import { stripMudMarkup, titleCase } from '@/lib/mud-text';
import { EmptyState, QueryError, QueryLoading } from './QueryState';

const GROUP_PAGE_SIZE = 30;

interface HelpItem {
  id: string;
  title: string;
  keywords: string[];
  category?: string | null | undefined;
}

/** Readable keyword path plus ?id= so duplicate first keywords stay distinct. */
export function helpHref(item: {
  id: string;
  title: string;
  keywords: string[];
}): string {
  const label = encodeURIComponent(item.keywords[0] ?? item.title);
  return `/help/${label}?id=${encodeURIComponent(item.id)}`;
}

function HelpLink({
  item,
  showCategory,
}: {
  item: HelpItem;
  showCategory?: boolean;
}) {
  return (
    <li>
      <Link
        href={helpHref(item)}
        className='flex items-center justify-between gap-3 rounded-md px-3 py-2 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      >
        <span className='font-medium'>{stripMudMarkup(item.title)}</span>
        {showCategory && item.category && (
          <Badge variant='secondary'>{titleCase(item.category)}</Badge>
        )}
      </Link>
    </li>
  );
}

export function HelpBrowser() {
  const [input, setInput] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, number>>({});
  const search = useDebouncedValue(input, 300);
  const categories = useHelpCategories();
  const { searching, entries, loading, error, refetch } = usePublicHelpList(
    search,
    category
  );

  const groups = useMemo(() => {
    const map = new Map<string, HelpItem[]>();
    for (const e of [...entries].sort((a, b) =>
      a.title.localeCompare(b.title)
    )) {
      const key = e.category || 'other';
      const list = map.get(key) ?? [];
      list.push(e);
      map.set(key, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [entries]);

  const tooShort =
    input.trim().length > 0 && input.trim().length < HELP_SEARCH_MIN_CHARS;

  return (
    <div className='space-y-6'>
      <div className='relative'>
        <Search
          className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground'
          aria-hidden
        />
        <Input
          type='search'
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder='Search help files (e.g. fireball, sneak, groups)'
          aria-label='Search help files'
          className='pl-9'
        />
      </div>
      {tooShort && (
        <p className='-mt-3 text-sm text-muted-foreground'>
          Type at least {HELP_SEARCH_MIN_CHARS} characters to search.
        </p>
      )}

      {categories.length > 0 && (
        <div
          className='flex flex-wrap gap-2'
          role='group'
          aria-label='Filter by category'
        >
          <Button
            size='sm'
            variant={category === null ? 'default' : 'outline'}
            onClick={() => setCategory(null)}
          >
            All
          </Button>
          {categories.map(c => (
            <Button
              key={c}
              size='sm'
              variant={category === c ? 'default' : 'outline'}
              onClick={() => setCategory(c)}
            >
              {titleCase(c)}
            </Button>
          ))}
        </div>
      )}

      {loading && entries.length === 0 ? (
        <QueryLoading />
      ) : error && entries.length === 0 ? (
        <QueryError onRetry={refetch} />
      ) : entries.length === 0 ? (
        <EmptyState>
          {searching
            ? `No help files match "${search.trim()}".`
            : 'No help files found.'}
        </EmptyState>
      ) : searching ? (
        <section aria-live='polite'>
          <p className='mb-2 text-sm text-muted-foreground'>
            {entries.length} result{entries.length === 1 ? '' : 's'}
          </p>
          <ul className='divide-y divide-border rounded-lg border border-border'>
            {entries.map(item => (
              <HelpLink key={item.id} item={item} showCategory />
            ))}
          </ul>
        </section>
      ) : (
        <div className='space-y-8'>
          {groups.map(([group, items]) => {
            const limit = expanded[group] ?? GROUP_PAGE_SIZE;
            return (
              <section key={group} aria-labelledby={`help-group-${group}`}>
                <h2
                  id={`help-group-${group}`}
                  className='mb-2 font-display text-xl'
                >
                  {titleCase(group)}{' '}
                  <span className='text-sm text-muted-foreground'>
                    ({items.length})
                  </span>
                </h2>
                <ul
                  className={cn(
                    'grid gap-x-4 sm:grid-cols-2',
                    'rounded-lg border border-border p-1'
                  )}
                >
                  {items.slice(0, limit).map(item => (
                    <HelpLink key={item.id} item={item} />
                  ))}
                </ul>
                {items.length > limit && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='mt-2'
                    onClick={() =>
                      setExpanded(s => ({ ...s, [group]: limit + 100 }))
                    }
                  >
                    Show more ({items.length - limit} remaining)
                  </Button>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
