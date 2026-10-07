'use client';

export const dynamic = 'force-dynamic';

import { PermissionGuard } from '@/components/auth/permission-guard';
import { ColoredInput } from '@/components/ColoredInput';
import { ColoredTextarea } from '@/components/ColoredTextarea';
import { ColoredTextInline } from '@/components/ColoredTextViewer';
import { HelpButton } from '@/components/help/HelpButton';
import { QUESTS_HELP_ANCHORS as HELP } from '@/components/help/help-topics';
import { AbilityPicker } from '@/components/quests/AbilityPicker';
import { EntityAutocomplete } from '@/components/quests/EntityAutocomplete';
import { ObjectiveFields } from '@/components/quests/ObjectiveFields';
import {
  PrerequisitesEditor,
  type PrerequisiteRow,
} from '@/components/quests/PrerequisitesEditor';
import { QuestDialogueEditor } from '@/components/quests/QuestDialogueEditor';
import { RewardFields } from '@/components/quests/RewardFields';
import { TRIGGER_TYPES } from '@/components/quests/quest-constants';
import {
  movePhase,
  type DialogueFormData,
  type ObjectiveFormData,
  type PhaseFormData,
  type RewardFormData,
} from '@/components/quests/quest-form';
import { useDebouncedPersist } from '@/components/quests/use-debounced-persist';
import {
  CreateQuestDocument,
  GetQuestDocument,
  UpdateQuestDocument,
  DeleteQuestPhaseDocument,
  CreateQuestPhaseDocument,
  UpdateQuestPhaseDocument,
  ReorderQuestPhasesDocument,
  CreateQuestObjectiveDocument,
  UpdateQuestObjectiveDocument,
  DeleteQuestObjectiveDocument,
  CreateQuestRewardDocument,
  UpdateQuestRewardDocument,
  DeleteQuestRewardDocument,
  type GetQuestQuery,
  type QuestObjectiveScope,
  type QuestObjectiveType,
  type QuestRewardType,
  type QuestTriggerType,
  type UpdateQuestObjectiveInput,
  type UpdateQuestRewardInput,
} from '@/generated/graphql';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Gift,
  Plus,
  Save,
  Target,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

interface QuestFormData {
  zoneId: number;
  id: number;
  name: string;
  description: string;
  shortDescription: string;
  minLevel: number;
  maxLevel: number;
  repeatable: boolean;
  hidden: boolean;
  autoAccept: boolean;
  shareable: boolean;
  cooldownMinutes: number | null;
  // Branching paths
  exclusiveGroup: string;
  // Trigger configuration
  triggerType: QuestTriggerType;
  triggerMobZoneId: number | null;
  triggerMobId: number | null;
  triggerLevel: number | null;
  triggerItemZoneId: number | null;
  triggerItemId: number | null;
  triggerRoomZoneId: number | null;
  triggerRoomId: number | null;
  triggerAbilityId: number | null;
  triggerEventId: number | null;
  timeLimitMinutes: number | null;
  // Availability requirement (Lua expression for class/race checks)
  availabilityRequirement: string;
}

function QuestEditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const questId = searchParams.get('id');
  const zoneId = searchParams.get('zone');
  const isNew = !questId || !zoneId;

  const [activeTab, setActiveTab] = useState<
    'basic' | 'requirements' | 'phases'
  >('basic');
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set());
  const [generalError, setGeneralError] = useState<string>('');

  const [formData, setFormData] = useState<QuestFormData>({
    zoneId: parseInt(zoneId || '30'),
    id: parseInt(questId || '1'),
    name: '',
    description: '',
    shortDescription: '',
    minLevel: 1,
    maxLevel: 100,
    repeatable: false,
    hidden: false,
    autoAccept: false,
    shareable: true,
    cooldownMinutes: null,
    // Branching paths
    exclusiveGroup: '',
    // Trigger defaults
    triggerType: 'MOB' as QuestTriggerType,
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
    // Availability requirement
    availabilityRequirement: '',
  });

  const [phases, setPhases] = useState<PhaseFormData[]>([]);
  const [prerequisites, setPrerequisites] = useState<PrerequisiteRow[]>([]);

  const { loading, error, data } = useQuery(GetQuestDocument, {
    variables: {
      zoneId: parseInt(zoneId || '0'),
      id: parseInt(questId || '0'),
    },
    skip: isNew,
  });

  const [createQuest, { loading: createLoading }] =
    useMutation(CreateQuestDocument);
  const [updateQuest, { loading: updateLoading }] =
    useMutation(UpdateQuestDocument);
  const [createPhase] = useMutation(CreateQuestPhaseDocument);
  const [updatePhase] = useMutation(UpdateQuestPhaseDocument);
  const [deletePhase] = useMutation(DeleteQuestPhaseDocument);
  const [createObjective] = useMutation(CreateQuestObjectiveDocument);
  const [updateObjective] = useMutation(UpdateQuestObjectiveDocument);
  const [deleteObjective] = useMutation(DeleteQuestObjectiveDocument);
  const [createReward] = useMutation(CreateQuestRewardDocument);
  const [updateReward] = useMutation(UpdateQuestRewardDocument);
  const [deleteReward] = useMutation(DeleteQuestRewardDocument);
  const [reorderPhases] = useMutation(ReorderQuestPhasesDocument);

  const persist = useDebouncedPersist(err => {
    console.error('Error saving change:', err);
    setGeneralError('Failed to save a change. Reload the quest and try again.');
  });

  useEffect(() => {
    const typedData = data as GetQuestQuery | undefined;
    if (typedData?.quest) {
      const quest = typedData.quest;
      setFormData({
        zoneId: quest.zoneId,
        id: quest.id,
        name: quest.name,
        description: quest.description || '',
        shortDescription: quest.shortDescription || '',
        minLevel: quest.minLevel || 1,
        maxLevel: quest.maxLevel || 100,
        repeatable: quest.repeatable,
        hidden: quest.hidden,
        autoAccept: quest.autoAccept,
        shareable: quest.shareable,
        cooldownMinutes: quest.cooldownMinutes ?? null,
        // Branching paths
        exclusiveGroup: quest.exclusiveGroup || '',
        // Trigger fields
        triggerType: quest.triggerType || ('MOB' as QuestTriggerType),
        triggerMobZoneId: quest.triggerMobZoneId ?? null,
        triggerMobId: quest.triggerMobId ?? null,
        triggerLevel: quest.triggerLevel ?? null,
        triggerItemZoneId: quest.triggerItemZoneId ?? null,
        triggerItemId: quest.triggerItemId ?? null,
        triggerRoomZoneId: quest.triggerRoomZoneId ?? null,
        triggerRoomId: quest.triggerRoomId ?? null,
        triggerAbilityId: quest.triggerAbilityId ?? null,
        triggerEventId: quest.triggerEventId ?? null,
        timeLimitMinutes: quest.timeLimitMinutes ?? null,
        // Availability requirement
        availabilityRequirement: quest.availabilityRequirement || '',
      });

      setPrerequisites(
        (quest.prerequisites ?? []).map(p => ({
          id: p.id,
          prerequisiteQuestZoneId: p.prerequisiteQuestZoneId,
          prerequisiteQuestId: p.prerequisiteQuestId,
          requireCompletion: p.requireCompletion,
        }))
      );

      // Load phases, objectives, and rewards (rewards are now per-phase)
      if (quest.phases) {
        setPhases(
          quest.phases.map(phase => ({
            id: phase.id,
            name: phase.name,
            description: phase.description || '',
            order: phase.order,
            objectives:
              phase.objectives?.map(obj => ({
                id: obj.id,
                objectiveType: obj.objectiveType,
                scope: obj.scope,
                playerDescription: obj.playerDescription,
                internalNote: obj.internalNote || '',
                showProgress: obj.showProgress,
                requiredCount: obj.requiredCount,
                targetMobZoneId: obj.targetMobZoneId || null,
                targetMobId: obj.targetMobId || null,
                targetObjectZoneId: obj.targetObjectZoneId || null,
                targetObjectId: obj.targetObjectId || null,
                targetRoomZoneId: obj.targetRoomZoneId || null,
                targetRoomId: obj.targetRoomId || null,
                targetAbilityId: obj.targetAbilityId || null,
                deliverToMobZoneId: obj.deliverToMobZoneId || null,
                deliverToMobId: obj.deliverToMobId || null,
                luaExpression: obj.luaExpression || '',
                dialogue: obj.dialogue
                  ? {
                      id: obj.dialogue.id,
                      npcMessage: obj.dialogue.npcMessage,
                      matchType: obj.dialogue.matchType,
                      matchKeywords: obj.dialogue.matchKeywords,
                      dialogueTreeId: obj.dialogue.dialogueTreeId ?? null,
                    }
                  : null,
              })) || [],
            rewards:
              phase.rewards?.map(reward => ({
                id: reward.id,
                phaseId: phase.id,
                rewardType: reward.rewardType,
                amount: reward.amount ?? null,
                objectZoneId: reward.objectZoneId ?? null,
                objectId: reward.objectId ?? null,
                abilityId: reward.abilityId ?? null,
                choiceGroup: reward.choiceGroup ?? null,
                quantity: reward.quantity,
                condition: reward.condition ?? '',
              })) || [],
          }))
        );
        // Expand all phases by default
        setExpandedPhases(new Set(quest.phases.map(p => p.id)));
      }
    }
  }, [data]);

  const handleInputChange = (
    field: keyof QuestFormData,
    value: string | number | boolean | null
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (generalError) setGeneralError('');
  };

  const handleSaveQuest = async () => {
    try {
      if (isNew) {
        await createQuest({
          variables: {
            data: {
              zoneId: formData.zoneId,
              id: formData.id,
              name: formData.name,
              description: formData.description || undefined,
              shortDescription: formData.shortDescription || undefined,
              minLevel: formData.minLevel,
              maxLevel: formData.maxLevel,
              repeatable: formData.repeatable,
              hidden: formData.hidden,
              autoAccept: formData.autoAccept,
              shareable: formData.shareable,
              cooldownMinutes: formData.cooldownMinutes,
              // Branching paths
              exclusiveGroup: formData.exclusiveGroup || undefined,
              // Trigger fields
              triggerType: formData.triggerType,
              triggerMobZoneId: formData.triggerMobZoneId,
              triggerMobId: formData.triggerMobId,
              triggerLevel: formData.triggerLevel,
              triggerItemZoneId: formData.triggerItemZoneId,
              triggerItemId: formData.triggerItemId,
              triggerRoomZoneId: formData.triggerRoomZoneId,
              triggerRoomId: formData.triggerRoomId,
              triggerAbilityId: formData.triggerAbilityId,
              triggerEventId: formData.triggerEventId,
              timeLimitMinutes: formData.timeLimitMinutes,
              // Availability requirement
              availabilityRequirement:
                formData.availabilityRequirement || undefined,
            },
          },
        });
        // Navigate to the new quest
        router.push(
          `/dashboard/quests/editor?zone=${formData.zoneId}&id=${formData.id}`
        );
      } else {
        await updateQuest({
          variables: {
            zoneId: parseInt(zoneId!),
            id: parseInt(questId!),
            data: {
              name: formData.name,
              description: formData.description || undefined,
              shortDescription: formData.shortDescription,
              minLevel: formData.minLevel,
              maxLevel: formData.maxLevel,
              repeatable: formData.repeatable,
              hidden: formData.hidden,
              autoAccept: formData.autoAccept,
              shareable: formData.shareable,
              cooldownMinutes: formData.cooldownMinutes,
              // Branching paths
              exclusiveGroup: formData.exclusiveGroup || undefined,
              // Trigger fields
              triggerType: formData.triggerType,
              triggerMobZoneId: formData.triggerMobZoneId,
              triggerMobId: formData.triggerMobId,
              triggerLevel: formData.triggerLevel,
              triggerItemZoneId: formData.triggerItemZoneId,
              triggerItemId: formData.triggerItemId,
              triggerRoomZoneId: formData.triggerRoomZoneId,
              triggerRoomId: formData.triggerRoomId,
              triggerAbilityId: formData.triggerAbilityId,
              triggerEventId: formData.triggerEventId,
              timeLimitMinutes: formData.timeLimitMinutes,
              // Availability requirement
              availabilityRequirement:
                formData.availabilityRequirement || undefined,
            },
          },
        });
      }
    } catch (err) {
      console.error('Error saving quest:', err);
      setGeneralError('Failed to save quest. Please try again.');
    }
  };

  const handleAddPhase = async () => {
    const newPhaseId = Math.max(0, ...phases.map(p => p.id)) + 1;
    const newOrder = Math.max(-1, ...phases.map(p => p.order)) + 1;

    try {
      await createPhase({
        variables: {
          data: {
            questZoneId: formData.zoneId,
            questId: formData.id,
            id: newPhaseId,
            name: `Phase ${newPhaseId}`,
            order: newOrder,
          },
        },
      });

      setPhases(prev => [
        ...prev,
        {
          id: newPhaseId,
          name: `Phase ${newPhaseId}`,
          description: '',
          order: newOrder,
          objectives: [],
          rewards: [],
        },
      ]);
      setExpandedPhases(prev => new Set(prev).add(newPhaseId));
    } catch (err) {
      console.error('Error creating phase:', err);
      setGeneralError('Failed to create phase.');
    }
  };

  const handleUpdatePhase = (
    phaseId: number,
    field: 'name' | 'description',
    value: string
  ) => {
    setPhases(prev =>
      prev.map(p => (p.id === phaseId ? { ...p, [field]: value } : p))
    );
    persist(`phase:${phaseId}`, { [field]: value }, patch =>
      updatePhase({
        variables: {
          questZoneId: formData.zoneId,
          questId: formData.id,
          id: phaseId,
          data: patch,
        },
      })
    );
  };

  const handleMovePhase = async (phaseId: number, direction: 'up' | 'down') => {
    const moved = movePhase(phases, phaseId, direction);
    if (!moved) return;
    const previous = phases;
    setPhases(moved);
    try {
      await reorderPhases({
        variables: {
          questZoneId: formData.zoneId,
          questId: formData.id,
          phaseIds: moved.map(p => p.id),
        },
      });
    } catch (err) {
      console.error('Error reordering phases:', err);
      setPhases(previous);
      setGeneralError('Failed to reorder phases.');
    }
  };

  const handleDeletePhase = async (phaseId: number) => {
    if (!confirm('Delete this phase and all its objectives?')) return;

    try {
      await deletePhase({
        variables: {
          questZoneId: formData.zoneId,
          questId: formData.id,
          id: phaseId,
        },
      });
      setPhases(prev => prev.filter(p => p.id !== phaseId));
    } catch (err) {
      console.error('Error deleting phase:', err);
      setGeneralError('Failed to delete phase.');
    }
  };

  const handleAddObjective = async (phaseId: number) => {
    const phase = phases.find(p => p.id === phaseId);
    if (!phase) return;

    const newObjectiveId = Math.max(0, ...phase.objectives.map(o => o.id)) + 1;

    try {
      await createObjective({
        variables: {
          data: {
            questZoneId: formData.zoneId,
            questId: formData.id,
            phaseId: phaseId,
            id: newObjectiveId,
            objectiveType: 'KILL_MOB' as QuestObjectiveType,
            playerDescription: 'New objective',
            requiredCount: 1,
          },
        },
      });

      setPhases(prev =>
        prev.map(p =>
          p.id === phaseId
            ? {
                ...p,
                objectives: [
                  ...p.objectives,
                  {
                    id: newObjectiveId,
                    objectiveType: 'KILL_MOB' as QuestObjectiveType,
                    scope: 'SOLO' as QuestObjectiveScope,
                    playerDescription: 'New objective',
                    internalNote: '',
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
                    luaExpression: '',
                    dialogue: null,
                  },
                ],
              }
            : p
        )
      );
    } catch (err) {
      console.error('Error creating objective:', err);
      setGeneralError('Failed to create objective.');
    }
  };

  const handleUpdateObjective = (
    phaseId: number,
    objectiveId: number,
    patch: Partial<ObjectiveFormData>
  ) => {
    setPhases(prev =>
      prev.map(p =>
        p.id === phaseId
          ? {
              ...p,
              objectives: p.objectives.map(o =>
                o.id === objectiveId ? { ...o, ...patch } : o
              ),
            }
          : p
      )
    );

    // `dialogue` is edited (and saved) by the dialogue editor itself.
    const { dialogue: _dialogue, ...saved } = patch;
    if (Object.keys(saved).length === 0) return;
    persist(`objective:${phaseId}:${objectiveId}`, saved, merged =>
      updateObjective({
        variables: {
          questZoneId: formData.zoneId,
          questId: formData.id,
          phaseId: phaseId,
          id: objectiveId,
          data: merged as UpdateQuestObjectiveInput,
        },
      })
    );
  };

  const handleDialogueChange = (
    phaseId: number,
    objectiveId: number,
    dialogue: DialogueFormData | null
  ) => handleUpdateObjective(phaseId, objectiveId, { dialogue });

  const handleDeleteObjective = async (
    phaseId: number,
    objectiveId: number
  ) => {
    if (!confirm('Delete this objective?')) return;

    try {
      await deleteObjective({
        variables: {
          questZoneId: formData.zoneId,
          questId: formData.id,
          phaseId: phaseId,
          id: objectiveId,
        },
      });

      setPhases(prev =>
        prev.map(p =>
          p.id === phaseId
            ? {
                ...p,
                objectives: p.objectives.filter(o => o.id !== objectiveId),
              }
            : p
        )
      );
    } catch (err) {
      console.error('Error deleting objective:', err);
      setGeneralError('Failed to delete objective.');
    }
  };

  // Reward handlers - rewards are now per-phase
  const handleAddReward = async (phaseId: number) => {
    try {
      const result = await createReward({
        variables: {
          data: {
            questZoneId: formData.zoneId,
            questId: formData.id,
            phaseId: phaseId,
            rewardType: 'EXPERIENCE' as QuestRewardType,
            amount: 100,
          },
        },
      });

      if (result.data?.createQuestReward) {
        const newReward = result.data.createQuestReward;
        setPhases(prev =>
          prev.map(p =>
            p.id === phaseId
              ? {
                  ...p,
                  rewards: [
                    ...p.rewards,
                    {
                      id: newReward.id,
                      phaseId: phaseId,
                      rewardType: newReward.rewardType,
                      amount: newReward.amount ?? null,
                      objectZoneId: null,
                      objectId: null,
                      abilityId: null,
                      choiceGroup: null,
                      quantity: newReward.quantity,
                      condition: newReward.condition ?? '',
                    },
                  ],
                }
              : p
          )
        );
      }
    } catch (err) {
      console.error('Error adding reward:', err);
      setGeneralError('Failed to add reward.');
    }
  };

  const handleUpdateReward = (
    phaseId: number,
    rewardId: number,
    patch: Partial<RewardFormData>
  ) => {
    setPhases(prev =>
      prev.map(p =>
        p.id === phaseId
          ? {
              ...p,
              rewards: p.rewards.map(r =>
                r.id === rewardId ? { ...r, ...patch } : r
              ),
            }
          : p
      )
    );

    // Only the changed fields are sent; the server leaves the rest alone.
    const { id: _id, phaseId: _phaseId, ...saved } = patch;
    if (Object.keys(saved).length === 0) return;
    persist(`reward:${rewardId}`, saved, merged =>
      updateReward({
        variables: { id: rewardId, data: merged as UpdateQuestRewardInput },
      })
    );
  };

  const handleDeleteReward = async (phaseId: number, rewardId: number) => {
    if (!confirm('Delete this reward?')) return;

    try {
      await deleteReward({
        variables: { id: rewardId },
      });

      setPhases(prev =>
        prev.map(p =>
          p.id === phaseId
            ? { ...p, rewards: p.rewards.filter(r => r.id !== rewardId) }
            : p
        )
      );
    } catch (err) {
      console.error('Error deleting reward:', err);
      setGeneralError('Failed to delete reward.');
    }
  };

  const togglePhaseExpanded = (phaseId: number) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseId)) {
      newExpanded.delete(phaseId);
    } else {
      newExpanded.add(phaseId);
    }
    setExpandedPhases(newExpanded);
  };

  if (loading)
    return <div className='p-4 text-foreground'>Loading quest data...</div>;

  if (error) {
    console.error('GraphQL Error:', error);
    return (
      <div className='p-4 text-destructive'>
        Error loading quest: {error.message}
      </div>
    );
  }

  if (!isNew && !loading && !data?.quest) {
    return (
      <div className='p-4 text-destructive'>
        Quest not found (Zone: {zoneId}, ID: {questId}).
      </div>
    );
  }

  const tabs = [
    { id: 'basic' as const, label: 'Basic Info' },
    { id: 'requirements' as const, label: 'Requirements' },
    { id: 'phases' as const, label: 'Phases & Objectives' },
  ];

  return (
    <div className='container mx-auto p-6'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-foreground'>
            {isNew ? (
              'Create New Quest'
            ) : formData.name ? (
              <>
                Edit Quest: <ColoredTextInline markup={formData.name} />
              </>
            ) : (
              `Edit Quest - Zone ${zoneId}, ID ${questId}`
            )}
          </h1>
          <p className='text-muted-foreground mt-1'>
            {isNew
              ? 'Create a new quest with phases and objectives'
              : 'Modify quest settings, phases, and rewards'}
          </p>
        </div>
        <div className='flex gap-2'>
          <HelpButton
            topic='quests'
            tip='How quests work and how to build one'
          />
          <Link href='/dashboard/quests'>
            <button className='inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back to Quests
            </button>
          </Link>
          <button
            onClick={handleSaveQuest}
            disabled={updateLoading || createLoading}
            className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
          >
            <Save className='w-4 h-4 mr-2' />
            {isNew ? 'Create Quest' : 'Save Changes'}
          </button>
        </div>
      </div>

      {generalError && (
        <div className='bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded mb-4'>
          {generalError}
        </div>
      )}

      {/* Tabs */}
      <div className='mb-6'>
        <nav className='flex space-x-8' aria-label='Tabs'>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className='space-y-6'>
        {/* Basic Information Tab */}
        {activeTab === 'basic' && (
          <div className='bg-card shadow rounded-lg p-6'>
            <h3 className='text-lg font-medium text-card-foreground mb-4'>
              Basic Information
            </h3>
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-muted-foreground mb-1'>
                    Zone ID *
                  </label>
                  <input
                    type='number'
                    value={formData.zoneId}
                    onChange={e =>
                      handleInputChange('zoneId', parseInt(e.target.value) || 0)
                    }
                    disabled={!isNew}
                    className='block w-full rounded-md border border-input bg-background shadow-sm focus:ring-ring focus:border-ring sm:text-sm disabled:opacity-50'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-muted-foreground mb-1'>
                    Quest ID *
                  </label>
                  <input
                    type='number'
                    value={formData.id}
                    onChange={e =>
                      handleInputChange('id', parseInt(e.target.value) || 0)
                    }
                    disabled={!isNew}
                    className='block w-full rounded-md border border-input bg-background shadow-sm focus:ring-ring focus:border-ring sm:text-sm disabled:opacity-50'
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-card-foreground mb-1'>
                  Name *
                </label>
                <ColoredInput
                  value={formData.name}
                  onChange={value => handleInputChange('name', value)}
                  placeholder='e.g., The Lost Artifact'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-card-foreground mb-1'>
                  Description
                </label>
                <ColoredTextarea
                  value={formData.description}
                  onChange={value => handleInputChange('description', value)}
                  placeholder='Quest description shown to players'
                  rows={3}
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-card-foreground mb-1'>
                  Short Description
                </label>
                <input
                  type='text'
                  aria-label='Short description'
                  value={formData.shortDescription}
                  onChange={e =>
                    handleInputChange('shortDescription', e.target.value)
                  }
                  placeholder='One line for quest lists'
                  className='block w-full rounded-md border border-input bg-background shadow-sm sm:text-sm'
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-muted-foreground mb-1'>
                    Min Level
                  </label>
                  <input
                    type='number'
                    value={formData.minLevel}
                    onChange={e =>
                      handleInputChange(
                        'minLevel',
                        parseInt(e.target.value) || 1
                      )
                    }
                    min={1}
                    max={100}
                    className='block w-full rounded-md border border-input bg-background shadow-sm sm:text-sm'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-muted-foreground mb-1'>
                    Max Level
                  </label>
                  <input
                    type='number'
                    value={formData.maxLevel}
                    onChange={e =>
                      handleInputChange(
                        'maxLevel',
                        parseInt(e.target.value) || 100
                      )
                    }
                    min={1}
                    max={100}
                    className='block w-full rounded-md border border-input bg-background shadow-sm sm:text-sm'
                  />
                </div>
              </div>

              <div className='flex items-center gap-6'>
                <label className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    checked={formData.repeatable}
                    onChange={e =>
                      handleInputChange('repeatable', e.target.checked)
                    }
                    className='rounded border-input'
                  />
                  <span className='text-sm text-foreground'>Repeatable</span>
                  <HelpButton
                    topic='quests'
                    anchor={HELP.repeatable}
                    variant='icon'
                    tip='Whether a completed quest can be accepted again'
                  />
                </label>
                <label className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    checked={formData.hidden}
                    onChange={e =>
                      handleInputChange('hidden', e.target.checked)
                    }
                    className='rounded border-input'
                  />
                  <span className='text-sm text-foreground'>Hidden</span>
                  <HelpButton
                    topic='quests'
                    anchor={HELP.offering}
                    variant='icon'
                    tip='Hidden quests cannot be accepted by players; staff assign them with qload / qgive'
                  />
                </label>
                <label className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    checked={formData.autoAccept}
                    onChange={e =>
                      handleInputChange('autoAccept', e.target.checked)
                    }
                    className='rounded border-input'
                  />
                  <span className='text-sm text-foreground'>Auto-accept</span>
                  <HelpButton
                    topic='quests'
                    anchor={HELP.offering}
                    variant='icon'
                    tip='Level, Item, Room, Skill, Event and Auto-Start triggers put the character on the quest instead of only offering it'
                  />
                </label>
                <label className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    checked={formData.shareable}
                    onChange={e =>
                      handleInputChange('shareable', e.target.checked)
                    }
                    className='rounded border-input'
                  />
                  <span className='text-sm text-foreground'>Shareable</span>
                  <HelpButton
                    topic='quests'
                    anchor={HELP.offering}
                    variant='icon'
                    tip='Stored and shown by questinfo, but the game does not restrict sharing with it yet'
                  />
                </label>
              </div>
              {formData.autoAccept &&
                !['LEVEL', 'ITEM', 'ROOM', 'SKILL', 'EVENT', 'AUTO'].includes(
                  formData.triggerType
                ) && (
                  <p className='text-xs text-amber-600 dark:text-amber-400'>
                    Auto-accept only applies to Level, Item, Room, Skill, Event
                    and Auto-Start triggers; this trigger type never
                    auto-accepts.
                  </p>
                )}

              {formData.repeatable && (
                <div className='max-w-xs'>
                  <label className='flex items-center gap-1 text-sm font-medium text-muted-foreground mb-1'>
                    Cooldown (minutes)
                    <HelpButton
                      topic='quests'
                      anchor={HELP.repeatable}
                      variant='icon'
                      tip='Minutes after completion before a repeatable quest can be accepted again'
                    />
                  </label>
                  <input
                    type='number'
                    aria-label='Cooldown (minutes)'
                    value={formData.cooldownMinutes ?? ''}
                    onChange={e =>
                      handleInputChange(
                        'cooldownMinutes',
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    placeholder='No cooldown'
                    min={0}
                    className='block w-full rounded-md border border-input bg-background shadow-sm sm:text-sm'
                  />
                </div>
              )}

              {/* Trigger Configuration */}
              <div className='pt-4 border-t border-border space-y-4'>
                <h4 className='text-sm font-medium text-card-foreground'>
                  Quest Trigger Configuration
                </h4>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='flex items-center gap-1 text-sm font-medium text-muted-foreground mb-1'>
                      Trigger Type
                      <HelpButton
                        topic='quests'
                        anchor={HELP.offering}
                        variant='icon'
                        tip='How players are offered this quest'
                      />
                    </label>
                    <select
                      value={formData.triggerType}
                      onChange={e =>
                        handleInputChange(
                          'triggerType',
                          e.target.value as QuestTriggerType
                        )
                      }
                      className='block w-full rounded-md border border-input bg-background shadow-sm sm:text-sm'
                    >
                      {TRIGGER_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <p className='text-xs text-muted-foreground mt-1'>
                      {
                        TRIGGER_TYPES.find(
                          t => t.value === formData.triggerType
                        )?.description
                      }
                    </p>
                  </div>
                  <div>
                    <label className='flex items-center gap-1 text-sm font-medium text-muted-foreground mb-1'>
                      Time Limit (minutes)
                      <HelpButton
                        topic='quests'
                        anchor={HELP.repeatable}
                        variant='icon'
                        tip='Quest fails this many minutes after it is accepted (checked about once a minute)'
                      />
                    </label>
                    <input
                      type='number'
                      value={formData.timeLimitMinutes || ''}
                      onChange={e =>
                        handleInputChange(
                          'timeLimitMinutes',
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      placeholder='No limit'
                      min={1}
                      className='block w-full rounded-md border border-input bg-background shadow-sm sm:text-sm'
                    />
                    <p className='text-xs text-muted-foreground mt-1'>
                      Leave empty for no time limit
                    </p>
                  </div>
                </div>

                {/* Conditional trigger fields based on type */}
                {formData.triggerType === 'MOB' && (
                  <div>
                    <label className='flex items-center gap-1 text-sm font-medium text-muted-foreground mb-1'>
                      Quest Giver Mob
                      <HelpButton
                        topic='quests'
                        anchor={HELP.offering}
                        variant='icon'
                        tip='Stored but not used by the game yet'
                      />
                    </label>
                    <EntityAutocomplete
                      entityType='mob'
                      value={{
                        zoneId: formData.triggerMobZoneId,
                        id: formData.triggerMobId,
                      }}
                      onChange={({ zoneId, id }) => {
                        setFormData(prev => ({
                          ...prev,
                          triggerMobZoneId: zoneId,
                          triggerMobId: id,
                        }));
                      }}
                      placeholder='Search mob that gives quest (e.g., "helena" or "30:5")'
                    />
                    <p className='text-xs text-muted-foreground mt-1'>
                      Not used by the game yet. Players take the quest with
                      qaccept &lt;zone&gt; &lt;id&gt;; have this mob tell them.
                    </p>
                  </div>
                )}

                {formData.triggerType === 'LEVEL' && (
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-muted-foreground mb-1'>
                        Trigger Level
                      </label>
                      <input
                        type='number'
                        value={formData.triggerLevel || ''}
                        onChange={e =>
                          handleInputChange(
                            'triggerLevel',
                            e.target.value ? parseInt(e.target.value) : null
                          )
                        }
                        placeholder='Level required'
                        min={1}
                        max={100}
                        className='block w-full rounded-md border border-input bg-background shadow-sm sm:text-sm'
                      />
                    </div>
                  </div>
                )}

                {formData.triggerType === 'ITEM' && (
                  <div>
                    <label className='block text-sm font-medium text-muted-foreground mb-1'>
                      Trigger Item
                    </label>
                    <EntityAutocomplete
                      entityType='object'
                      value={{
                        zoneId: formData.triggerItemZoneId,
                        id: formData.triggerItemId,
                      }}
                      onChange={({ zoneId, id }) => {
                        setFormData(prev => ({
                          ...prev,
                          triggerItemZoneId: zoneId,
                          triggerItemId: id,
                        }));
                      }}
                      placeholder='Search item that triggers quest...'
                    />
                  </div>
                )}

                {formData.triggerType === 'ROOM' && (
                  <div>
                    <label className='block text-sm font-medium text-muted-foreground mb-1'>
                      Trigger Room
                    </label>
                    <EntityAutocomplete
                      entityType='room'
                      value={{
                        zoneId: formData.triggerRoomZoneId,
                        id: formData.triggerRoomId,
                      }}
                      onChange={({ zoneId, id }) => {
                        setFormData(prev => ({
                          ...prev,
                          triggerRoomZoneId: zoneId,
                          triggerRoomId: id,
                        }));
                      }}
                      placeholder='Search room that triggers quest...'
                    />
                  </div>
                )}

                {formData.triggerType === 'SKILL' && (
                  <div>
                    <label className='block text-sm font-medium text-muted-foreground mb-1'>
                      Trigger Ability
                    </label>
                    <AbilityPicker
                      value={formData.triggerAbilityId}
                      onChange={abilityId =>
                        setFormData(prev => ({
                          ...prev,
                          triggerAbilityId: abilityId,
                        }))
                      }
                      placeholder='Search skill or spell that triggers the quest...'
                    />
                  </div>
                )}

                {formData.triggerType === 'EVENT' && (
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-muted-foreground mb-1'>
                        Trigger Event ID
                      </label>
                      <input
                        type='number'
                        value={formData.triggerEventId || ''}
                        onChange={e =>
                          handleInputChange(
                            'triggerEventId',
                            e.target.value ? parseInt(e.target.value) : null
                          )
                        }
                        placeholder='Event ID'
                        min={1}
                        className='block w-full rounded-md border border-input bg-background shadow-sm sm:text-sm'
                      />
                      <p className='text-xs text-muted-foreground mt-1'>
                        Offered to online players when this event switches on
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Branching Paths */}
              <div className='pt-4 border-t border-border space-y-4'>
                <h4 className='text-sm font-medium text-card-foreground'>
                  Branching Paths
                </h4>
                <div>
                  <label className='flex items-center gap-1 text-sm font-medium text-muted-foreground mb-1'>
                    Exclusive Group
                    <HelpButton
                      topic='quests'
                      anchor={HELP.requirements}
                      variant='icon'
                      tip='Quests sharing a group name are mutually exclusive'
                    />
                  </label>
                  <input
                    type='text'
                    value={formData.exclusiveGroup}
                    onChange={e =>
                      handleInputChange('exclusiveGroup', e.target.value)
                    }
                    placeholder='e.g., warrior-specialization, faction-choice'
                    className='block w-full rounded-md border border-input bg-background shadow-sm sm:text-sm'
                  />
                  <p className='text-xs text-muted-foreground mt-1'>
                    Quests with the same exclusive group are mutually exclusive.
                    Once a player accepts one quest in a group, others become
                    unavailable. Use this for class specializations, faction
                    choices, etc.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Phases & Objectives Tab */}
        {activeTab === 'phases' && (
          <div className='space-y-4'>
            {isNew && (
              <div className='bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4'>
                <p className='text-amber-800 dark:text-amber-200 text-sm'>
                  Save the quest first before adding phases and objectives.
                </p>
              </div>
            )}

            {!isNew && (
              <>
                {phases.map((phase, phaseIdx) => (
                  <div
                    key={phase.id}
                    className='bg-card border border-border rounded-lg'
                  >
                    {/* Phase Header */}
                    <div
                      className='flex items-center justify-between p-4 cursor-pointer'
                      onClick={() => togglePhaseExpanded(phase.id)}
                    >
                      <div className='flex items-center gap-3'>
                        <div
                          className='flex flex-col'
                          onClick={e => e.stopPropagation()}
                        >
                          <button
                            type='button'
                            aria-label={`Move phase ${phase.name} up`}
                            disabled={phaseIdx === 0}
                            onClick={() => handleMovePhase(phase.id, 'up')}
                            className='p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30'
                          >
                            <ArrowUp className='w-3 h-3' />
                          </button>
                          <button
                            type='button'
                            aria-label={`Move phase ${phase.name} down`}
                            disabled={phaseIdx === phases.length - 1}
                            onClick={() => handleMovePhase(phase.id, 'down')}
                            className='p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30'
                          >
                            <ArrowDown className='w-3 h-3' />
                          </button>
                        </div>
                        <span className='text-xs bg-primary/20 text-primary px-2 py-0.5 rounded'>
                          Phase {phaseIdx + 1}
                        </span>
                        <HelpButton
                          topic='quests'
                          anchor={HELP.phases}
                          variant='icon'
                          tip='Phases run in order; a phase finishes when all its objectives are done'
                        />
                        <input
                          value={phase.name}
                          onChange={e => {
                            e.stopPropagation();
                            handleUpdatePhase(phase.id, 'name', e.target.value);
                          }}
                          onClick={e => e.stopPropagation()}
                          className='font-medium bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none'
                        />
                        <span className='text-sm text-muted-foreground'>
                          ({phase.objectives.length} objectives)
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleDeletePhase(phase.id);
                          }}
                          className='p-1 text-destructive hover:bg-destructive/10 rounded'
                        >
                          <Trash2 className='w-4 h-4' />
                        </button>
                        {expandedPhases.has(phase.id) ? (
                          <ChevronUp className='w-5 h-5 text-muted-foreground' />
                        ) : (
                          <ChevronDown className='w-5 h-5 text-muted-foreground' />
                        )}
                      </div>
                    </div>

                    {/* Phase Content */}
                    {expandedPhases.has(phase.id) && (
                      <div className='border-t border-border p-4'>
                        <div className='mb-4'>
                          <label className='block text-sm font-medium text-muted-foreground mb-1'>
                            Phase Description
                          </label>
                          <textarea
                            value={phase.description}
                            onChange={e =>
                              handleUpdatePhase(
                                phase.id,
                                'description',
                                e.target.value
                              )
                            }
                            placeholder='Optional phase description'
                            rows={2}
                            className='block w-full rounded-md border border-input bg-background shadow-sm sm:text-sm'
                          />
                        </div>

                        {/* Objectives */}
                        <div className='space-y-3'>
                          <div className='flex items-center justify-between'>
                            <h4 className='text-sm font-medium text-muted-foreground'>
                              Objectives
                            </h4>
                            <button
                              onClick={() => handleAddObjective(phase.id)}
                              className='inline-flex items-center text-sm text-primary hover:text-primary/80'
                            >
                              <Plus className='w-4 h-4 mr-1' />
                              Add Objective
                            </button>
                          </div>

                          {phase.objectives.map(obj => (
                            <div
                              key={obj.id}
                              className='bg-muted/50 rounded-lg p-3 space-y-3'
                            >
                              <div className='flex items-start gap-3'>
                                <Target className='w-4 h-4 text-muted-foreground mt-2' />
                                <div className='flex-1'>
                                  <ObjectiveFields
                                    objective={obj}
                                    onChange={patch =>
                                      handleUpdateObjective(
                                        phase.id,
                                        obj.id,
                                        patch
                                      )
                                    }
                                    dialogueSlot={
                                      <QuestDialogueEditor
                                        questZoneId={formData.zoneId}
                                        questId={formData.id}
                                        phaseId={phase.id}
                                        objectiveId={obj.id}
                                        dialogue={obj.dialogue}
                                        onChange={dialogue =>
                                          handleDialogueChange(
                                            phase.id,
                                            obj.id,
                                            dialogue
                                          )
                                        }
                                      />
                                    }
                                  />
                                </div>
                                <button
                                  type='button'
                                  aria-label='Delete objective'
                                  onClick={() =>
                                    handleDeleteObjective(phase.id, obj.id)
                                  }
                                  className='p-1 text-destructive hover:bg-destructive/10 rounded'
                                >
                                  <Trash2 className='w-4 h-4' />
                                </button>
                              </div>
                            </div>
                          ))}

                          {phase.objectives.length === 0 && (
                            <div className='text-center py-6 text-muted-foreground'>
                              No objectives yet. Click "Add Objective" to create
                              one.
                            </div>
                          )}
                        </div>

                        {/* Phase Rewards */}
                        <div className='space-y-3 mt-6 pt-4 border-t border-border'>
                          <div className='flex items-center justify-between'>
                            <h4 className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
                              <Gift className='w-4 h-4' />
                              Phase Rewards
                              <HelpButton
                                topic='quests'
                                anchor={HELP.rewards}
                                variant='icon'
                                tip='All rewards are paid when the whole quest completes, whichever phase they are on'
                              />
                            </h4>
                            <button
                              onClick={() => handleAddReward(phase.id)}
                              className='inline-flex items-center text-sm text-primary hover:text-primary/80'
                            >
                              <Plus className='w-4 h-4 mr-1' />
                              Add Reward
                            </button>
                          </div>

                          {phase.rewards.map(reward => (
                            <div
                              key={reward.id}
                              className='bg-amber-50/50 dark:bg-amber-900/20 rounded-lg p-3 space-y-3'
                            >
                              <div className='flex items-start gap-3'>
                                <Gift className='w-4 h-4 text-amber-500 mt-2' />
                                <div className='flex-1'>
                                  <RewardFields
                                    reward={reward}
                                    onChange={patch =>
                                      handleUpdateReward(
                                        phase.id,
                                        reward.id,
                                        patch
                                      )
                                    }
                                  />
                                </div>
                                <button
                                  type='button'
                                  aria-label='Delete reward'
                                  onClick={() =>
                                    handleDeleteReward(phase.id, reward.id)
                                  }
                                  className='p-1 text-destructive hover:bg-destructive/10 rounded'
                                >
                                  <Trash2 className='w-4 h-4' />
                                </button>
                              </div>
                            </div>
                          ))}

                          {phase.rewards.length === 0 && (
                            <div className='text-center py-4 text-muted-foreground text-sm'>
                              No rewards for this phase. Click "Add Reward" to
                              add one.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <button
                  onClick={handleAddPhase}
                  className='w-full py-3 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition-colors'
                >
                  <Plus className='w-4 h-4 inline mr-2' />
                  Add Phase
                </button>
              </>
            )}
          </div>
        )}

        {/* Requirements Tab */}
        {activeTab === 'requirements' && (
          <div className='space-y-8'>
            {isNew ? (
              <div className='bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4'>
                <p className='text-amber-800 dark:text-amber-200 text-sm'>
                  Save the quest first before adding prerequisite quests.
                </p>
              </div>
            ) : (
              <PrerequisitesEditor
                questZoneId={formData.zoneId}
                questId={formData.id}
                prerequisites={prerequisites}
                onChange={setPrerequisites}
              />
            )}

            {/* Availability Requirements Section */}
            <div className='space-y-4'>
              <h2 className='text-lg font-semibold flex items-center gap-2'>
                <Target className='w-5 h-5' />
                Availability Requirements
              </h2>

              <p className='text-muted-foreground'>
                Use a Lua expression to control who can accept this quest. It is
                checked, in addition to level requirements, when a player types
                qaccept. The player is <code>actor</code>; class and race names
                are lower-case. A broken expression lets everyone through.
              </p>

              <div className='bg-muted/50 rounded-lg p-4 space-y-3'>
                <label className='flex items-center gap-1 text-sm font-medium text-muted-foreground'>
                  Lua Expression
                  <HelpButton
                    topic='quests'
                    anchor={HELP.availability}
                    variant='icon'
                    tip='Checked only when a player types qaccept; errors let the player through'
                  />
                </label>
                <textarea
                  value={formData.availabilityRequirement}
                  onChange={e =>
                    handleInputChange('availabilityRequirement', e.target.value)
                  }
                  placeholder="e.g., actor.class == 'warrior'"
                  rows={3}
                  className='block w-full rounded-md border border-input bg-background shadow-sm font-mono text-sm px-3 py-2'
                />
                <div className='text-xs text-muted-foreground space-y-1'>
                  <p>
                    <strong>Examples:</strong>
                  </p>
                  <ul className='list-disc list-inside space-y-0.5 ml-2'>
                    <li>
                      <code className='bg-muted px-1 rounded'>
                        actor.class == &apos;warrior&apos;
                      </code>{' '}
                      - Warriors only
                    </li>
                    <li>
                      <code className='bg-muted px-1 rounded'>
                        actor.class == &apos;warrior&apos; or actor.class ==
                        &apos;paladin&apos;
                      </code>{' '}
                      - Warrior or Paladin
                    </li>
                    <li>
                      <code className='bg-muted px-1 rounded'>
                        actor.race == &apos;elf&apos;
                      </code>{' '}
                      - Elves only
                    </li>
                    <li>
                      <code className='bg-muted px-1 rounded'>
                        actor.level &gt;= 20 and actor:has_item(30, 12)
                      </code>{' '}
                      - Level 20+ carrying item 30:12
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuestEditor() {
  return (
    <PermissionGuard requireImmortal={true}>
      <Suspense fallback={<div className='p-6'>Loading quest editor...</div>}>
        <QuestEditorContent />
      </Suspense>
    </PermissionGuard>
  );
}
