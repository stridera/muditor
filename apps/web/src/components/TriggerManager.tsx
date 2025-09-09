'use client';

import { useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Edit,
  Trash,
  Link,
  Unlink,
  Code,
  PlayCircle,
  AlertCircle,
  Eye,
  Copy,
  Tag,
  Clock,
  Zap,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ScriptEditor, { Script } from './ScriptEditor';

const GET_TRIGGERS = gql`
  query GetTriggers {
    triggers {
      id
      name
      attachType
      numArgs
      argList
      commands
      variables
      flags
      mobId
      objectId
      zoneId
      createdAt
      updatedAt
    }
  }
`;

const GET_TRIGGERS_BY_ATTACHMENT = gql`
  query GetTriggersByAttachment($attachType: ScriptType!, $entityId: Int!) {
    triggersByAttachment(attachType: $attachType, entityId: $entityId) {
      id
      name
      attachType
      numArgs
      argList
      commands
      variables
      flags
      mobId
      objectId
      zoneId
      createdAt
      updatedAt
    }
  }
`;

const CREATE_TRIGGER = gql`
  mutation CreateTrigger($input: CreateTriggerInput!) {
    createTrigger(input: $input) {
      id
      name
      attachType
      commands
      variables
    }
  }
`;

const UPDATE_TRIGGER = gql`
  mutation UpdateTrigger($id: String!, $input: UpdateTriggerInput!) {
    updateTrigger(id: $id, input: $input) {
      id
      name
      attachType
      commands
      variables
    }
  }
`;

const DELETE_TRIGGER = gql`
  mutation DeleteTrigger($id: String!) {
    deleteTrigger(id: $id) {
      id
    }
  }
`;

const ATTACH_TRIGGER = gql`
  mutation AttachTrigger($input: AttachTriggerInput!) {
    attachTrigger(input: $input) {
      id
      name
      mobId
      objectId
      zoneId
    }
  }
`;

const DETACH_TRIGGER = gql`
  mutation DetachTrigger($triggerId: String!) {
    detachTrigger(triggerId: $triggerId) {
      id
      name
    }
  }
`;

interface TriggerData {
  id: string;
  name: string;
  attachType: 'MOB' | 'OBJECT' | 'WORLD';
  numArgs: number;
  argList?: string;
  commands: string;
  variables: string;
  flags: string[];
  mobId?: number;
  objectId?: number;
  zoneId?: number;
  createdAt: string;
  updatedAt: string;
}

interface TriggerManagerProps {
  entityType: 'MOB' | 'OBJECT' | 'WORLD';
  entityId: number;
  entityName: string;
  onTriggerChange?: () => void;
}

export default function TriggerManager({
  entityType,
  entityId,
  entityName,
  onTriggerChange,
}: TriggerManagerProps) {
  const [selectedTrigger, setSelectedTrigger] = useState<TriggerData | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAttachDialogOpen, setIsAttachDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [previewTrigger, setPreviewTrigger] = useState<TriggerData | null>(
    null
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Query attached triggers for this entity
  const {
    loading: attachedLoading,
    data: attachedData,
    refetch: refetchAttached,
  } = useQuery(GET_TRIGGERS_BY_ATTACHMENT, {
    variables: {
      attachType: entityType,
      entityId: entityId,
    },
  });

  // Query all triggers for browsing/attaching
  const {
    loading: allLoading,
    data: allData,
    refetch: refetchAll,
  } = useQuery(GET_TRIGGERS);

  const [createTrigger] = useMutation(CREATE_TRIGGER);
  const [updateTrigger] = useMutation(UPDATE_TRIGGER);
  const [deleteTrigger] = useMutation(DELETE_TRIGGER);
  const [attachTrigger] = useMutation(ATTACH_TRIGGER);
  const [detachTrigger] = useMutation(DETACH_TRIGGER);

  const attachedTriggers: TriggerData[] =
    (attachedData as { triggersByAttachment?: TriggerData[] })
      ?.triggersByAttachment || [];
  const allTriggers: TriggerData[] =
    (allData as { triggers?: TriggerData[] })?.triggers || [];

  // Filter available triggers for attachment (not already attached and correct type)
  const availableForAttachment = allTriggers.filter(
    trigger =>
      trigger.attachType === entityType &&
      !attachedTriggers.some(attached => attached.id === trigger.id) &&
      (searchTerm === '' ||
        trigger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trigger.commands.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateTrigger = async (script: Partial<Script>) => {
    try {
      const variables = JSON.stringify(script.variables || {});

      const input: any = {
        name: script.name || 'New Trigger',
        attachType: entityType,
        commands: script.commands || '',
        variables,
        numArgs: script.numArgs || 0,
        argList: script.argList,
      };

      // Attach to current entity immediately
      if (entityType === 'MOB') {
        input.mobId = entityId;
      } else if (entityType === 'OBJECT') {
        input.objectId = entityId;
      } else if (entityType === 'WORLD') {
        input.zoneId = entityId;
      }

      await createTrigger({ variables: { input } });
      refetchAttached();
      refetchAll();
      setIsEditDialogOpen(false);
      setIsCreating(false);
      onTriggerChange?.();
    } catch (error) {
      console.error('Error creating trigger:', error);
    }
  };

  const handleUpdateTrigger = async (script: Partial<Script>) => {
    if (!selectedTrigger) return;

    try {
      const variables = JSON.stringify(script.variables || {});

      const input = {
        name: script.name,
        commands: script.commands,
        variables,
        numArgs: script.numArgs,
        argList: script.argList,
      };

      await updateTrigger({
        variables: {
          id: selectedTrigger.id,
          input,
        },
      });

      refetchAttached();
      refetchAll();
      setIsEditDialogOpen(false);
      setSelectedTrigger(null);
      onTriggerChange?.();
    } catch (error) {
      console.error('Error updating trigger:', error);
    }
  };

  const handleDeleteTrigger = async (triggerId: string) => {
    if (!confirm('Are you sure you want to delete this trigger?')) return;

    try {
      await deleteTrigger({ variables: { id: triggerId } });
      refetchAttached();
      refetchAll();
      onTriggerChange?.();
    } catch (error) {
      console.error('Error deleting trigger:', error);
    }
  };

  const handleAttachTrigger = async (trigger: TriggerData) => {
    try {
      const input: any = {
        triggerId: trigger.id,
        attachType: entityType,
      };

      if (entityType === 'MOB') {
        input.mobId = entityId;
      } else if (entityType === 'OBJECT') {
        input.objectId = entityId;
      } else if (entityType === 'WORLD') {
        input.zoneId = entityId;
      }

      await attachTrigger({ variables: { input } });
      refetchAttached();
      refetchAll();
      onTriggerChange?.();
    } catch (error) {
      console.error('Error attaching trigger:', error);
    }
  };

  const handleDetachTrigger = async (triggerId: string) => {
    try {
      await detachTrigger({ variables: { triggerId } });
      refetchAttached();
      refetchAll();
      onTriggerChange?.();
    } catch (error) {
      console.error('Error detaching trigger:', error);
    }
  };

  const handleCopyTrigger = async (trigger: TriggerData) => {
    try {
      const variables = JSON.stringify(trigger.variables || {});

      const input: any = {
        name: `${trigger.name} (Copy)`,
        attachType: entityType,
        commands: trigger.commands,
        variables,
        numArgs: trigger.numArgs || 0,
        argList: trigger.argList,
      };

      // Attach to current entity immediately
      if (entityType === 'MOB') {
        input.mobId = entityId;
      } else if (entityType === 'OBJECT') {
        input.objectId = entityId;
      } else if (entityType === 'WORLD') {
        input.zoneId = entityId;
      }

      await createTrigger({ variables: { input } });
      refetchAttached();
      refetchAll();
      onTriggerChange?.();
    } catch (error) {
      console.error('Error copying trigger:', error);
    }
  };

  const handlePreviewTrigger = (trigger: TriggerData) => {
    setPreviewTrigger(trigger);
    setIsPreviewOpen(true);
  };

  const openEditDialog = (trigger?: TriggerData) => {
    if (trigger) {
      setSelectedTrigger(trigger);
      setIsCreating(false);
    } else {
      setSelectedTrigger(null);
      setIsCreating(true);
    }
    setIsEditDialogOpen(true);
  };

  const convertTriggerToScript = (trigger: TriggerData): Script => ({
    id: trigger.id,
    name: trigger.name,
    attachType: trigger.attachType,
    numArgs: trigger.numArgs,
    argList: trigger.argList,
    commands: trigger.commands,
    variables: JSON.parse(trigger.variables || '{}'),
    zoneId: trigger.zoneId,
    mobId: trigger.mobId,
    objectId: trigger.objectId,
  });

  if (attachedLoading || allLoading) {
    return <div className='p-4'>Loading triggers...</div>;
  }

  return (
    <div className='space-y-4'>
      {/* Header with Statistics */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold flex items-center gap-2'>
            <Zap className='h-5 w-5 text-blue-600' />
            Script Triggers
          </h3>
          <p className='text-sm text-gray-600'>
            Manage Lua script triggers attached to {entityName}
          </p>
          <div className='flex items-center gap-4 mt-2'>
            <div className='text-xs text-gray-500'>
              <span className='font-medium'>{attachedTriggers.length}</span>{' '}
              attached
            </div>
            <div className='text-xs text-gray-500'>
              <span className='font-medium'>
                {availableForAttachment.length}
              </span>{' '}
              available
            </div>
            <div className='text-xs text-gray-500'>
              <span className='font-medium'>
                {allTriggers.filter(t => t.attachType === entityType).length}
              </span>{' '}
              total {entityType.toLowerCase()} triggers
            </div>
          </div>
        </div>
        <div className='flex space-x-2'>
          <Button onClick={() => openEditDialog()} size='sm'>
            <Plus className='h-4 w-4 mr-2' />
            Create Trigger
          </Button>
          <Dialog
            open={isAttachDialogOpen}
            onOpenChange={setIsAttachDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant='outline' size='sm'>
                <Link className='h-4 w-4 mr-2' />
                Attach Existing
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-2xl'>
              <DialogHeader>
                <DialogTitle>Attach Trigger</DialogTitle>
                <DialogDescription>
                  Select an existing {entityType.toLowerCase()} trigger to
                  attach to {entityName}
                </DialogDescription>
              </DialogHeader>

              <div className='space-y-4'>
                <Input
                  placeholder='Search triggers...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />

                <div className='max-h-96 overflow-y-auto space-y-2'>
                  {availableForAttachment.length === 0 ? (
                    <div className='text-center text-gray-500 py-8'>
                      No {entityType.toLowerCase()} triggers available for
                      attachment
                    </div>
                  ) : (
                    availableForAttachment.map(trigger => (
                      <Card key={trigger.id} className='hover:bg-gray-50'>
                        <CardContent className='p-4'>
                          <div className='flex items-center justify-between'>
                            <div className='flex-1'>
                              <h4 className='font-medium'>{trigger.name}</h4>
                              <p className='text-sm text-gray-600 truncate'>
                                {trigger.commands.split('\n')[0]}
                              </p>
                              <div className='flex items-center space-x-2 mt-2'>
                                <Badge variant='secondary'>
                                  {trigger.attachType}
                                </Badge>
                                {trigger.numArgs > 0 && (
                                  <Badge variant='outline'>
                                    {trigger.numArgs} args
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button
                              onClick={() => handleAttachTrigger(trigger)}
                              size='sm'
                            >
                              Attach
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Attached Triggers */}
      {attachedTriggers.length === 0 ? (
        <Alert>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            No triggers attached to this {entityType.toLowerCase()}. Create a
            new trigger or attach an existing one.
          </AlertDescription>
        </Alert>
      ) : (
        <div className='space-y-3'>
          {attachedTriggers.map(trigger => (
            <Card
              key={trigger.id}
              className='hover:shadow-md transition-shadow'
            >
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    <Code className='h-4 w-4 text-purple-600' />
                    <CardTitle className='text-base'>{trigger.name}</CardTitle>
                    <Badge variant='secondary'>{trigger.attachType}</Badge>
                    {trigger.numArgs > 0 && (
                      <Badge variant='outline'>{trigger.numArgs} args</Badge>
                    )}
                    {trigger.flags && trigger.flags.length > 0 && (
                      <Badge
                        variant='outline'
                        className='bg-blue-50 text-blue-700'
                      >
                        <Tag className='h-3 w-3 mr-1' />
                        {trigger.flags.length}
                      </Badge>
                    )}
                  </div>
                  <div className='flex items-center space-x-1'>
                    <Button
                      onClick={() => handlePreviewTrigger(trigger)}
                      size='sm'
                      variant='ghost'
                      title='Preview Script'
                    >
                      <Eye className='h-4 w-4' />
                    </Button>
                    <Button
                      onClick={() => handleCopyTrigger(trigger)}
                      size='sm'
                      variant='ghost'
                      title='Copy Trigger'
                    >
                      <Copy className='h-4 w-4' />
                    </Button>
                    <Button
                      onClick={() => openEditDialog(trigger)}
                      size='sm'
                      variant='outline'
                      title='Edit Script'
                    >
                      <Edit className='h-4 w-4' />
                    </Button>
                    <Button
                      onClick={() => handleDetachTrigger(trigger.id)}
                      size='sm'
                      variant='outline'
                      title='Detach from Entity'
                    >
                      <Unlink className='h-4 w-4' />
                    </Button>
                    <Button
                      onClick={() => handleDeleteTrigger(trigger.id)}
                      size='sm'
                      variant='destructive'
                      title='Delete Trigger'
                    >
                      <Trash className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className='bg-gray-50 rounded-lg p-3 font-mono text-sm'>
                  <pre className='text-gray-800 whitespace-pre-wrap overflow-x-auto max-h-32 overflow-y-auto'>
                    {trigger.commands.split('\n').slice(0, 8).join('\n')}
                    {trigger.commands.split('\n').length > 8 &&
                      '\n... (click Preview to see full script)'}
                  </pre>
                </div>
                <div className='flex items-center justify-between mt-3 pt-3 border-t border-gray-100'>
                  <div className='flex items-center space-x-4 text-xs text-gray-500'>
                    {trigger.argList && (
                      <div className='flex items-center gap-1'>
                        <span className='font-medium'>Args:</span>{' '}
                        {trigger.argList}
                      </div>
                    )}
                    <div className='flex items-center gap-1'>
                      <Clock className='h-3 w-3' />
                      Updated {new Date(trigger.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className='text-xs text-gray-400'>
                    Lines: {trigger.commands.split('\n').length}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='max-w-4xl max-h-[90vh]'>
          <DialogHeader>
            <DialogTitle>
              {isCreating
                ? 'Create New Trigger'
                : `Edit ${selectedTrigger?.name}`}
            </DialogTitle>
            <DialogDescription>
              {isCreating
                ? `Create a new ${entityType.toLowerCase()} trigger for ${entityName}`
                : `Edit the trigger script and properties`}
            </DialogDescription>
          </DialogHeader>

          <div className='flex-1 overflow-hidden'>
            <ScriptEditor
              script={
                selectedTrigger
                  ? convertTriggerToScript(selectedTrigger)
                  : undefined
              }
              onSave={isCreating ? handleCreateTrigger : handleUpdateTrigger}
              height='500px'
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className='max-w-4xl max-h-[90vh]'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Eye className='h-5 w-5' />
              Preview: {previewTrigger?.name}
            </DialogTitle>
            <DialogDescription>
              Read-only preview of the trigger script and properties
            </DialogDescription>
          </DialogHeader>

          {previewTrigger && (
            <div className='space-y-4'>
              {/* Trigger Info */}
              <div className='grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg'>
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Type
                  </label>
                  <p className='text-sm'>{previewTrigger.attachType}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Arguments
                  </label>
                  <p className='text-sm'>
                    {previewTrigger.numArgs} args
                    {previewTrigger.argList
                      ? `: ${previewTrigger.argList}`
                      : ''}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Created
                  </label>
                  <p className='text-sm'>
                    {new Date(previewTrigger.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Updated
                  </label>
                  <p className='text-sm'>
                    {new Date(previewTrigger.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Script Preview */}
              <div className='flex-1 overflow-hidden'>
                <ScriptEditor
                  script={convertTriggerToScript(previewTrigger)}
                  readOnly={true}
                  height='400px'
                />
              </div>

              {/* Action Buttons */}
              <div className='flex justify-end gap-2'>
                <Button
                  onClick={() => {
                    setIsPreviewOpen(false);
                    openEditDialog(previewTrigger);
                  }}
                  variant='outline'
                >
                  <Edit className='h-4 w-4 mr-2' />
                  Edit Script
                </Button>
                <Button
                  onClick={() => {
                    setIsPreviewOpen(false);
                    handleCopyTrigger(previewTrigger);
                  }}
                  variant='outline'
                >
                  <Copy className='h-4 w-4 mr-2' />
                  Copy Trigger
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
