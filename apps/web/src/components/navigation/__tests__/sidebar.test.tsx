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
let mockPerms = {
  isImmortal: true,
  isBuilder: true,
  isHeadBuilder: true,
  isCoder: true,
  canEditAnyZone: true,
};
jest.mock('@/hooks/use-permissions', () => ({
  usePermissions: () => mockPerms,
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

describe('Sidebar at tablet widths', () => {
  const original = window.matchMedia;
  afterEach(() => {
    window.matchMedia = original;
  });

  it('shows icons only (with titles) so the page keeps its width', () => {
    window.matchMedia = ((query: string) => ({
      matches: true,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })) as unknown as typeof window.matchMedia;
    render(<Sidebar />);
    expect(screen.queryByText('Mobs')).toBeNull();
    expect(screen.getByTitle('Mobs')).toBeInTheDocument();
    expect(screen.queryByLabelText('Collapse sidebar')).toBeInTheDocument();
  });

  it('keeps the labels on desktop widths', () => {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })) as unknown as typeof window.matchMedia;
    render(<Sidebar />);
    expect(screen.getByText('Mobs')).toBeInTheDocument();
  });
});

describe('Sidebar Scripts / Effects visibility', () => {
  const base = {
    isImmortal: true,
    isBuilder: true,
    isHeadBuilder: false,
    isCoder: false,
    canEditAnyZone: false,
  };
  afterEach(() => {
    mockPerms = {
      isImmortal: true,
      isBuilder: true,
      isHeadBuilder: true,
      isCoder: true,
      canEditAnyZone: true,
    };
  });

  it('shows Scripts (read-only) to an immortal (100) with no zone grant', () => {
    mockPerms = { ...base, isBuilder: false };
    render(<Sidebar />);
    expect(screen.getByText('Scripts')).toBeInTheDocument();
  });

  it('shows Scripts to a builder with no zone grant', () => {
    mockPerms = base;
    render(<Sidebar />);
    expect(screen.getByText('Scripts')).toBeInTheDocument();
    expect(screen.queryByText('Effects')).toBeNull();
  });

  it('hides Scripts from non-staff', () => {
    mockPerms = { ...base, isImmortal: false, isBuilder: false };
    render(<Sidebar />);
    expect(screen.queryByText('Scripts')).toBeNull();
  });

  it('shows Scripts to a head builder (103) but Effects only from coder (104)', () => {
    mockPerms = { ...base, isHeadBuilder: true, canEditAnyZone: true };
    render(<Sidebar />);
    expect(screen.getByText('Scripts')).toBeInTheDocument();
    expect(screen.queryByText('Effects')).toBeNull();
  });

  it('shows Effects to a coder (104)', () => {
    mockPerms = {
      ...base,
      isHeadBuilder: true,
      isCoder: true,
      canEditAnyZone: true,
    };
    render(<Sidebar />);
    expect(screen.getByText('Effects')).toBeInTheDocument();
  });
});

describe('Sidebar Socials / System Messages / Validation visibility', () => {
  const immortal = {
    isImmortal: true,
    isBuilder: false,
    isHeadBuilder: false,
    isCoder: false,
    canEditAnyZone: false,
  };
  afterEach(() => {
    mockPerms = {
      isImmortal: true,
      isBuilder: true,
      isHeadBuilder: true,
      isCoder: true,
      canEditAnyZone: true,
    };
  });

  it('shows Socials and System Messages to an immortal but hides Validation', () => {
    mockPerms = immortal;
    render(<Sidebar />);
    expect(screen.getByText('Socials')).toBeInTheDocument();
    expect(screen.getByText('System Messages')).toBeInTheDocument();
    expect(screen.queryByText('Validation')).toBeNull();
  });

  it('shows Validation to a builder', () => {
    mockPerms = { ...immortal, isBuilder: true };
    render(<Sidebar />);
    expect(screen.getByText('Validation')).toBeInTheDocument();
  });
});
