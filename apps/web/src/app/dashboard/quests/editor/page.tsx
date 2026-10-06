'use client';

export const dynamic = 'force-dynamic';

import { PermissionGuard } from '@/components/auth/permission-guard';
import { ColoredInput } from '@/components/ColoredInput';
import { ColoredTextarea } from '@/components/ColoredTextarea';
import { ColoredTextInline } from '@/components/ColoredTextViewer';
import { HelpButton } from '@/components/help/HelpButton';
import { QUESTS_HELP_ANCHORS as HELP } from '@/components/help/help-topics';
import { EntityAutocomplete } from '@/components/quests/EntityAutocomplete';
import {
  OBJECTIVE_TYPES,
  REWARD_TYPES,
  TRIGGER_TYPES,
} from '@/components/quests/quest-constants';
import {
  CreateQuestDocument,
  GetQuestDocument,
  UpdateQuestDocument,
  DeleteQuestPhaseDocument,
  CreateQuestPhaseDocument,
  UpdateQuestPhaseDocument,
  CreateQuestObjectiveDocument,
  UpdateQuestObjectiveDocument,
  DeleteQuestObjectiveDocument,
  CreateQuestRewardDocument,
  UpdateQuestRewardDocument,
  DeleteQuestRewardDocument,
  type GetQuestQuery,
  type QuestObjectiveType,
  type QuestRewardType,
  type QuestTriggerType,
} from '@/generated/graphql';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Gift,
  GripVertical,
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
  minLevel: number;
  maxLevel: number;
  repeatable: boolean;
  hidden: boolean;
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

interface PhaseFormData {
  id: number;
  name: string;
  description: string;
  order: number;
  objectives: ObjectiveFormData[];
  rewards: RewardFormData[];
}

interface ObjectiveFormData {
  id: number;
  objectiveType: QuestObjectiveType;
  playerDescription: string;
  internalNote: string;
  showProgress: boolean;
  requiredCount: number;
  targetMobZoneId: number | null;
  targetMobId: number | null;
  targetObjectZoneId: number | null;
  targetObjectId: number | null;
  targetRoomZoneId: number | null;
  targetRoomId: number | null;
  targetAbilityId: number | null;
  deliverToMobZoneId: number | null;
  deliverToMobId: number | null;
  luaExpression: string;
}

interface RewardFormData {
  id: number;
  phaseId: number;
  rewardType: QuestRewardType;
  amount: number | null;
  objectZoneId: number | null;
  objectId: number | null;
  abilityId: number | null;
  choiceGroup: number | null;
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
    minLevel: 1,
    maxLevel: 100,
    repeatable: false,
    hidden: false,
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

  useEffect(() => {
    const typedData = data as GetQuestQuery | undefined;
    if (typedData?.quest) {
      const quest = typedData.quest;
      setFormData({
        zoneId: quest.zoneId,
        id: quest.id,
        name: quest.name,
        description: quest.description || '',
        minLevel: quest.minLevel || 1,
        maxLevel: quest.maxLevel || 100,
        repeatable: quest.repeatable,
        hidden: quest.hidden,
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
              minLevel: formData.minLevel,
              maxLevel: formData.maxLevel,
              repeatable: formData.repeatable,
              hidden: formData.hidden,
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
              minLevel: formData.minLevel,
              maxLevel: formData.maxLevel,
              repeatable: formData.repeatable,
              hidden: formData.hidden,
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
    const newOrder = phases.length;

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

  const handleUpdatePhase = async (
    phaseId: number,
    field: keyof PhaseFormData,
    value: string | number
  ) => {
    setPhases(prev =>
      prev.map(p => (p.id === phaseId ? { ...p, [field]: value } : p))
    );

    // Debounce API call
    try {
      await updatePhase({
        variables: {
          questZoneId: formData.zoneId,
          questId: formData.id,
          id: phaseId,
          data: { [field]: value },
        },
      });
    } catch (err) {
      console.error('Error updating phase:', err);
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

  const handleUpdateObjective = async (
    phaseId: number,
    objectiveId: number,
    field: keyof ObjectiveFormData,
    value: string | number | boolean | null
  ) => {
    setPhases(prev =>
      prev.map(p =>
        p.id === phaseId
          ? {
              ...p,
              objectives: p.objectives.map(o =>
                o.id === objectiveId ? { ...o, [field]: value } : o
              ),
            }
          : p
      )
    );

    try {
      await updateObjective({
        variables: {
          questZoneId: formData.zoneId,
          questId: formData.id,
          phaseId: phaseId,
          id: objectiveId,
          data: { [field]: value },
        },
      });
    } catch (err) {
      console.error('Error updating objective:', err);
    }
  };

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

  const handleUpdateReward = async (
    phaseId: number,
    rewardId: number,
    field: keyof RewardFormData,
    value: string | number | boolean | null
  ) => {
    // Update local state first
    setPhases(prev =>
      prev.map(p =>
        p.id === phaseId
          ? {
              ...p,
              rewards: p.rewards.map(r =>
                r.id === rewardId ? { ...r, [field]: value } : r
              ),
            }
          : p
      )
    );

    // Find the updated reward
    const phase = phases.find(p => p.id === phaseId);
    const updatedReward = phase?.rewards.find(r => r.id === rewardId);
    if (!updatedReward) return;

    try {
      await updateReward({
        variables: {
          id: rewardId,
          data: {
            rewardType:
              field === 'rewardType'
                ? (value as QuestRewardType)
                : updatedReward.rewardType,
            amount:
              field === 'amount'
                ? (value as number | null)
                : updatedReward.amount,
            objectZoneId:
              field === 'objectZoneId'
                ? (value as number | null)
                : updatedReward.objectZoneId,
            objectId:
              field === 'objectId'
                ? (value as number | null)
                : updatedReward.objectId,
            abilityId:
              field === 'abilityId'
                ? (value as number | null)
                : updatedReward.abilityId,
            choiceGroup:
              field === 'choiceGroup'
                ? (value as number | null)
                : updatedReward.choiceGroup,
          },
        },
      });
    } catch (err) {
      console.error('Error updating reward:', err);
    }
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
              </div>

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
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-muted-foreground mb-1'>
                        Trigger Ability ID
                      </label>
                      <input
                        type='number'
                        value={formData.triggerAbilityId || ''}
                        onChange={e =>
                          handleInputChange(
                            'triggerAbilityId',
                            e.target.value ? parseInt(e.target.value) : null
                          )
                        }
                        placeholder='Ability ID'
                        min={1}
                        className='block w-full rounded-md border border-input bg-background shadow-sm sm:text-sm'
                      />
                    </div>
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
                        <GripVertical className='w-4 h-4 text-muted-foreground' />
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

                          {phase.objectives.map((obj, objIdx) => (
                            <div
                              key={obj.id}
                              className='bg-muted/50 rounded-lg p-3 space-y-3'
                            >
                              <div className='flex items-start gap-3'>
                                <Target className='w-4 h-4 text-muted-foreground mt-2' />
                                <div className='flex-1 space-y-3'>
                                  <div className='grid grid-cols-3 gap-3'>
                                    <div className='flex items-center gap-1'>
                                      <select
                                        value={obj.objectiveType}
                                        onChange={e =>
                                          handleUpdateObjective(
                                            phase.id,
                                            obj.id,
                                            'objectiveType',
                                            e.target.value as QuestObjectiveType
                                          )
                                        }
                                        className='rounded-md border border-input bg-background shadow-sm sm:text-sm'
                                      >
                                        {OBJECTIVE_TYPES.map(type => (
                                          <option
                                            key={type.value}
                                            value={type.value}
                                          >
                                            {type.label}
                                          </option>
                                        ))}
                                      </select>
                                      <HelpButton
                                        topic='quests'
                                        anchor={HELP.objectives}
                                        variant='icon'
                                        tip='What each objective type needs and how players complete it'
                                      />
                                    </div>
                                    <input
                                      type='number'
                                      value={obj.requiredCount}
                                      onChange={e =>
                                        handleUpdateObjective(
                                          phase.id,
                                          obj.id,
                                          'requiredCount',
                                          parseInt(e.target.value) || 1
                                        )
                                      }
                                      min={1}
                                      placeholder='Count'
                                      className='rounded-md border border-input bg-background shadow-sm sm:text-sm'
                                    />
                                    <label className='flex items-center gap-2'>
                                      <input
                                        type='checkbox'
                                        checked={obj.showProgress}
                                        onChange={e =>
                                          handleUpdateObjective(
                                            phase.id,
                                            obj.id,
                                            'showProgress',
                                            e.target.checked
                                          )
                                        }
                                        className='rounded border-input'
                                      />
                                      <span className='text-sm'>
                                        Show Progress
                                      </span>
                                    </label>
                                  </div>
                                  <input
                                    value={obj.playerDescription}
                                    onChange={e =>
                                      handleUpdateObjective(
                                        phase.id,
                                        obj.id,
                                        'playerDescription',
                                        e.target.value
                                      )
                                    }
                                    placeholder='Player-visible description'
                                    className='block w-full rounded-md border border-input bg-background shadow-sm sm:text-sm'
                                  />
                                  <input
                                    value={obj.internalNote}
                                    onChange={e =>
                                      handleUpdateObjective(
                                        phase.id,
                                        obj.id,
                                        'internalNote',
                                        e.target.value
                                      )
                                    }
                                    placeholder='Internal note (builder only)'
                                    className='block w-full rounded-md border border-input bg-background shadow-sm sm:text-sm text-muted-foreground'
                                  />

                                  {/* Target fields based on objective type */}
                                  {(obj.objectiveType === 'KILL_MOB' ||
                                    obj.objectiveType === 'TALK_TO_NPC') && (
                                    <EntityAutocomplete
                                      entityType='mob'
                                      value={{
                                        zoneId: obj.targetMobZoneId,
                                        id: obj.targetMobId,
                                      }}
                                      onChange={({ zoneId, id }) => {
                                        handleUpdateObjective(
                                          phase.id,
                                          obj.id,
                                          'targetMobZoneId',
                                          zoneId
                                        );
                                        handleUpdateObjective(
                                          phase.id,
                                          obj.id,
                                          'targetMobId',
                                          id
                                        );
                                      }}
                                      placeholder='Search target mob...'
                                    />
                                  )}

                                  {(obj.objectiveType === 'COLLECT_ITEM' ||
                                    obj.objectiveType === 'DELIVER_ITEM') && (
                                    <EntityAutocomplete
                                      entityType='object'
                                      value={{
                                        zoneId: obj.targetObjectZoneId,
                                        id: obj.targetObjectId,
                                      }}
                                      onChange={({ zoneId, id }) => {
                                        handleUpdateObjective(
                                          phase.id,
                                          obj.id,
                                          'targetObjectZoneId',
                                          zoneId
                                        );
                                        handleUpdateObjective(
                                          phase.id,
                                          obj.id,
                                          'targetObjectId',
                                          id
                                        );
                                      }}
                                      placeholder='Search target object...'
                                    />
                                  )}

                                  {obj.objectiveType === 'VISIT_ROOM' && (
                                    <EntityAutocomplete
                                      entityType='room'
                                      value={{
                                        zoneId: obj.targetRoomZoneId,
                                        id: obj.targetRoomId,
                                      }}
                                      onChange={({ zoneId, id }) => {
                                        handleUpdateObjective(
                                          phase.id,
                                          obj.id,
                                          'targetRoomZoneId',
                                          zoneId
                                        );
                                        handleUpdateObjective(
                                          phase.id,
                                          obj.id,
                                          'targetRoomId',
                                          id
                                        );
                                      }}
                                      placeholder='Search target room...'
                                    />
                                  )}

                                  {(obj.objectiveType === 'USE_SKILL' ||
                                    obj.objectiveType === 'DELIVER_ITEM') && (
                                    <p className='text-xs text-amber-600 dark:text-amber-400'>
                                      {obj.objectiveType === 'USE_SKILL'
                                        ? 'The editor cannot set the skill for this type yet, so it will not advance.'
                                        : 'The editor cannot set the recipient mob for this type yet, so it will not advance.'}
                                    </p>
                                  )}

                                  {obj.objectiveType === 'CUSTOM_LUA' && (
                                    <div className='space-y-1'>
                                      <div className='flex items-center gap-1 text-xs font-medium text-muted-foreground'>
                                        Lua expression
                                        <HelpButton
                                          topic='quests'
                                          anchor={HELP.customLua}
                                          variant='icon'
                                          tip='A boolean expression checked about once a minute; true adds 1 to the count'
                                        />
                                      </div>
                                      <textarea
                                        value={obj.luaExpression}
                                        onChange={e =>
                                          handleUpdateObjective(
                                            phase.id,
                                            obj.id,
                                            'luaExpression',
                                            e.target.value
                                          )
                                        }
                                        placeholder='e.g. actor.level >= 10 and actor:has_item(30, 12)'
                                        rows={3}
                                        className='block w-full rounded-md border border-input bg-background font-mono text-sm'
                                      />
                                    </div>
                                  )}
                                </div>
                                <button
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
                                <div className='flex-1 space-y-3'>
                                  <div className='grid grid-cols-4 gap-3'>
                                    <div>
                                      <label className='block text-xs font-medium text-muted-foreground mb-1'>
                                        Type
                                      </label>
                                      <select
                                        value={reward.rewardType}
                                        onChange={e =>
                                          handleUpdateReward(
                                            phase.id,
                                            reward.id,
                                            'rewardType',
                                            e.target.value as QuestRewardType
                                          )
                                        }
                                        className='block w-full rounded-md border border-input bg-background shadow-sm sm:text-sm'
                                      >
                                        {REWARD_TYPES.map(type => (
                                          <option
                                            key={type.value}
                                            value={type.value}
                                          >
                                            {type.label}
                                          </option>
                                        ))}
                                      </select>
                                    </div>

                                    {(reward.rewardType === 'EXPERIENCE' ||
                                      reward.rewardType === 'GOLD') && (
                                      <div>
                                        <label className='block text-xs font-medium text-muted-foreground mb-1'>
                                          Amount
                                        </label>
                                        <input
                                          type='number'
                                          value={reward.amount || ''}
                                          onChange={e =>
                                            handleUpdateReward(
                                              phase.id,
                                              reward.id,
                                              'amount',
                                              e.target.value
                                                ? parseInt(e.target.value)
                                                : null
                                            )
                                          }
                                          placeholder='Amount'
                                          className='block w-full rounded-md border border-input bg-background shadow-sm sm:text-sm'
                                        />
                                      </div>
                                    )}

                                    {reward.rewardType === 'ITEM' && (
                                      <div className='col-span-2'>
                                        <label className='block text-xs font-medium text-muted-foreground mb-1'>
                                          Item
                                        </label>
                                        <EntityAutocomplete
                                          entityType='object'
                                          value={{
                                            zoneId: reward.objectZoneId,
                                            id: reward.objectId,
                                          }}
                                          onChange={({ zoneId, id }) => {
                                            handleUpdateReward(
                                              phase.id,
                                              reward.id,
                                              'objectZoneId',
                                              zoneId
                                            );
                                            handleUpdateReward(
                                              phase.id,
                                              reward.id,
                                              'objectId',
                                              id
                                            );
                                          }}
                                          placeholder='Search item...'
                                        />
                                      </div>
                                    )}

                                    {reward.rewardType === 'ABILITY' && (
                                      <div>
                                        <label className='block text-xs font-medium text-muted-foreground mb-1'>
                                          Ability ID
                                        </label>
                                        <input
                                          type='number'
                                          value={reward.abilityId || ''}
                                          onChange={e =>
                                            handleUpdateReward(
                                              phase.id,
                                              reward.id,
                                              'abilityId',
                                              e.target.value
                                                ? parseInt(e.target.value)
                                                : null
                                            )
                                          }
                                          placeholder='Ability ID'
                                          className='block w-full rounded-md border border-input bg-background shadow-sm sm:text-sm'
                                        />
                                      </div>
                                    )}

                                    <div>
                                      <label className='flex items-center gap-1 text-xs font-medium text-muted-foreground mb-1'>
                                        Choice Group
                                        <HelpButton
                                          topic='quests'
                                          anchor={HELP.rewards}
                                          variant='icon'
                                          tip='Rewards sharing a group are pick-one, claimed with qreward'
                                        />
                                      </label>
                                      <input
                                        type='number'
                                        value={reward.choiceGroup || ''}
                                        onChange={e =>
                                          handleUpdateReward(
                                            phase.id,
                                            reward.id,
                                            'choiceGroup',
                                            e.target.value
                                              ? parseInt(e.target.value)
                                              : null
                                          )
                                        }
                                        placeholder='Group'
                                        title='Same group = player chooses one'
                                        className='block w-full rounded-md border border-input bg-background shadow-sm sm:text-sm'
                                      />
                                    </div>
                                  </div>
                                </div>
                                <button
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
