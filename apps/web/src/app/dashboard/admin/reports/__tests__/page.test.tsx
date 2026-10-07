/**
 * Player reports admin page: ranked list, role gating and actions.
 */
import '@testing-library/jest-dom';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import {
  MarkReportDuplicateDocument,
  ReportsListDocument,
  UpdateReportDocument,
} from '@/generated/graphql';
import { formatAge } from '@/lib/report-utils';
import ReportsAdminPage from '../page';

const mockUpdateReport = jest.fn();
const mockMarkDuplicate = jest.fn();
let mockPerms = { isImmortal: true, isHeadBuilder: true, loading: false };
let lastVariables: unknown;

jest.mock('@/hooks/use-permissions', () => ({
  usePermissions: () => mockPerms,
}));

const now = Date.now();
const ago = (ms: number) => new Date(now - ms).toISOString();

const REPORTS = [
  {
    id: '2',
    reportType: 'BUG',
    status: 'OPEN',
    reporterName: 'Alice',
    roomZoneId: 30,
    roomId: 12,
    message: 'The tavern door is stuck and nobody can leave',
    resolvedBy: null,
    resolvedAt: null,
    resolution: null,
    priority: null,
    duplicateOfId: null,
    tags: [],
    assignedTo: null,
    createdAt: ago(2 * 3600_000),
    score: 140,
    rank: 1,
    similarCount: 2,
  },
  {
    id: '1',
    reportType: 'TYPO',
    status: 'IN_PROGRESS',
    reporterName: 'Bob',
    roomZoneId: null,
    roomId: null,
    message: 'x'.repeat(150),
    resolvedBy: null,
    resolvedAt: null,
    resolution: null,
    priority: 2,
    duplicateOfId: null,
    tags: [],
    assignedTo: null,
    createdAt: ago(3 * 24 * 3600_000),
    score: 55,
    rank: 2,
    similarCount: 0,
  },
];

jest.mock('@apollo/client/react', () => ({
  useQuery: (doc: unknown, opts: { variables?: unknown }) => {
    if (doc === ReportsListDocument) {
      lastVariables = opts?.variables;
      return {
        loading: false,
        data: { reports: { total: 2, items: REPORTS } },
      };
    }
    return { loading: false, data: undefined };
  },
  useMutation: (doc: unknown) =>
    doc === UpdateReportDocument
      ? [mockUpdateReport, { loading: false }]
      : doc === MarkReportDuplicateDocument
        ? [mockMarkDuplicate, { loading: false }]
        : [jest.fn(), { loading: false }],
}));

describe('ReportsAdminPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerms = { isImmortal: true, isHeadBuilder: true, loading: false };
    mockUpdateReport.mockResolvedValue({ data: {} });
    mockMarkDuplicate.mockResolvedValue({ data: {} });
  });

  it('renders the ranked list with score, similar count and a room link', () => {
    render(<ReportsAdminPage />);
    const rows = screen.getAllByRole('row');
    // header + 2 reports
    expect(within(rows[1]!).getByText('#1')).toBeVisible();
    expect(within(rows[1]!).getByText('BUG')).toBeVisible();
    expect(within(rows[1]!).getByText('140')).toBeVisible();
    expect(within(rows[1]!).getByText('Alice')).toBeVisible();
    expect(within(rows[2]!).getByText('#2')).toBeVisible();
    expect(screen.getByRole('link', { name: '30:12' })).toHaveAttribute(
      'href',
      '/dashboard/zones/editor?zone=30&room=12'
    );
  });

  it('defaults to open + in progress sorted by rank', () => {
    render(<ReportsAdminPage />);
    expect(lastVariables).toMatchObject({
      sort: 'RANK',
      filter: { status: ['OPEN', 'IN_PROGRESS'] },
    });
  });

  it('truncates long messages and expands them', () => {
    render(<ReportsAdminPage />);
    expect(screen.queryByText('x'.repeat(150))).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Expand report 1'));
    expect(screen.getByText('x'.repeat(150))).toBeVisible();
  });

  it('lets an IMMORTAL view but not edit', () => {
    mockPerms = { isImmortal: true, isHeadBuilder: false, loading: false };
    render(<ReportsAdminPage />);
    expect(screen.getByText('Alice')).toBeVisible();
    expect(
      screen.queryByLabelText('Status of report 2')
    ).not.toBeInTheDocument();
  });

  it('denies a PLAYER', () => {
    mockPerms = { isImmortal: false, isHeadBuilder: false, loading: false };
    render(<ReportsAdminPage />);
    expect(screen.getByText(/do not have permission/i)).toBeVisible();
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
  });

  it('calls updateReport when the status changes', async () => {
    render(<ReportsAdminPage />);
    fireEvent.change(screen.getByLabelText('Status of report 2'), {
      target: { value: 'RESOLVED' },
    });
    await waitFor(() =>
      expect(mockUpdateReport).toHaveBeenCalledWith({
        variables: { id: '2', data: { status: 'RESOLVED' } },
      })
    );
  });

  it('calls updateReport with the priority and -1 for Auto', async () => {
    render(<ReportsAdminPage />);
    fireEvent.change(screen.getByLabelText('Priority of report 1'), {
      target: { value: '-1' },
    });
    await waitFor(() =>
      expect(mockUpdateReport).toHaveBeenCalledWith({
        variables: { id: '1', data: { priority: -1 } },
      })
    );
  });

  it('saves a resolution note and marks a duplicate', async () => {
    render(<ReportsAdminPage />);
    fireEvent.click(screen.getByLabelText('Expand report 1'));
    fireEvent.change(screen.getByLabelText('Resolution note'), {
      target: { value: 'fixed in zone 30' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save note' }));
    await waitFor(() =>
      expect(mockUpdateReport).toHaveBeenCalledWith({
        variables: { id: '1', data: { resolution: 'fixed in zone 30' } },
      })
    );
    fireEvent.change(screen.getByLabelText('Duplicate of'), {
      target: { value: '2' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Mark duplicate' }));
    await waitFor(() =>
      expect(mockMarkDuplicate).toHaveBeenCalledWith({
        variables: { id: '1', ofId: '2' },
      })
    );
  });
});

describe('formatAge', () => {
  it('formats minutes, hours and days', () => {
    const n = Date.UTC(2026, 9, 7, 12);
    expect(formatAge(new Date(n - 5 * 60_000), n)).toBe('5m');
    expect(formatAge(new Date(n - 3 * 3600_000), n)).toBe('3h');
    expect(formatAge(new Date(n - 50 * 3600_000), n)).toBe('2d');
  });
});
