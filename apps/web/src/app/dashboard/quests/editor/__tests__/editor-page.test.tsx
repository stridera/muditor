/**
 * Quest editor page: phase reordering is persisted through
 * reorderQuestPhases, and the objective card follows the objective type.
 */
import '@testing-library/jest-dom';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import {
  GetQuestDocument,
  ReorderQuestPhasesDocument,
  UpdateQuestObjectiveDocument,
} from '@/generated/graphql';
import QuestEditor from '../page';

const mutations = new Map<unknown, jest.Mock>();
const mockMutation = (doc: unknown) => {
  if (!mutations.has(doc)) mutations.set(doc, jest.fn());
  return mutations.get(doc)!;
};

const objective = (id: number, type: string) => ({
  id,
  questZoneId: 30,
  questId: 5,
  phaseId: 1,
  objectiveType: type,
  scope: 'SOLO',
  playerDescription: `Objective ${id}`,
  internalNote: null,
  showProgress: true,
  requiredCount: 1,
  targetMobZoneId: null,
  targetMobId: null,
  targetObjectZoneId: null,
  targetObjectId: null,
  targetRoomZoneId: null,
  targetRoomId: null,
  targetAbilityId: null,
  deliverToMobZoneId: null,
  deliverToMobId: null,
  luaExpression: null,
  dialogue: null,
});

const phase = (id: number, order: number, name: string, objectives = []) => ({
  id,
  questZoneId: 30,
  questId: 5,
  name,
  description: null,
  order,
  objectives,
  rewards: [],
});

const quest = {
  zoneId: 30,
  id: 5,
  name: 'Rats in the Cellar',
  description: null,
  shortDescription: null,
  minLevel: 1,
  maxLevel: 100,
  repeatable: false,
  hidden: false,
  autoAccept: false,
  shareable: true,
  cooldownMinutes: null,
  exclusiveGroup: null,
  triggerType: 'MANUAL',
  triggerMobZoneId: null,
  triggerMobId: null,
  triggerLevel: null,
  triggerItemZoneId: null,
  triggerItemId: null,
  triggerRoomZoneId: null,
  triggerRoomId: null,
  triggerAbilityId: null,
  triggerEventId: null,
  timeLimitMinutes: null,
  availabilityRequirement: null,
  phases: [
    phase(1, 0, 'Clear the cellar', [objective(1, 'KILL_MOB') as never]),
    phase(2, 1, 'Report back'),
    phase(3, 2, 'Collect payment'),
  ],
  prerequisites: [],
};

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => ({
    get: (key: string) => (key === 'zone' ? '30' : key === 'id' ? '5' : null),
  }),
}));
jest.mock('@/components/auth/permission-guard', () => ({
  PermissionGuard: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@/components/help/HelpButton', () => ({ HelpButton: () => null }));
jest.mock('@/components/ColoredInput', () => ({
  ColoredInput: ({ value }: { value: string }) => (
    <input value={value} readOnly />
  ),
}));
jest.mock('@/components/ColoredTextarea', () => ({
  ColoredTextarea: ({ value }: { value: string }) => (
    <textarea value={value} readOnly />
  ),
}));
jest.mock('@/components/ColoredTextViewer', () => ({
  ColoredTextInline: ({ markup }: { markup: string }) => <>{markup}</>,
}));
jest.mock('@/components/quests/EntityAutocomplete', () => ({
  EntityAutocomplete: ({ entityType }: { entityType: string }) => (
    <div data-testid={`entity-${entityType}`} />
  ),
}));
jest.mock('@/components/quests/AbilityPicker', () => ({
  AbilityPicker: () => <div data-testid='ability-picker' />,
}));
jest.mock('@/components/quests/QuestDialogueEditor', () => ({
  QuestDialogueEditor: () => <div data-testid='dialogue-editor' />,
}));
jest.mock('@/components/quests/PrerequisitesEditor', () => ({
  PrerequisitesEditor: () => <div data-testid='prerequisites-editor' />,
}));
// Apollo returns a stable result object; the page's load effect keys on it.
const mockQuestResult = { loading: false, error: undefined, data: { quest } };
jest.mock('@apollo/client/react', () => ({
  useQuery: (doc: unknown) =>
    doc === GetQuestDocument
      ? mockQuestResult
      : { loading: false, data: undefined },
  useMutation: (doc: unknown) => [mockMutation(doc), { loading: false }],
}));

const phaseNames = () =>
  screen
    .getAllByDisplayValue(/Clear the cellar|Report back|Collect payment/)
    .map(el => (el as HTMLInputElement).value);

function openPhasesTab() {
  render(<QuestEditor />);
  fireEvent.click(screen.getByRole('button', { name: 'Phases & Objectives' }));
}

describe('quest editor phase reorder', () => {
  beforeEach(() => {
    mutations.clear();
    mockMutation(ReorderQuestPhasesDocument).mockResolvedValue({ data: {} });
  });

  it('moving a phase down persists the new order and reorders the list', async () => {
    openPhasesTab();
    expect(phaseNames()).toEqual([
      'Clear the cellar',
      'Report back',
      'Collect payment',
    ]);

    fireEvent.click(
      screen.getByRole('button', { name: 'Move phase Clear the cellar down' })
    );

    await waitFor(() =>
      expect(mockMutation(ReorderQuestPhasesDocument)).toHaveBeenCalledWith({
        variables: { questZoneId: 30, questId: 5, phaseIds: [2, 1, 3] },
      })
    );
    expect(phaseNames()).toEqual([
      'Report back',
      'Clear the cellar',
      'Collect payment',
    ]);
  });

  it('moving a phase up sends the full new id order', async () => {
    openPhasesTab();
    fireEvent.click(
      screen.getByRole('button', { name: 'Move phase Collect payment up' })
    );
    await waitFor(() =>
      expect(mockMutation(ReorderQuestPhasesDocument)).toHaveBeenCalledWith({
        variables: { questZoneId: 30, questId: 5, phaseIds: [1, 3, 2] },
      })
    );
  });

  it('cannot move the first phase up or the last phase down', () => {
    openPhasesTab();
    expect(
      screen.getByRole('button', { name: 'Move phase Clear the cellar up' })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Move phase Collect payment down' })
    ).toBeDisabled();
  });

  it('restores the old order and reports an error when saving fails', async () => {
    mockMutation(ReorderQuestPhasesDocument).mockRejectedValue(
      new Error('boom')
    );
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    openPhasesTab();
    fireEvent.click(
      screen.getByRole('button', { name: 'Move phase Clear the cellar down' })
    );

    expect(await screen.findByText('Failed to reorder phases.')).toBeVisible();
    expect(phaseNames()).toEqual([
      'Clear the cellar',
      'Report back',
      'Collect payment',
    ]);
  });
});

describe('quest editor objective card', () => {
  beforeEach(() => {
    mutations.clear();
    mockMutation(UpdateQuestObjectiveDocument).mockResolvedValue({ data: {} });
  });

  it('shows a mob picker for Kill Mob and swaps it when the type changes', async () => {
    openPhasesTab();
    expect(screen.getAllByTestId('entity-mob')).toHaveLength(1);
    expect(screen.queryByTestId('entity-room')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Objective type'), {
      target: { value: 'VISIT_ROOM' },
    });

    expect(screen.queryByTestId('entity-mob')).not.toBeInTheDocument();
    expect(screen.getByTestId('entity-room')).toBeInTheDocument();
    await waitFor(() =>
      expect(mockMutation(UpdateQuestObjectiveDocument)).toHaveBeenCalledWith({
        variables: expect.objectContaining({
          phaseId: 1,
          id: 1,
          data: expect.objectContaining({
            objectiveType: 'VISIT_ROOM',
            targetMobId: null,
          }),
        }),
      })
    );
  });

  it('debounces typing into the description into one save', async () => {
    jest.useFakeTimers();
    try {
      openPhasesTab();
      const field = screen.getByLabelText('Player-visible description');
      fireEvent.change(field, { target: { value: 'Kill 5' } });
      fireEvent.change(field, { target: { value: 'Kill 5 rats' } });
      expect(mockMutation(UpdateQuestObjectiveDocument)).not.toHaveBeenCalled();

      await act(async () => {
        jest.advanceTimersByTime(700);
      });
      expect(mockMutation(UpdateQuestObjectiveDocument)).toHaveBeenCalledTimes(
        1
      );
      expect(mockMutation(UpdateQuestObjectiveDocument)).toHaveBeenCalledWith({
        variables: expect.objectContaining({
          data: { playerDescription: 'Kill 5 rats' },
        }),
      });
    } finally {
      jest.useRealTimers();
    }
  });

  it('keeps the objective card inside its phase', () => {
    openPhasesTab();
    const card = screen
      .getByLabelText('Objective type')
      .closest('div.bg-muted\\/50');
    expect(card).not.toBeNull();
    expect(within(card as HTMLElement).getByLabelText('Scope')).toBeVisible();
  });
});
