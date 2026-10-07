'use client';

import { HelpButton } from '@/components/help/HelpButton';
import { QUESTS_HELP_ANCHORS as HELP } from '@/components/help/help-topics';
import {
  CreateQuestDialogueDocument,
  CreateQuestDialogueTreeDocument,
  DeleteDialogueTreeDocument,
  DeleteQuestDialogueDocument,
  UpdateQuestDialogueDocument,
  type DialogueMatchType,
} from '@/generated/graphql';
import { useMutation } from '@apollo/client/react';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DialogueTreeEditor } from './DialogueTreeEditor';
import { DIALOGUE_MATCH_TYPES } from './quest-constants';
import {
  formatKeywords,
  parseKeywords,
  type DialogueFormData,
} from './quest-form';

interface QuestDialogueEditorProps {
  questZoneId: number;
  questId: number;
  phaseId: number;
  objectiveId: number;
  dialogue: DialogueFormData | null;
  onChange: (dialogue: DialogueFormData | null) => void;
}

const INPUT =
  'block w-full rounded-md border border-input bg-background shadow-sm sm:text-sm';

/**
 * Dialogue for a Talk to NPC objective: what the NPC says when the player asks
 * about a matching topic, and an optional conversation tree for follow-ups.
 * Text fields save when they lose focus. The game loads dialogue at boot, so a
 * server restart is needed before changes show up in play.
 */
export function QuestDialogueEditor({
  questZoneId,
  questId,
  phaseId,
  objectiveId,
  dialogue,
  onChange,
}: QuestDialogueEditorProps) {
  const [createDialogue] = useMutation(CreateQuestDialogueDocument);
  const [updateDialogue] = useMutation(UpdateQuestDialogueDocument);
  const [deleteDialogue] = useMutation(DeleteQuestDialogueDocument);
  const [createTree] = useMutation(CreateQuestDialogueTreeDocument);
  const [deleteTree] = useMutation(DeleteDialogueTreeDocument);

  const [message, setMessage] = useState(dialogue?.npcMessage ?? '');
  const [keywords, setKeywords] = useState(
    formatKeywords(dialogue?.matchKeywords ?? [])
  );
  const [error, setError] = useState('');

  useEffect(() => {
    setMessage(dialogue?.npcMessage ?? '');
    setKeywords(formatKeywords(dialogue?.matchKeywords ?? []));
  }, [dialogue?.id, dialogue?.npcMessage, dialogue?.matchKeywords]);

  const fail = (what: string, err: unknown) => {
    console.error(what, err);
    setError(err instanceof Error ? `${what}: ${err.message}` : what);
  };

  const handleAdd = async () => {
    setError('');
    try {
      const result = await createDialogue({
        variables: {
          data: {
            questZoneId,
            questId,
            phaseId,
            objectiveId,
            npcMessage: 'Greetings, traveller.',
            matchType: 'CONTAINS' as DialogueMatchType,
            matchKeywords: [],
          },
        },
      });
      const created = result.data?.createQuestDialogue;
      if (created) {
        onChange({
          id: created.id,
          npcMessage: created.npcMessage,
          matchType: created.matchType,
          matchKeywords: created.matchKeywords,
          dialogueTreeId: created.dialogueTreeId ?? null,
        });
      }
    } catch (err) {
      fail('Failed to add dialogue', err);
    }
  };

  const save = async (patch: Partial<DialogueFormData>) => {
    if (!dialogue) return;
    setError('');
    try {
      await updateDialogue({
        variables: {
          id: dialogue.id,
          data: {
            ...(patch.npcMessage !== undefined && {
              npcMessage: patch.npcMessage,
            }),
            ...(patch.matchType !== undefined && {
              matchType: patch.matchType,
            }),
            ...(patch.matchKeywords !== undefined && {
              matchKeywords: patch.matchKeywords,
            }),
          },
        },
      });
      onChange({ ...dialogue, ...patch });
    } catch (err) {
      fail('Failed to save dialogue', err);
    }
  };

  const handleRemove = async () => {
    if (!dialogue) return;
    if (!confirm('Remove this dialogue and its conversation tree?')) return;
    setError('');
    try {
      await deleteDialogue({ variables: { id: dialogue.id } });
      onChange(null);
    } catch (err) {
      fail('Failed to remove dialogue', err);
    }
  };

  const handleCreateTree = async () => {
    if (!dialogue) return;
    setError('');
    try {
      const result = await createTree({
        variables: {
          questDialogueId: dialogue.id,
          name: `Quest ${questZoneId}:${questId} objective ${objectiveId}`,
        },
      });
      const tree = result.data?.createQuestDialogueTree;
      if (tree) onChange({ ...dialogue, dialogueTreeId: tree.id });
    } catch (err) {
      fail('Failed to create conversation tree', err);
    }
  };

  const handleRemoveTree = async () => {
    if (!dialogue || dialogue.dialogueTreeId === null) return;
    if (!confirm('Remove the conversation tree? Its nodes are deleted.'))
      return;
    setError('');
    try {
      await deleteTree({ variables: { id: dialogue.dialogueTreeId } });
      onChange({ ...dialogue, dialogueTreeId: null });
    } catch (err) {
      fail('Failed to remove conversation tree', err);
    }
  };

  return (
    <div className='border border-border rounded-lg p-3 space-y-3 bg-background/60'>
      <div className='flex items-center justify-between'>
        <h5 className='text-sm font-medium flex items-center gap-2'>
          <MessageSquare className='w-4 h-4' />
          Dialogue
          <HelpButton
            topic='quests'
            anchor={HELP.dialogue}
            variant='icon'
            tip='How keywords, the NPC reply and conversation trees work'
          />
        </h5>
        {dialogue ? (
          <button
            type='button'
            onClick={handleRemove}
            className='text-xs text-destructive hover:underline'
          >
            Remove dialogue
          </button>
        ) : (
          <button
            type='button'
            onClick={handleAdd}
            className='inline-flex items-center text-sm text-primary hover:text-primary/80'
          >
            <Plus className='w-4 h-4 mr-1' />
            Add dialogue
          </button>
        )}
      </div>

      {error && (
        <div role='alert' className='text-xs text-destructive'>
          {error}
        </div>
      )}

      {!dialogue && (
        <p className='text-xs text-muted-foreground'>
          Without dialogue the NPC says nothing; asking it still advances the
          objective.
        </p>
      )}

      {dialogue && (
        <>
          <div className='grid grid-cols-3 gap-3'>
            <div>
              <label className='block text-xs font-medium text-muted-foreground mb-1'>
                When the player asks about
                <select
                  aria-label='Dialogue match type'
                  value={dialogue.matchType}
                  onChange={e =>
                    save({ matchType: e.target.value as DialogueMatchType })
                  }
                  className={`${INPUT} mt-1`}
                >
                  {DIALOGUE_MATCH_TYPES.map(t => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className='col-span-2'>
              <label className='block text-xs font-medium text-muted-foreground mb-1'>
                Keywords (comma separated)
                <input
                  aria-label='Dialogue keywords'
                  value={keywords}
                  onChange={e => setKeywords(e.target.value)}
                  onBlur={() => {
                    const parsed = parseKeywords(keywords);
                    if (
                      formatKeywords(parsed) !==
                      formatKeywords(dialogue.matchKeywords)
                    ) {
                      void save({ matchKeywords: parsed });
                    }
                  }}
                  placeholder='e.g. rats, cellar, job'
                  className={`${INPUT} mt-1`}
                />
              </label>
            </div>
          </div>
          {dialogue.matchKeywords.length === 0 && (
            <p className='text-xs text-muted-foreground'>
              No keywords: the NPC answers any topic the player asks about.
            </p>
          )}

          <label className='block text-xs font-medium text-muted-foreground'>
            NPC reply
            <textarea
              aria-label='NPC reply'
              value={message}
              onChange={e => setMessage(e.target.value)}
              onBlur={() => {
                if (message !== dialogue.npcMessage) {
                  void save({ npcMessage: message });
                }
              }}
              rows={2}
              className={`${INPUT} mt-1`}
            />
          </label>
          {dialogue.dialogueTreeId !== null && (
            <p className='text-xs text-muted-foreground'>
              With a conversation tree the root node&apos;s message opens the
              conversation instead of this reply.
            </p>
          )}

          <div className='pt-2 border-t border-border space-y-2'>
            <div className='flex items-center justify-between'>
              <h6 className='text-xs font-medium text-muted-foreground'>
                Conversation tree
              </h6>
              {dialogue.dialogueTreeId === null ? (
                <button
                  type='button'
                  onClick={handleCreateTree}
                  className='inline-flex items-center text-xs text-primary hover:text-primary/80'
                >
                  <Plus className='w-3 h-3 mr-1' />
                  Create conversation tree
                </button>
              ) : (
                <button
                  type='button'
                  onClick={handleRemoveTree}
                  className='inline-flex items-center text-xs text-destructive hover:underline'
                >
                  <Trash2 className='w-3 h-3 mr-1' />
                  Remove tree
                </button>
              )}
            </div>
            {dialogue.dialogueTreeId === null ? (
              <p className='text-xs text-muted-foreground'>
                Optional. A tree lets the player keep talking: each NPC line can
                have replies that lead to other lines.
              </p>
            ) : (
              <DialogueTreeEditor treeId={dialogue.dialogueTreeId} />
            )}
          </div>
          <p className='text-xs text-muted-foreground'>
            The game loads dialogue when it boots: restart the server to see
            changes in play.
          </p>
        </>
      )}
    </div>
  );
}
