/**
 * Quests list: the Delete button opens a confirmation dialog, deletes through
 * the deleteQuest mutation, and refreshes the list.
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DeleteQuestDocument, GetQuestsDocument } from '@/generated/graphql';
import QuestsPage from '../page';

const mockDeleteQuest = jest.fn();
const mockRefetch = jest.fn();
let mockCanEditZone = (_zoneId?: number) => true;

const quests = [
  {
    zoneId: 30,
    id: 5,
    name: 'Rats in the Cellar',
    description: 'Kill them',
    minLevel: 1,
    maxLevel: 20,
    repeatable: false,
    hidden: false,
    phases: [],
    prerequisites: [],
  },
  {
    zoneId: 31,
    id: 2,
    name: 'Foreign Quest',
    description: '',
    minLevel: 1,
    maxLevel: 20,
    repeatable: false,
    hidden: false,
    phases: [],
    prerequisites: [],
  },
];

jest.mock('@/hooks/use-permissions', () => ({
  usePermissions: () => ({ canEditZone: (z?: number) => mockCanEditZone(z) }),
}));
jest.mock('@/contexts/zone-context', () => ({
  useZone: () => ({ selectedZone: null, setSelectedZone: jest.fn() }),
}));
jest.mock('@/components/auth/permission-guard', () => ({
  PermissionGuard: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@/components/dashboard/dual-interface', () => ({
  DualInterface: ({ adminView }: { adminView: React.ReactNode }) => adminView,
}));
jest.mock('@/components/help/HelpButton', () => ({ HelpButton: () => null }));
jest.mock('@/components/ColoredTextViewer', () => ({
  ColoredTextInline: ({ markup }: { markup: string }) => <>{markup}</>,
}));
jest.mock('@apollo/client/react', () => ({
  useQuery: (doc: unknown) =>
    doc === GetQuestsDocument
      ? { loading: false, data: { quests }, refetch: mockRefetch }
      : { loading: false, data: undefined },
  useMutation: (doc: unknown) =>
    doc === DeleteQuestDocument
      ? [mockDeleteQuest, { loading: false }]
      : [jest.fn(), { loading: false }],
}));

describe('quests list Delete', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCanEditZone = () => true;
    mockDeleteQuest.mockResolvedValue({ data: { deleteQuest: {} } });
  });

  it('asks for confirmation before deleting', () => {
    render(<QuestsPage />);
    fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]!);

    expect(screen.getByText('Delete quest')).toBeInTheDocument();
    expect(mockDeleteQuest).not.toHaveBeenCalled();
  });

  it('Cancel closes the dialog without deleting', async () => {
    render(<QuestsPage />);
    fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]!);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() =>
      expect(screen.queryByText('Delete quest')).not.toBeInTheDocument()
    );
    expect(mockDeleteQuest).not.toHaveBeenCalled();
  });

  it('confirming deletes that quest and refreshes the list', async () => {
    render(<QuestsPage />);
    fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]!);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() =>
      expect(mockDeleteQuest).toHaveBeenCalledWith({
        variables: { zoneId: 30, id: 5 },
      })
    );
    await waitFor(() => expect(mockRefetch).toHaveBeenCalled());
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Deleted quest 30:5.'
    );
  });

  it('shows the server refusal and keeps the dialog open', async () => {
    mockDeleteQuest.mockRejectedValue(new Error('Forbidden resource'));
    render(<QuestsPage />);
    fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]!);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Forbidden resource'
    );
    expect(screen.getByText('Delete quest')).toBeInTheDocument();
    expect(mockRefetch).not.toHaveBeenCalled();
  });

  it('hides Delete for zones the user cannot edit', () => {
    mockCanEditZone = () => false;
    render(<QuestsPage />);
    expect(
      screen.queryByRole('button', { name: /delete/i })
    ).not.toBeInTheDocument();
    // Edit stays available for read access.
    expect(screen.getAllByText('Edit')).toHaveLength(2);
  });
});
