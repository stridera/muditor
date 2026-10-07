'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  MarkReportDuplicateDocument,
  ReportsListDocument,
  UpdateReportDocument,
  type ReportFieldsFragment,
  type ReportStatus,
  type ReportType,
} from '@/generated/graphql';
import { usePermissions } from '@/hooks/use-permissions';
import { formatAge } from '@/lib/report-utils';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { Fragment, useState } from 'react';

const PAGE_SIZE = 50;
const MESSAGE_PREVIEW = 100;

const STATUSES: ReportStatus[] = [
  'OPEN',
  'IN_PROGRESS',
  'RESOLVED',
  'WONT_FIX',
  'DUPLICATE',
];
const TYPES: ReportType[] = ['BUG', 'IDEA', 'TYPO'];
const PRIORITIES = [
  { value: -1, label: 'Auto' },
  { value: 0, label: 'P0 critical' },
  { value: 1, label: 'P1 high' },
  { value: 2, label: 'P2 normal' },
  { value: 3, label: 'P3 low' },
];

/** "active" = the default triage view. */
type StatusChoice = 'ACTIVE' | 'ALL' | ReportStatus;

const SELECT_CLASS =
  'flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

function statusFilter(choice: StatusChoice): ReportStatus[] | undefined {
  if (choice === 'ALL') return undefined;
  if (choice === 'ACTIVE') return ['OPEN', 'IN_PROGRESS'];
  return [choice];
}

const TYPE_STYLE: Record<ReportType, string> = {
  BUG: 'bg-red-500/15 text-red-600 dark:text-red-400',
  TYPO: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  IDEA: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
};

export default function ReportsAdminPage() {
  const { isImmortal, isHeadBuilder, loading: permLoading } = usePermissions();

  if (permLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 className='w-8 h-8 animate-spin' />
      </div>
    );
  }

  if (!isImmortal) {
    return (
      <div className='p-6'>
        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertDescription>
            You do not have permission to view player reports. Immortal role or
            higher required.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <ReportsAdminContent canEdit={isHeadBuilder} />;
}

function ReportsAdminContent({ canEdit }: { canEdit: boolean }) {
  const [status, setStatus] = useState<StatusChoice>('ACTIVE');
  const [type, setType] = useState<ReportType | ''>('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'RANK' | 'NEWEST'>('RANK');
  const [skip, setSkip] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const reportsQuery = useQuery(ReportsListDocument, {
    variables: {
      filter: {
        status: statusFilter(status),
        type: type || undefined,
        search: search.trim() || undefined,
      },
      sort,
      take: PAGE_SIZE,
      skip,
    },
  });
  const [updateReport] = useMutation(UpdateReportDocument, {
    refetchQueries: ['ReportsList', 'ReportOpenCount'],
  });
  const [markDuplicate] = useMutation(MarkReportDuplicateDocument, {
    refetchQueries: ['ReportsList', 'ReportOpenCount'],
  });

  const items = reportsQuery.data?.reports.items ?? [];
  const total = reportsQuery.data?.reports.total ?? 0;

  const run = async (op: () => Promise<unknown>, failure: string) => {
    setActionError(null);
    try {
      await op();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : failure);
    }
  };

  const setReportStatus = (id: string, next: ReportStatus) =>
    run(
      () => updateReport({ variables: { id, data: { status: next } } }),
      'Status update failed'
    );
  const setPriority = (id: string, priority: number) =>
    run(
      () => updateReport({ variables: { id, data: { priority } } }),
      'Priority update failed'
    );
  const saveNote = (id: string, resolution: string) =>
    run(
      () => updateReport({ variables: { id, data: { resolution } } }),
      'Saving the note failed'
    );
  const setDuplicate = (id: string, ofId: string) =>
    run(
      () => markDuplicate({ variables: { id, ofId } }),
      'Marking duplicate failed'
    );

  const resetPaging = () => setSkip(0);

  return (
    <div className='p-6 space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>Player Reports</h1>
        <p className='text-muted-foreground'>
          Bugs, typos and ideas filed in game, ranked by importance. Rank weighs
          type, duplicate reports, distinct reporters, recency and the manual
          priority.
        </p>
      </div>

      {reportsQuery.error && (
        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertDescription>{reportsQuery.error.message}</AlertDescription>
        </Alert>
      )}
      {actionError && (
        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Default view: open and in-progress reports, best rank first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-4 items-end'>
            <div className='space-y-2'>
              <Label htmlFor='report-status-filter'>Status</Label>
              <select
                id='report-status-filter'
                className={SELECT_CLASS}
                value={status}
                onChange={e => {
                  setStatus(e.target.value as StatusChoice);
                  resetPaging();
                }}
              >
                <option value='ACTIVE'>Open + in progress</option>
                <option value='ALL'>All</option>
                {STATUSES.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='report-type-filter'>Type</Label>
              <select
                id='report-type-filter'
                className={SELECT_CLASS}
                value={type}
                onChange={e => {
                  setType(e.target.value as ReportType | '');
                  resetPaging();
                }}
              >
                <option value=''>All types</option>
                {TYPES.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='report-sort'>Sort</Label>
              <select
                id='report-sort'
                className={SELECT_CLASS}
                value={sort}
                onChange={e => {
                  setSort(e.target.value as 'RANK' | 'NEWEST');
                  resetPaging();
                }}
              >
                <option value='RANK'>Rank</option>
                <option value='NEWEST'>Newest</option>
              </select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='report-search'>Search</Label>
              <Input
                id='report-search'
                value={search}
                placeholder='Message or reporter'
                onChange={e => {
                  setSearch(e.target.value);
                  resetPaging();
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reports ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {reportsQuery.loading && items.length === 0 ? (
            <div className='flex items-center justify-center p-8'>
              <Loader2 className='h-6 w-6 animate-spin' />
            </div>
          ) : items.length === 0 ? (
            <p className='text-muted-foreground'>No reports match.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Similar</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(report => (
                  <ReportRow
                    key={report.id}
                    report={report}
                    candidates={items}
                    canEdit={canEdit}
                    open={expanded === report.id}
                    onToggle={() =>
                      setExpanded(expanded === report.id ? null : report.id)
                    }
                    onStatus={next => setReportStatus(report.id, next)}
                    onPriority={p => setPriority(report.id, p)}
                    onNote={text => saveNote(report.id, text)}
                    onDuplicate={ofId => setDuplicate(report.id, ofId)}
                  />
                ))}
              </TableBody>
            </Table>
          )}
          {total > PAGE_SIZE && (
            <div className='flex items-center justify-between pt-4'>
              <Button
                variant='outline'
                size='sm'
                disabled={skip === 0}
                onClick={() => setSkip(Math.max(0, skip - PAGE_SIZE))}
              >
                Previous
              </Button>
              <span className='text-sm text-muted-foreground'>
                {skip + 1}-{Math.min(skip + PAGE_SIZE, total)} of {total}
              </span>
              <Button
                variant='outline'
                size='sm'
                disabled={skip + PAGE_SIZE >= total}
                onClick={() => setSkip(skip + PAGE_SIZE)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface ReportRowProps {
  report: ReportFieldsFragment;
  candidates: ReportFieldsFragment[];
  canEdit: boolean;
  open: boolean;
  onToggle: () => void;
  onStatus: (status: ReportStatus) => void;
  onPriority: (priority: number) => void;
  onNote: (text: string) => void;
  onDuplicate: (ofId: string) => void;
}

function ReportRow({
  report,
  candidates,
  canEdit,
  open,
  onToggle,
  onStatus,
  onPriority,
  onNote,
  onDuplicate,
}: ReportRowProps) {
  const [note, setNote] = useState(report.resolution ?? '');
  const [dupTarget, setDupTarget] = useState('');
  const long = report.message.length > MESSAGE_PREVIEW;
  const hasRoom = report.roomZoneId != null && report.roomId != null;

  return (
    <Fragment>
      <TableRow>
        <TableCell className='font-medium'>#{report.rank}</TableCell>
        <TableCell>
          <Badge className={TYPE_STYLE[report.reportType]} variant='outline'>
            {report.reportType}
          </Badge>
        </TableCell>
        <TableCell>{report.score}</TableCell>
        <TableCell className='max-w-md'>
          <button
            type='button'
            className='flex items-start gap-1 text-left'
            aria-expanded={open}
            aria-label={`${open ? 'Collapse' : 'Expand'} report ${report.id}`}
            onClick={onToggle}
          >
            {open ? (
              <ChevronDown className='h-4 w-4 mt-0.5 shrink-0' />
            ) : (
              <ChevronRight className='h-4 w-4 mt-0.5 shrink-0' />
            )}
            <span>
              {long
                ? `${report.message.slice(0, MESSAGE_PREVIEW)}...`
                : report.message}
            </span>
          </button>
        </TableCell>
        <TableCell>{report.reporterName}</TableCell>
        <TableCell>
          {hasRoom ? (
            <Link
              className='text-primary underline-offset-2 hover:underline'
              href={`/dashboard/zones/editor?zone=${report.roomZoneId}&room=${report.roomId}`}
            >
              {report.roomZoneId}:{report.roomId}
            </Link>
          ) : (
            <span className='text-muted-foreground'>-</span>
          )}
        </TableCell>
        <TableCell>{report.similarCount}</TableCell>
        <TableCell>{formatAge(report.createdAt)}</TableCell>
        <TableCell>
          {canEdit ? (
            <select
              aria-label={`Status of report ${report.id}`}
              className={SELECT_CLASS}
              value={report.status}
              onChange={e => onStatus(e.target.value as ReportStatus)}
            >
              {STATUSES.filter(
                s => s !== 'DUPLICATE' || s === report.status
              ).map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          ) : (
            <Badge variant='secondary'>{report.status}</Badge>
          )}
        </TableCell>
        <TableCell>
          {canEdit ? (
            <select
              aria-label={`Priority of report ${report.id}`}
              className={SELECT_CLASS}
              value={report.priority ?? -1}
              onChange={e => onPriority(Number(e.target.value))}
            >
              {PRIORITIES.map(p => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          ) : (
            <span>
              {report.priority == null ? 'Auto' : `P${report.priority}`}
            </span>
          )}
        </TableCell>
      </TableRow>
      {open && (
        <TableRow>
          <TableCell colSpan={10} className='bg-muted/30'>
            <div className='space-y-3 p-2'>
              <p className='whitespace-pre-wrap'>{report.message}</p>
              <div className='text-xs text-muted-foreground'>
                Filed {new Date(report.createdAt).toLocaleString()} by{' '}
                {report.reporterName}
                {report.duplicateOfId != null &&
                  ` | duplicate of #${report.duplicateOfId}`}
                {report.resolvedBy && ` | closed by ${report.resolvedBy}`}
              </div>
              {canEdit && (
                <div className='grid gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor={`note-${report.id}`}>Resolution note</Label>
                    <textarea
                      id={`note-${report.id}`}
                      className='flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                      value={note}
                      onChange={e => setNote(e.target.value)}
                    />
                    <Button size='sm' onClick={() => onNote(note)}>
                      Save note
                    </Button>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor={`dup-${report.id}`}>Duplicate of</Label>
                    <select
                      id={`dup-${report.id}`}
                      className={SELECT_CLASS}
                      value={dupTarget}
                      onChange={e => setDupTarget(e.target.value)}
                    >
                      <option value=''>Select target report</option>
                      {candidates
                        .filter(c => c.id !== report.id)
                        .map(c => (
                          <option key={c.id} value={c.id}>
                            #{c.id} {c.reportType}: {c.message.slice(0, 60)}
                          </option>
                        ))}
                    </select>
                    <Button
                      size='sm'
                      variant='outline'
                      disabled={!dupTarget}
                      onClick={() => onDuplicate(dupTarget)}
                    >
                      Mark duplicate
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  );
}
