/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import EffectsPage from './page';

let mockPerms: Record<string, unknown> = {};

jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({ user: { id: 'u1', role: 'HEAD_BUILDER' } }),
}));
jest.mock('@/hooks/use-permissions', () => ({
  usePermissions: () => mockPerms,
}));
jest.mock('@apollo/client/react', () => ({
  useMutation: () => [jest.fn(), { loading: false }],
  useQuery: (doc: { definitions: Array<{ name?: { value: string } }> }) => ({
    loading: false,
    refetch: jest.fn(),
    data:
      doc.definitions[0]?.name?.value === 'GetEffectsCount'
        ? { effectsCount: 1 }
        : {
            effects: [
              {
                id: '1',
                name: 'sanctuary',
                effectType: 'status',
                description: null,
                tags: [],
                defaultParams: null,
              },
            ],
          },
  }),
}));

const base = {
  permissions: { role: 'HEAD_BUILDER', maxCharacterLevel: 103 },
  loading: false,
  isImmortal: true,
  isBuilder: true,
  isHeadBuilder: true,
  isCoder: false,
  isImplementor: false,
};

describe('Effects page write access (Coder, level 104+)', () => {
  it('is read-only for a head builder (103)', () => {
    mockPerms = base;
    render(<EffectsPage />);
    expect(screen.getByText('sanctuary')).toBeInTheDocument();
    expect(screen.queryByText('New Effect')).toBeNull();
    expect(screen.queryByTitle('Edit effect')).toBeNull();
    expect(screen.queryByTitle('Delete effect')).toBeNull();
  });

  it('offers create, edit and delete to a coder (104)', () => {
    mockPerms = { ...base, isCoder: true };
    render(<EffectsPage />);
    expect(screen.getByText('New Effect')).toBeInTheDocument();
    expect(screen.getByTitle('Edit effect')).toBeInTheDocument();
    expect(screen.getByTitle('Delete effect')).toBeInTheDocument();
  });
});
