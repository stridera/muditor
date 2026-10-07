'use client';

import {
  CreateDialogueNodeDocument,
  CreateDialogueResponseDocument,
  DeleteDialogueNodeDocument,
  DeleteDialogueResponseDocument,
  GetDialogueTreeDocument,
  UpdateDialogueNodeDocument,
  UpdateDialogueResponseDocument,
  type DialogueMatchType,
  type GetDialogueTreeQuery,
} from '@/generated/graphql';
import { useMutation, useQuery } from '@apollo/client/react';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { DIALOGUE_MATCH_TYPES } from './quest-constants';
import { formatKeywords, parseKeywords } from './quest-form';

type TreeNode = NonNullable<
  GetDialogueTreeQuery['dialogueTree']
>['nodes'][number];
type TreeResponse = TreeNode['responses'][number];

const INPUT =
  'block w-full rounded-md border border-input bg-background shadow-sm sm:text-sm';

interface NodePatch {
  npcMessage?: string;
  isTerminal?: boolean;
  isRoot?: boolean;
}

interface ResponsePatch {
  matchType?: DialogueMatchType;
  matchKeywords?: string[];
  nextNodeId?: number | null;
  displayHint?: string;
}

interface DialogueTreeEditorProps {
  treeId: number;
}

/**
 * Basic editor for a dialogue tree: NPC lines (nodes) and the player replies
 * (responses) that lead from one line to the next. The root node is what the
 * NPC says first; a terminal node ends the conversation. Every change is saved
 * as soon as the field loses focus.
 */
export function DialogueTreeEditor({ treeId }: DialogueTreeEditorProps) {
  const { data, loading, error, refetch } = useQuery(GetDialogueTreeDocument, {
    variables: { id: treeId },
    fetchPolicy: 'cache-and-network',
  });
  const [createNode] = useMutation(CreateDialogueNodeDocument);
  const [updateNode] = useMutation(UpdateDialogueNodeDocument);
  const [deleteNode] = useMutation(DeleteDialogueNodeDocument);
  const [createResponse] = useMutation(CreateDialogueResponseDocument);
  const [updateResponse] = useMutation(UpdateDialogueResponseDocument);
  const [deleteResponse] = useMutation(DeleteDialogueResponseDocument);
  const [actionError, setActionError] = useState('');

  const run = async (what: string, action: () => Promise<unknown>) => {
    setActionError('');
    try {
      await action();
      await refetch();
    } catch (err) {
      console.error(what, err);
      setActionError(err instanceof Error ? err.message : what);
    }
  };

  if (loading && !data) {
    return <p className='text-xs text-muted-foreground'>Loading tree...</p>;
  }
  if (error && !data) {
    return (
      <p role='alert' className='text-xs text-destructive'>
        Could not load the conversation tree: {error.message}
      </p>
    );
  }
  const tree = data?.dialogueTree;
  if (!tree) {
    return (
      <p role='alert' className='text-xs text-destructive'>
        Conversation tree {treeId} no longer exists.
      </p>
    );
  }

  const nodes = tree.nodes;
  const labelOf = (node: TreeNode, index: number) =>
    `${index + 1}. ${node.npcMessage.slice(0, 40)}${
      node.npcMessage.length > 40 ? '...' : ''
    }`;

  return (
    <div className='space-y-3' data-testid='dialogue-tree'>
      {actionError && (
        <div role='alert' className='text-xs text-destructive'>
          {actionError}
        </div>
      )}

      {nodes.map((node, index) => (
        <NodeCard
          key={node.id}
          node={node}
          index={index}
          nodes={nodes}
          labelOf={labelOf}
          onUpdateNode={patch =>
            run('Failed to save node', () =>
              updateNode({ variables: { id: node.id, data: patch } })
            )
          }
          onDeleteNode={() => {
            if (
              !confirm(
                'Delete this node? Replies leading here end the conversation.'
              )
            )
              return;
            void run('Failed to delete node', () =>
              deleteNode({ variables: { id: node.id } })
            );
          }}
          onAddResponse={() =>
            run('Failed to add reply', () =>
              createResponse({
                variables: {
                  nodeId: node.id,
                  data: {
                    matchType: 'CONTAINS' as DialogueMatchType,
                    matchKeywords: ['yes'],
                  },
                },
              })
            )
          }
          onUpdateResponse={(responseId, patch) =>
            run('Failed to save reply', () =>
              updateResponse({ variables: { id: responseId, data: patch } })
            )
          }
          onDeleteResponse={responseId =>
            run('Failed to delete reply', () =>
              deleteResponse({ variables: { id: responseId } })
            )
          }
        />
      ))}

      <button
        type='button'
        onClick={() =>
          run('Failed to add node', () =>
            createNode({
              variables: {
                treeId,
                data: { npcMessage: 'The NPC says something.' },
              },
            })
          )
        }
        className='inline-flex items-center text-sm text-primary hover:text-primary/80'
      >
        <Plus className='w-4 h-4 mr-1' />
        Add node
      </button>
    </div>
  );
}

interface NodeCardProps {
  node: TreeNode;
  index: number;
  nodes: TreeNode[];
  labelOf: (node: TreeNode, index: number) => string;
  onUpdateNode: (patch: NodePatch) => void;
  onDeleteNode: () => void;
  onAddResponse: () => void;
  onUpdateResponse: (id: number, patch: ResponsePatch) => void;
  onDeleteResponse: (id: number) => void;
}

function NodeCard({
  node,
  index,
  nodes,
  labelOf,
  onUpdateNode,
  onDeleteNode,
  onAddResponse,
  onUpdateResponse,
  onDeleteResponse,
}: NodeCardProps) {
  const [message, setMessage] = useState(node.npcMessage);

  return (
    <div className='border border-border rounded-md p-3 space-y-2 bg-muted/30'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2 text-xs'>
          <span className='font-medium'>Node {index + 1}</span>
          {node.isRoot ? (
            <span className='px-1.5 py-0.5 rounded bg-primary/20 text-primary'>
              Root (opening line)
            </span>
          ) : (
            <button
              type='button'
              onClick={() => onUpdateNode({ isRoot: true })}
              className='text-primary hover:underline'
            >
              Make root
            </button>
          )}
        </div>
        {!node.isRoot && (
          <button
            type='button'
            aria-label={`Delete node ${index + 1}`}
            onClick={onDeleteNode}
            className='p-1 text-destructive hover:bg-destructive/10 rounded'
          >
            <Trash2 className='w-3 h-3' />
          </button>
        )}
      </div>

      <textarea
        aria-label={`Node ${index + 1} NPC message`}
        value={message}
        onChange={e => setMessage(e.target.value)}
        onBlur={() => {
          if (message !== node.npcMessage)
            onUpdateNode({ npcMessage: message });
        }}
        rows={2}
        className={INPUT}
      />

      <label className='flex items-center gap-2 text-xs'>
        <input
          type='checkbox'
          checked={node.isTerminal}
          onChange={e => onUpdateNode({ isTerminal: e.target.checked })}
          className='rounded border-input'
        />
        Ends the conversation
      </label>

      {!node.isTerminal && (
        <div className='space-y-2 pl-3 border-l-2 border-border'>
          <div className='text-xs font-medium text-muted-foreground'>
            Player replies
          </div>
          {node.responses.map(response => (
            <ResponseRow
              key={response.id}
              response={response}
              nodes={nodes}
              labelOf={labelOf}
              onUpdate={patch => onUpdateResponse(response.id, patch)}
              onDelete={() => onDeleteResponse(response.id)}
            />
          ))}
          {node.responses.length === 0 && (
            <p className='text-xs text-muted-foreground'>
              No replies: any answer leaves the conversation here.
            </p>
          )}
          <button
            type='button'
            onClick={onAddResponse}
            className='inline-flex items-center text-xs text-primary hover:text-primary/80'
          >
            <Plus className='w-3 h-3 mr-1' />
            Add reply
          </button>
        </div>
      )}
    </div>
  );
}

interface ResponseRowProps {
  response: TreeResponse;
  nodes: TreeNode[];
  labelOf: (node: TreeNode, index: number) => string;
  onUpdate: (patch: ResponsePatch) => void;
  onDelete: () => void;
}

function ResponseRow({
  response,
  nodes,
  labelOf,
  onUpdate,
  onDelete,
}: ResponseRowProps) {
  const [keywords, setKeywords] = useState(
    formatKeywords(response.matchKeywords)
  );
  const [hint, setHint] = useState(response.displayHint ?? '');

  return (
    <div className='grid grid-cols-12 gap-2 items-center'>
      <select
        aria-label='Reply match type'
        value={response.matchType}
        onChange={e =>
          onUpdate({ matchType: e.target.value as DialogueMatchType })
        }
        className={`${INPUT} col-span-3`}
      >
        {DIALOGUE_MATCH_TYPES.map(t => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      <input
        aria-label='Reply keywords'
        value={keywords}
        onChange={e => setKeywords(e.target.value)}
        onBlur={() => {
          const parsed = parseKeywords(keywords);
          if (
            formatKeywords(parsed) !== formatKeywords(response.matchKeywords)
          ) {
            onUpdate({ matchKeywords: parsed });
          }
        }}
        placeholder='keywords, comma separated'
        className={`${INPUT} col-span-3`}
      />
      <select
        aria-label='Reply leads to'
        value={response.nextNodeId ?? ''}
        onChange={e =>
          onUpdate({
            nextNodeId: e.target.value ? parseInt(e.target.value) : null,
          })
        }
        className={`${INPUT} col-span-3`}
      >
        <option value=''>(ends the conversation)</option>
        {nodes.map((n, i) => (
          <option key={n.id} value={n.id}>
            {labelOf(n, i)}
          </option>
        ))}
      </select>
      <input
        aria-label='Reply hint'
        title='Shown to the player under the NPC line, e.g. say yes'
        value={hint}
        onChange={e => setHint(e.target.value)}
        onBlur={() => {
          if (hint !== (response.displayHint ?? ''))
            onUpdate({ displayHint: hint });
        }}
        placeholder='hint shown to the player'
        className={`${INPUT} col-span-2`}
      />
      <button
        type='button'
        aria-label='Delete reply'
        onClick={onDelete}
        className='p-1 text-destructive hover:bg-destructive/10 rounded justify-self-end'
      >
        <Trash2 className='w-3 h-3' />
      </button>
    </div>
  );
}
