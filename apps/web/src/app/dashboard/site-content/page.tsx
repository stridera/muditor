'use client';

import { BuilderGuard } from '@/components/site-content/BuilderGuard';
import { KIND_OPTIONS } from '@/components/site-content/SiteContentForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { SiteContentKind } from '@/generated/graphql';
import { useSiteContentList } from '@/hooks/useSiteContent';
import { Loader2, Plus, RefreshCw, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const ALL = 'ALL';

function formatDate(value: string | null | undefined): string {
  if (!value) return '-';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '-' : d.toLocaleString();
}

function SiteContentList() {
  const router = useRouter();
  const [kindFilter, setKindFilter] = useState<string>(ALL);
  const { items, loading, error, refetch } = useSiteContentList(
    kindFilter === ALL ? undefined : (kindFilter as SiteContentKind)
  );

  return (
    <div className='container mx-auto p-6 space-y-4'>
      <div className='flex items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-foreground mb-1'>
            Site Content
          </h1>
          <p className='text-muted-foreground'>
            Lore, news and static pages for the public website.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Select value={kindFilter} onValueChange={setKindFilter}>
            <SelectTrigger className='w-40'>
              <SelectValue placeholder='All kinds' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All kinds</SelectItem>
              {KIND_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button asChild>
            <Link href='/dashboard/site-content/new'>
              <Plus className='h-4 w-4 mr-2' />
              New
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <div className='space-y-3'>
          <Alert variant='destructive'>
            <XCircle className='h-4 w-4' />
            <AlertDescription>
              Error loading site content: {error.message}
            </AlertDescription>
          </Alert>
          <Button variant='outline' onClick={() => refetch()}>
            <RefreshCw className='h-4 w-4 mr-2' />
            Retry
          </Button>
        </div>
      )}

      {loading && items.length === 0 && !error ? (
        <div className='flex items-center justify-center h-64'>
          <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
        </div>
      ) : (
        !error && (
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Kind</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Published at</TableHead>
                  <TableHead>Sort</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className='text-center text-muted-foreground py-8'
                    >
                      No content yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map(item => (
                    <TableRow
                      key={item.id}
                      className='cursor-pointer'
                      onClick={() =>
                        router.push(`/dashboard/site-content/${item.id}`)
                      }
                    >
                      <TableCell className='font-medium'>
                        {item.title}
                      </TableCell>
                      <TableCell className='font-mono text-xs'>
                        {item.slug}
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline'>{item.kind}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={item.published ? 'default' : 'secondary'}
                        >
                          {item.published ? 'Published' : 'Draft'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(item.publishedAt)}</TableCell>
                      <TableCell>{item.sortOrder}</TableCell>
                      <TableCell>{formatDate(item.updatedAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )
      )}
    </div>
  );
}

export default function SiteContentPage() {
  return (
    <BuilderGuard>
      <SiteContentList />
    </BuilderGuard>
  );
}
