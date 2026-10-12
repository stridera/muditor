/**
 * The god zone checkbox: editable by HEAD_BUILDER and above only (the API
 * enforces the same rule); lower roles see it disabled and never send the flag.
 * The mobs-sleep-at-night checkbox is open to any zone editor and starts off.
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { USER_ROLES, roleAtLeast, type UserRole } from '@/lib/roles';
import { EditZoneModal } from '../edit-zone-modal';

let mockRole: UserRole = 'BUILDER';
const mockUpdateZone = jest.fn().mockResolvedValue({});

jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({ user: { id: 'u1', role: mockRole } }),
}));

jest.mock('@apollo/client/react', () => ({
  useMutation: () => [mockUpdateZone, { loading: false, error: undefined }],
}));

const zone = {
  id: 12,
  name: 'The Heavens',
  lifespan: 30,
  resetMode: 'NORMAL' as const,
  hemisphere: 'NORTHWEST' as const,
  climate: 'NONE' as const,
  isGodZone: false,
  isInternal: false,
  mobsSleepAtNight: false,
};

const renderModal = () =>
  render(
    <EditZoneModal
      zone={zone}
      isOpen
      onClose={jest.fn()}
      onSuccess={jest.fn()}
    />
  );

const label =
  /God zone \(hidden from mortals, no achievements, excluded from random teleport\)/;

describe('EditZoneModal god zone checkbox', () => {
  beforeEach(() => mockUpdateZone.mockClear());

  it.each(USER_ROLES)('is enabled only for HEAD_BUILDER+ (%s)', role => {
    mockRole = role;
    renderModal();
    const box = screen.getByLabelText(label);
    if (roleAtLeast(role, 'HEAD_BUILDER')) {
      expect(box).toBeEnabled();
    } else {
      expect(box).toBeDisabled();
    }
  });

  it('sends isGodZone when a HEAD_BUILDER ticks it', async () => {
    mockRole = 'HEAD_BUILDER';
    renderModal();
    fireEvent.click(screen.getByLabelText(label));
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(mockUpdateZone).toHaveBeenCalled());
    expect(mockUpdateZone.mock.calls[0]![0].variables.data).toMatchObject({
      isGodZone: true,
    });
  });

  it('never sends isGodZone for a BUILDER', async () => {
    mockRole = 'BUILDER';
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(mockUpdateZone).toHaveBeenCalled());
    expect(mockUpdateZone.mock.calls[0]![0].variables.data).not.toHaveProperty(
      'isGodZone'
    );
  });
});

describe('EditZoneModal internal zone checkbox', () => {
  const internalLabel = /Internal zone \(plumbing/;
  beforeEach(() => mockUpdateZone.mockClear());

  it.each(USER_ROLES)('is enabled only for HEAD_BUILDER+ (%s)', role => {
    mockRole = role;
    renderModal();
    const box = screen.getByLabelText(internalLabel);
    if (roleAtLeast(role, 'HEAD_BUILDER')) {
      expect(box).toBeEnabled();
    } else {
      expect(box).toBeDisabled();
    }
  });

  it('sends isInternal when a HEAD_BUILDER ticks it, never for a BUILDER', async () => {
    mockRole = 'HEAD_BUILDER';
    renderModal();
    fireEvent.click(screen.getByLabelText(internalLabel));
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(mockUpdateZone).toHaveBeenCalledTimes(1));
    expect(mockUpdateZone.mock.calls[0]![0].variables.data).toMatchObject({
      isInternal: true,
    });

    mockRole = 'BUILDER';
    renderModal();
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Save Changes' }).at(-1)!
    );
    await waitFor(() => expect(mockUpdateZone).toHaveBeenCalledTimes(2));
    expect(mockUpdateZone.mock.calls[1]![0].variables.data).not.toHaveProperty(
      'isInternal'
    );
  });
});

describe('EditZoneModal mobs sleep at night checkbox', () => {
  const sleepLabel = /Mobs sleep at night/;
  beforeEach(() => mockUpdateZone.mockClear());

  it('starts unticked and is editable by a BUILDER', () => {
    mockRole = 'BUILDER';
    renderModal();
    const box = screen.getByLabelText(sleepLabel);
    expect(box).not.toBeChecked();
    expect(box).toBeEnabled();
  });

  it('sends mobsSleepAtNight: false untouched and true once ticked', async () => {
    mockRole = 'BUILDER';
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(mockUpdateZone).toHaveBeenCalledTimes(1));
    expect(mockUpdateZone.mock.calls[0]![0].variables.data).toMatchObject({
      mobsSleepAtNight: false,
    });

    fireEvent.click(screen.getByLabelText(sleepLabel));
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(mockUpdateZone).toHaveBeenCalledTimes(2));
    expect(mockUpdateZone.mock.calls[1]![0].variables.data).toMatchObject({
      mobsSleepAtNight: true,
    });
  });
});
