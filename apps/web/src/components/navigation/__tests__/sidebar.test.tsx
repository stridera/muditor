/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Sidebar } from '../sidebar';

let mockZone: number | null = null;
let mockPathname = '/dashboard/zones';

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));
jest.mock('@/contexts/zone-context', () => ({
  useZone: () => ({ selectedZone: mockZone, setSelectedZone: jest.fn() }),
}));
jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    user: { displayName: 'Tester', role: 'IMMORTAL' },
    logout: jest.fn(),
  }),
}));
jest.mock('@/hooks/use-permissions', () => ({
  usePermissions: () => ({
    isImmortal: true,
    isBuilder: true,
    isHeadBuilder: true,
    isCoder: true,
  }),
}));
jest.mock('@apollo/client/react', () => ({
  useMutation: () => [jest.fn()],
  useQuery: () => ({ data: undefined }),
}));
jest.mock('@/components/theme-toggle', () => ({ ThemeToggle: () => null }));

function navHref(name: string): string | null {
  return screen.getByText(name).closest('a')!.getAttribute('href');
}

describe('Sidebar zone persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    mockZone = null;
    mockPathname = '/dashboard/zones';
  });

  it('carries the remembered zone on zone-scoped links only', () => {
    mockZone = 530;
    render(<Sidebar />);
    for (const name of ['Rooms', 'Mobs', 'Objects', 'Shops', 'Quests']) {
      expect(navHref(name)).toBe(`/dashboard/${name.toLowerCase()}?zone=530`);
    }
    expect(navHref('Zones')).toBe('/dashboard/zones');
    expect(navHref('Scripts')).toBe('/dashboard/scripts');
  });

  it('uses bare links when no zone is remembered', () => {
    render(<Sidebar />);
    expect(navHref('Mobs')).toBe('/dashboard/mobs');
  });

  it('still highlights the active item when its link has a query', () => {
    mockZone = 530;
    mockPathname = '/dashboard/objects';
    render(<Sidebar />);
    const link = screen.getByText('Objects').closest('a')!;
    expect(link.querySelector('div')!.className).toContain('text-primary');
  });
});
