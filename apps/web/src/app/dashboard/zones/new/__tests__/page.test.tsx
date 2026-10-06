/**
 * Create-zone flow: form -> createZone mutation -> navigate to the new zone
 * page using the id returned by the API.
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CreateZoneDocument } from '@/generated/graphql';
import NewZonePage from '../page';

const mockPush = jest.fn();
const mockCreateZone = jest.fn();
let mutationOptions: {
  onCompleted?: (d: { createZone: { id: number; name: string } }) => void;
} = {};

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/components/auth/permission-guard', () => ({
  PermissionGuard: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@apollo/client/react', () => ({
  useQuery: () => ({
    loading: false,
    data: { zones: [{ id: 30, name: 'Mielikki' }] },
  }),
  useMutation: (doc: unknown, options: typeof mutationOptions) => {
    expect(doc).toBe(CreateZoneDocument);
    mutationOptions = options;
    return [mockCreateZone, { loading: false, error: undefined }];
  },
}));

function fill(id: string, name: string) {
  fireEvent.change(screen.getByLabelText('Zone ID'), { target: { value: id } });
  fireEvent.change(screen.getByLabelText('Zone Name'), {
    target: { value: name },
  });
}

describe('NewZonePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateZone.mockImplementation(async () => {
      const data = { createZone: { id: 9001, name: 'Test Zone' } };
      mutationOptions.onCompleted?.(data);
      return { data };
    });
  });

  it('creates the zone then navigates to its page with the returned id', async () => {
    render(<NewZonePage />);
    fill('9001', '  Test Zone ');
    fireEvent.click(screen.getByRole('button', { name: 'Create Zone' }));

    await waitFor(() => expect(mockCreateZone).toHaveBeenCalledTimes(1));
    expect(mockCreateZone).toHaveBeenCalledWith({
      variables: {
        data: expect.objectContaining({ id: 9001, name: 'Test Zone' }),
      },
    });
    expect(mockPush).toHaveBeenCalledWith('/dashboard/zones/9001');
  });

  it('does not submit or navigate for an existing or non-numeric id', () => {
    render(<NewZonePage />);
    const submit = screen.getByRole('button', { name: 'Create Zone' });

    fill('30', 'Dup');
    expect(screen.getByText('Zone 30 already exists.')).toBeVisible();
    expect(submit).toBeDisabled();

    fill('abc', 'Bad');
    expect(submit).toBeDisabled();
    fireEvent.click(submit);
    expect(mockCreateZone).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
