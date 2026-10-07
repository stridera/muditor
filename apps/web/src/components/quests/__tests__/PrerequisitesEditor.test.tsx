import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  CreateQuestPrerequisiteDocument,
  DeleteQuestPrerequisiteDocument,
  GetQuestOptionsDocument,
} from '@/generated/graphql';
import { PrerequisitesEditor } from '../PrerequisitesEditor';

const mockCreate = jest.fn();
const mockDelete = jest.fn();

jest.mock('@/components/help/HelpButton', () => ({ HelpButton: () => null }));
jest.mock('@/components/ColoredTextViewer', () => ({
  ColoredTextInline: ({ markup }: { markup: string }) => <>{markup}</>,
}));

const mockQuestOptions = {
  loading: false,
  data: {
    quests: [
      { zoneId: 30, id: 5, name: 'This quest' },
      { zoneId: 30, id: 4, name: 'The Cellar Door' },
      { zoneId: 31, id: 1, name: 'Foreign Errand' },
      { zoneId: 30, id: 2, name: 'Already required' },
    ],
  },
};
jest.mock('@apollo/client/react', () => ({
  useQuery: (doc: unknown) =>
    doc === GetQuestOptionsDocument
      ? mockQuestOptions
      : { loading: false, data: undefined },
  useMutation: (doc: unknown) =>
    doc === CreateQuestPrerequisiteDocument
      ? [mockCreate, { loading: false }]
      : doc === DeleteQuestPrerequisiteDocument
        ? [mockDelete, { loading: false }]
        : [jest.fn(), { loading: false }],
}));

const existing = [
  {
    id: 9,
    prerequisiteQuestZoneId: 30,
    prerequisiteQuestId: 2,
    requireCompletion: true,
  },
];

function renderEditor(onChange = jest.fn(), prerequisites = existing) {
  render(
    <PrerequisitesEditor
      questZoneId={30}
      questId={5}
      prerequisites={prerequisites}
      onChange={onChange}
    />
  );
  return onChange;
}

describe('PrerequisitesEditor', () => {
  beforeEach(() => jest.clearAllMocks());

  it('lists existing prerequisites with the quest name', () => {
    renderEditor();
    expect(screen.getByText('Already required')).toBeInTheDocument();
    expect(screen.getByText('[30:2]')).toBeInTheDocument();
  });

  it('does not offer the quest itself or quests already required', () => {
    renderEditor();
    const options = Array.from(
      (screen.getByLabelText('Prerequisite quest') as HTMLSelectElement).options
    ).map(o => o.value);
    expect(options).toEqual(['', '30:4', '31:1']);
  });

  it('filters the candidates by name', () => {
    renderEditor();
    fireEvent.change(screen.getByLabelText('Filter quests'), {
      target: { value: 'foreign' },
    });
    const options = Array.from(
      (screen.getByLabelText('Prerequisite quest') as HTMLSelectElement).options
    ).map(o => o.value);
    expect(options).toEqual(['', '31:1']);
  });

  it('adds the selected quest and reports the new row', async () => {
    mockCreate.mockResolvedValue({
      data: {
        createQuestPrerequisite: {
          id: 10,
          prerequisiteQuestZoneId: 31,
          prerequisiteQuestId: 1,
          requireCompletion: true,
        },
      },
    });
    const onChange = renderEditor();
    fireEvent.change(screen.getByLabelText('Prerequisite quest'), {
      target: { value: '31:1' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Add$/ }));

    await waitFor(() =>
      expect(mockCreate).toHaveBeenCalledWith({
        variables: {
          data: {
            questZoneId: 30,
            questId: 5,
            prerequisiteQuestZoneId: 31,
            prerequisiteQuestId: 1,
          },
        },
      })
    );
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith([
        ...existing,
        {
          id: 10,
          prerequisiteQuestZoneId: 31,
          prerequisiteQuestId: 1,
          requireCompletion: true,
        },
      ])
    );
  });

  it('shows the server error when a prerequisite is refused (loop)', async () => {
    mockCreate.mockRejectedValue(
      new Error('That prerequisite would create a loop')
    );
    const onChange = renderEditor();
    fireEvent.change(screen.getByLabelText('Prerequisite quest'), {
      target: { value: '30:4' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Add$/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent('loop');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('removes a prerequisite', async () => {
    mockDelete.mockResolvedValue({ data: {} });
    const onChange = renderEditor();
    fireEvent.click(
      screen.getByRole('button', { name: 'Remove prerequisite 30:2' })
    );
    await waitFor(() =>
      expect(mockDelete).toHaveBeenCalledWith({ variables: { id: 9 } })
    );
    await waitFor(() => expect(onChange).toHaveBeenCalledWith([]));
  });
});
