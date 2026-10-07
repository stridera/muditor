import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  CreateDialogueNodeDocument,
  CreateDialogueResponseDocument,
  CreateQuestDialogueDocument,
  CreateQuestDialogueTreeDocument,
  GetDialogueTreeDocument,
  UpdateDialogueResponseDocument,
  UpdateQuestDialogueDocument,
} from '@/generated/graphql';
import { QuestDialogueEditor } from '../QuestDialogueEditor';
import type { DialogueFormData } from '../quest-form';

jest.mock('@/components/help/HelpButton', () => ({ HelpButton: () => null }));

const mutations = new Map<unknown, jest.Mock>();
const mockMutation = (doc: unknown) => {
  if (!mutations.has(doc)) mutations.set(doc, jest.fn());
  return mutations.get(doc)!;
};
const mockRefetch = jest.fn();

const mockTree = {
  loading: false,
  refetch: mockRefetch,
  data: {
    dialogueTree: {
      id: 3,
      name: 'tree',
      description: null,
      nodes: [
        {
          id: 20,
          dialogueTreeId: 3,
          npcMessage: 'Care to help with the rats?',
          order: 0,
          isRoot: true,
          isTerminal: false,
          responses: [
            {
              id: 30,
              nodeId: 20,
              nextNodeId: 21,
              matchType: 'ANY_OF',
              matchKeywords: ['yes', 'sure'],
              displayHint: null,
              order: 0,
            },
          ],
        },
        {
          id: 21,
          dialogueTreeId: 3,
          npcMessage: 'Splendid!',
          order: 1,
          isRoot: false,
          isTerminal: true,
          responses: [],
        },
      ],
    },
  },
};

jest.mock('@apollo/client/react', () => ({
  useQuery: (doc: unknown) =>
    doc === GetDialogueTreeDocument
      ? mockTree
      : { loading: false, data: undefined },
  useMutation: (doc: unknown) => [mockMutation(doc), { loading: false }],
}));

const dialogue: DialogueFormData = {
  id: 7,
  npcMessage: 'Hello there',
  matchType: 'CONTAINS',
  matchKeywords: ['rats'],
  dialogueTreeId: null,
};

function renderEditor(d: DialogueFormData | null, onChange = jest.fn()) {
  render(
    <QuestDialogueEditor
      questZoneId={30}
      questId={5}
      phaseId={1}
      objectiveId={2}
      dialogue={d}
      onChange={onChange}
    />
  );
  return onChange;
}

describe('QuestDialogueEditor', () => {
  beforeEach(() => {
    mutations.clear();
    mockRefetch.mockReset();
  });

  it('creates a dialogue bound to the objective', async () => {
    mockMutation(CreateQuestDialogueDocument).mockResolvedValue({
      data: {
        createQuestDialogue: {
          id: 7,
          npcMessage: 'Greetings, traveller.',
          matchType: 'CONTAINS',
          matchKeywords: [],
          dialogueTreeId: null,
        },
      },
    });
    const onChange = renderEditor(null);
    fireEvent.click(screen.getByRole('button', { name: /Add dialogue/ }));

    await waitFor(() =>
      expect(mockMutation(CreateQuestDialogueDocument)).toHaveBeenCalledWith({
        variables: {
          data: expect.objectContaining({
            questZoneId: 30,
            questId: 5,
            phaseId: 1,
            objectiveId: 2,
          }),
        },
      })
    );
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ id: 7, matchKeywords: [] })
      )
    );
  });

  it('saves edited keywords on blur; no keywords means any topic', async () => {
    mockMutation(UpdateQuestDialogueDocument).mockResolvedValue({ data: {} });
    const onChange = renderEditor({ ...dialogue, matchKeywords: [] });
    expect(screen.getByText(/answers any topic/)).toBeInTheDocument();

    const field = screen.getByLabelText('Dialogue keywords');
    fireEvent.change(field, { target: { value: 'rats, job' } });
    fireEvent.blur(field);

    await waitFor(() =>
      expect(mockMutation(UpdateQuestDialogueDocument)).toHaveBeenCalledWith({
        variables: { id: 7, data: { matchKeywords: ['rats', 'job'] } },
      })
    );
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ matchKeywords: ['rats', 'job'] })
      )
    );
  });

  it('does not offer ANY_RESPONSE, which the game never matches', () => {
    renderEditor(dialogue);
    const options = Array.from(
      (screen.getByLabelText('Dialogue match type') as HTMLSelectElement)
        .options
    ).map(o => o.value);
    expect(options).toEqual([
      'CONTAINS',
      'EXACT',
      'STARTS_WITH',
      'ANY_OF',
      'REGEX',
    ]);
  });

  it('creates a conversation tree and reports its id', async () => {
    mockMutation(CreateQuestDialogueTreeDocument).mockResolvedValue({
      data: { createQuestDialogueTree: { id: 3, name: 'x' } },
    });
    const onChange = renderEditor(dialogue);
    fireEvent.click(
      screen.getByRole('button', { name: /Create conversation tree/ })
    );
    await waitFor(() =>
      expect(
        mockMutation(CreateQuestDialogueTreeDocument)
      ).toHaveBeenCalledWith({
        variables: { questDialogueId: 7, name: expect.any(String) },
      })
    );
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith({
        ...dialogue,
        dialogueTreeId: 3,
      })
    );
  });

  describe('with a linked tree', () => {
    const withTree = { ...dialogue, dialogueTreeId: 3 };

    it('shows nodes, the root marker and each reply', () => {
      renderEditor(withTree);
      expect(screen.getByLabelText('Node 1 NPC message')).toHaveValue(
        'Care to help with the rats?'
      );
      expect(screen.getByText('Root (opening line)')).toBeInTheDocument();
      expect(screen.getByLabelText('Reply keywords')).toHaveValue('yes, sure');
      expect(screen.getByLabelText('Reply leads to')).toHaveValue('21');
      // The root cannot be deleted; the other node can.
      expect(
        screen.queryByRole('button', { name: 'Delete node 1' })
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Delete node 2' })
      ).toBeInTheDocument();
    });

    it('adds a node and refreshes the tree', async () => {
      mockMutation(CreateDialogueNodeDocument).mockResolvedValue({ data: {} });
      renderEditor(withTree);
      fireEvent.click(screen.getByRole('button', { name: /Add node/ }));
      await waitFor(() =>
        expect(mockMutation(CreateDialogueNodeDocument)).toHaveBeenCalledWith({
          variables: { treeId: 3, data: expect.any(Object) },
        })
      );
      await waitFor(() => expect(mockRefetch).toHaveBeenCalled());
    });

    it('adds a reply to a node', async () => {
      mockMutation(CreateDialogueResponseDocument).mockResolvedValue({
        data: {},
      });
      renderEditor(withTree);
      fireEvent.click(screen.getByRole('button', { name: /Add reply/ }));
      await waitFor(() =>
        expect(
          mockMutation(CreateDialogueResponseDocument)
        ).toHaveBeenCalledWith({
          variables: {
            nodeId: 20,
            data: expect.objectContaining({ matchType: 'CONTAINS' }),
          },
        })
      );
    });

    it('re-points a reply to another node and can end the conversation', async () => {
      mockMutation(UpdateDialogueResponseDocument).mockResolvedValue({
        data: {},
      });
      renderEditor(withTree);
      fireEvent.change(screen.getByLabelText('Reply leads to'), {
        target: { value: '' },
      });
      await waitFor(() =>
        expect(
          mockMutation(UpdateDialogueResponseDocument)
        ).toHaveBeenCalledWith({
          variables: { id: 30, data: { nextNodeId: null } },
        })
      );
    });
  });
});
