'use client';

export const dynamic = 'force-dynamic';

import { PermissionGuard } from '@/components/auth/permission-guard';
import { ColoredTextEditor } from '@/components/ColoredTextEditor';
import { ColoredTextInline } from '@/components/ColoredTextViewer';
import { EntityAutocomplete } from '@/components/quests/EntityAutocomplete';
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
  CreateQuestPrerequisiteDocument,
  DeleteQuestPrerequisiteDocument,
  type GetQuestQuery,
  type QuestObjectiveType,
  type QuestRewardType,
} from '@/generated/graphql';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Gift,
  GripVertical,
  Link2,
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
  giverMobZoneId: number | null;
  giverMobId: number | null;
  completerMobZoneId: number | null;
  completerMobId: number | null;
}

interface PhaseFormData {
  id: number;
  name: string;
  description: string;
  order: number;
  objectives: ObjectiveFormData[];
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

const OBJECTIVE_TYPES: { value: QuestObjectiveType; label: string }[] = [
  { value: 'KILL_MOB' as QuestObjectiveType, label: 'Kill Mob' },
  { value: 'COLLECT_ITEM' as QuestObjectiveType, label: 'Collect Item' },
  { value: 'DELIVER_ITEM' as QuestObjectiveType, label: 'Deliver Item' },
  { value: 'VISIT_ROOM' as QuestObjectiveType, label: 'Visit Room' },
  { value: 'TALK_TO_NPC' as QuestObjectiveType, label: 'Talk to NPC' },
  { value: 'USE_SKILL' as QuestObjectiveType, label: 'Use Skill' },
  { value: 'CUSTOM_LUA' as QuestObjectiveType, label: 'Custom (Lua)' },
];

interface RewardFormData {
  id: number;
  rewardType: QuestRewardType;
  amount: number | null;
  objectZoneId: number | null;
  objectId: number | null;
  abilityId: number | null;
  choiceGroup: number | null;
}

const REWARD_TYPES: { value: QuestRewardType; label: string }[] = [
  { value: 'EXPERIENCE' as QuestRewardType, label: 'Experience' },
  { value: 'GOLD' as QuestRewardType, label: 'Gold' },
  { value: 'ITEM' as QuestRewardType, label: 'Item' },
  { value: 'ABILITY' as QuestRewardType, label: 'Ability' },
];

interface PrerequisiteFormData {
  id: number;
  prerequisiteQuestZoneId: number;
  prerequisiteQuestId: number;
}

function QuestEditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const questId = searchParams.get('id');
  const zoneId = searchParams.get('zone');
  const isNew = !questId || !zoneId;

  const [activeTab, setActiveTab] = useState<
    'basic' | 'phases' | 'rewards' | 'prerequisites'
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
    giverMobZoneId: null,
    giverMobId: null,
    completerMobZoneId: null,
    completerMobId: null,
  });

  const [phases, setPhases] = useState<PhaseFormData[]>([]);
  const [rewards, setRewards] = useState<RewardFormData[]>([]);
  const [prerequisites, setPrerequisites] = useState<PrerequisiteFormData[]>(
    []
  );
  const [newPrereqInput, setNewPrereqInput] = useState('');

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
  const [createPrerequisite] = useMutation(CreateQuestPrerequisiteDocument);
  const [deletePrerequisite] = useMutation(DeleteQuestPrerequisiteDocument);

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
        giverMobZoneId: quest.giverMobZoneId || null,
        giverMobId: quest.giverMobId || null,
        completerMobZoneId: quest.completerMobZoneId || null,
        completerMobId: quest.completerMobId || null,
      });

      // Load phases and objectives
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
          }))
        );
        // Expand all phases by default
        setExpandedPhases(new Set(quest.phases.map(p => p.id)));
      }

      // Load rewards
      if (quest.rewards) {
        setRewards(
          quest.rewards.map(reward => ({
            id: reward.id,
            rewardType: reward.rewardType,
            amount: reward.amount ?? null,
            objectZoneId: reward.objectZoneId ?? null,
            objectId: reward.objectId ?? null,
            abilityId: reward.abilityId ?? null,
            choiceGroup: reward.choiceGroup ?? null,
          }))
        );
      }

      // Load prerequisites
      if (quest.prerequisites) {
        setPrerequisites(
          quest.prerequisites.map(prereq => ({
            id: prereq.id,
            prerequisiteQuestZoneId: prereq.prerequisiteQuestZoneId,
            prerequisiteQuestId: prereq.prerequisiteQuestId,
          }))
        );
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
              giverMobZoneId: formData.giverMobZoneId || undefined,
              giverMobId: formData.giverMobId || undefined,
              completerMobZoneId: formData.completerMobZoneId || undefined,
              completerMobId: formData.completerMobId || undefined,
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
              giverMobZoneId: formData.giverMobZoneId,
              giverMobId: formData.giverMobId,
              completerMobZoneId: formData.completerMobZoneId,
              completerMobId: formData.completerMobId,
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

  // Reward handlers
  const handleAddReward = async () => {
    try {
      const result = await createReward({
        variables: {
          data: {
            questZoneId: formData.zoneId,
            questId: formData.id,
            rewardType: 'EXPERIENCE' as QuestRewardType,
            amount: 100,
          },
        },
      });

      if (result.data?.createQuestReward) {
        const newReward = result.data.createQuestReward;
        setRewards(prev => [
          ...prev,
          {
            id: newReward.id,
            rewardType: newReward.rewardType,
            amount: newReward.amount ?? null,
            objectZoneId: null,
            objectId: null,
            abilityId: null,
            choiceGroup: null,
          },
        ]);
      }
    } catch (err) {
      console.error('Error adding reward:', err);
      setGeneralError('Failed to add reward.');
    }
  };

  const handleUpdateReward = async (
    rewardId: number,
    field: keyof RewardFormData,
    value: string | number | boolean | null
  ) => {
    // Update local state first
    setRewards(prev =>
      prev.map(r => (r.id === rewardId ? { ...r, [field]: value } : r))
    );

    // Find the updated reward
    const updatedReward = rewards.find(r => r.id === rewardId);
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

  const handleDeleteReward = async (rewardId: number) => {
    if (!confirm('Delete this reward?')) return;

    try {
      await deleteReward({
        variables: { id: rewardId },
      });

      setRewards(prev => prev.filter(r => r.id !== rewardId));
    } catch (err) {
      console.error('Error deleting reward:', err);
      setGeneralError('Failed to delete reward.');
    }
  };

  // Prerequisite handlers
  const handleAddPrerequisite = async () => {
    // Parse input: "30:5" format
    const match = newPrereqInput.match(/^(\d+):(\d+)$/);
    if (!match || !match[1] || !match[2]) {
      setGeneralError('Invalid format. Use "zone:questId" (e.g., "30:5")');
      return;
    }

    const prereqZoneId = parseInt(match[1], 10);
    const prereqQuestId = parseInt(match[2], 10);

    // Check for self-reference
    if (prereqZoneId === formData.zoneId && prereqQuestId === formData.id) {
      setGeneralError('A quest cannot be its own prerequisite.');
      return;
    }

    // Check for duplicates
    if (
      prerequisites.some(
        p =>
          p.prerequisiteQuestZoneId === prereqZoneId &&
          p.prerequisiteQuestId === prereqQuestId
      )
    ) {
      setGeneralError('This prerequisite already exists.');
      return;
    }

    try {
      const result = await createPrerequisite({
        variables: {
          data: {
            questZoneId: formData.zoneId,
            questId: formData.id,
            prerequisiteQuestZoneId: prereqZoneId,
            prerequisiteQuestId: prereqQuestId,
          },
        },
      });

      if (result.data?.createQuestPrerequisite) {
        const newPrereq = result.data.createQuestPrerequisite;
        setPrerequisites(prev => [
          ...prev,
          {
            id: newPrereq.id,
            prerequisiteQuestZoneId: newPrereq.prerequisiteQuestZoneId,
            prerequisiteQuestId: newPrereq.prerequisiteQuestId,
          },
        ]);
        setNewPrereqInput('');
      }
    } catch (err) {
      console.error('Error adding prerequisite:', err);
      setGeneralError('Failed to add prerequisite.');
    }
  };

  const handleDeletePrerequisite = async (prereqId: number) => {
    if (!confirm('Remove this prerequisite?')) return;

    try {
      await deletePrerequisite({
        variables: { id: prereqId },
      });

      setPrerequisites(prev => prev.filter(p => p.id !== prereqId));
    } catch (err) {
      console.error('Error deleting prerequisite:', err);
      setGeneralError('Failed to remove prerequisite.');
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
    { id: 'phases' as const, label: 'Phases & Objectives' },
    { id: 'rewards' as const, label: 'Rewards' },
    { id: 'prerequisites' as const, label: 'Prerequisites' },
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
                <ColoredTextEditor
                  value={formData.name}
                  onChange={value => handleInputChange('name', value)}
                  placeholder='e.g., The Lost Artifact'
                  maxLength={80}
                  showPreview={true}
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-card-foreground mb-1'>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={e =>
                    handleInputChange('description', e.target.value)
                  }
                  placeholder='Quest description shown to players'
                  rows={3}
                  className='block w-full rounded-md border border-input bg-background shadow-sm focus:ring-ring focus:border-ring sm:text-sm'
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
                </label>
              </div>

              {/* Quest Giver/Completer */}
              <div className='grid grid-cols-2 gap-4 pt-4 border-t border-border'>
                <div>
                  <label className='block text-sm font-medium text-muted-foreground mb-1'>
                    Quest Giver
                  </label>
                  <EntityAutocomplete
                    entityType='mob'
                    value={{
                      zoneId: formData.giverMobZoneId,
                      id: formData.giverMobId,
                    }}
                    onChange={({ zoneId, id }) => {
                      setFormData(prev => ({
                        ...prev,
                        giverMobZoneId: zoneId,
                        giverMobId: id,
                      }));
                    }}
                    placeholder='Search mob (e.g., "helena" or "30:5")'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-muted-foreground mb-1'>
                    Quest Completer
                  </label>
                  <EntityAutocomplete
                    entityType='mob'
                    value={{
                      zoneId: formData.completerMobZoneId,
                      id: formData.completerMobId,
                    }}
                    onChange={({ zoneId, id }) => {
                      setFormData(prev => ({
                        ...prev,
                        completerMobZoneId: zoneId,
                        completerMobId: id,
                      }));
                    }}
                    placeholder='Search mob (e.g., "helena" or "30:5")'
                  />
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

                                  {obj.objectiveType === 'CUSTOM_LUA' && (
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
                                      placeholder='Lua expression for custom objective'
                                      rows={3}
                                      className='block w-full rounded-md border border-input bg-background font-mono text-sm'
                                    />
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

        {/* Rewards Tab */}
        {activeTab === 'rewards' && (
          <div className='bg-card shadow rounded-lg p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-medium text-card-foreground'>
                Quest Rewards
              </h3>
              {!isNew && (
                <button
                  type='button'
                  onClick={handleAddReward}
                  className='inline-flex items-center px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90'
                >
                  <Plus className='w-4 h-4 mr-1' />
                  Add Reward
                </button>
              )}
            </div>

            {isNew && (
              <div className='bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4'>
                <p className='text-amber-800 dark:text-amber-200 text-sm'>
                  Save the quest first before adding rewards.
                </p>
              </div>
            )}

            {!isNew && rewards.length === 0 && (
              <div className='text-center py-8 text-muted-foreground'>
                No rewards yet. Click "Add Reward" to add quest rewards.
              </div>
            )}

            {!isNew && rewards.length > 0 && (
              <div className='space-y-4'>
                {rewards.map(reward => (
                  <div
                    key={reward.id}
                    className='bg-muted/50 rounded-lg p-4 space-y-3'
                  >
                    <div className='flex items-start gap-4'>
                      <Gift className='w-5 h-5 text-amber-500 mt-1' />
                      <div className='flex-1 space-y-3'>
                        <div className='flex gap-4'>
                          <div className='w-40'>
                            <label className='block text-xs font-medium text-muted-foreground mb-1'>
                              Type
                            </label>
                            <select
                              value={reward.rewardType}
                              onChange={e =>
                                handleUpdateReward(
                                  reward.id,
                                  'rewardType',
                                  e.target.value as QuestRewardType
                                )
                              }
                              className='block w-full rounded-md border border-input bg-background shadow-sm sm:text-sm'
                            >
                              {REWARD_TYPES.map(type => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {(reward.rewardType === 'EXPERIENCE' ||
                            reward.rewardType === 'GOLD') && (
                            <div className='w-32'>
                              <label className='block text-xs font-medium text-muted-foreground mb-1'>
                                Amount
                              </label>
                              <input
                                type='number'
                                value={reward.amount || ''}
                                onChange={e =>
                                  handleUpdateReward(
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
                            <div className='flex-1'>
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
                                    reward.id,
                                    'objectZoneId',
                                    zoneId
                                  );
                                  handleUpdateReward(reward.id, 'objectId', id);
                                }}
                                placeholder='Search item...'
                              />
                            </div>
                          )}

                          {reward.rewardType === 'ABILITY' && (
                            <div className='w-40'>
                              <label className='block text-xs font-medium text-muted-foreground mb-1'>
                                Ability ID
                              </label>
                              <input
                                type='number'
                                value={reward.abilityId || ''}
                                onChange={e =>
                                  handleUpdateReward(
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

                          <div className='w-24'>
                            <label className='block text-xs font-medium text-muted-foreground mb-1'>
                              Choice Group
                            </label>
                            <input
                              type='number'
                              value={reward.choiceGroup || ''}
                              onChange={e =>
                                handleUpdateReward(
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
                        type='button'
                        onClick={() => handleDeleteReward(reward.id)}
                        className='p-1.5 text-destructive hover:text-destructive-foreground hover:bg-destructive rounded'
                        title='Delete reward'
                      >
                        <Trash2 className='w-4 h-4' />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className='mt-4 text-sm text-muted-foreground'>
              <p>
                <strong>Tip:</strong> Use "Choice Group" to let players pick one
                reward from a group. Rewards with the same group number are
                mutually exclusive.
              </p>
            </div>
          </div>
        )}

        {/* Prerequisites Tab */}
        {activeTab === 'prerequisites' && (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-lg font-semibold flex items-center gap-2'>
                <Link2 className='w-5 h-5' />
                Quest Prerequisites
              </h2>
            </div>

            <p className='text-muted-foreground'>
              Players must complete the prerequisite quests before this quest
              becomes available.
            </p>

            {/* Add Prerequisite Input */}
            <div className='bg-muted/50 rounded-lg p-4'>
              <label className='block text-sm font-medium text-muted-foreground mb-2'>
                Add Prerequisite Quest
              </label>
              <div className='flex items-center gap-2'>
                <input
                  type='text'
                  value={newPrereqInput}
                  onChange={e => setNewPrereqInput(e.target.value)}
                  placeholder='Enter zone:questId (e.g., 30:5)'
                  className='flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm'
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPrerequisite();
                    }
                  }}
                />
                <button
                  type='button'
                  onClick={handleAddPrerequisite}
                  disabled={!newPrereqInput.trim()}
                  className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
                >
                  <Plus className='w-4 h-4 mr-2' />
                  Add
                </button>
              </div>
              <p className='text-xs text-muted-foreground mt-2'>
                Format: zone:questId (e.g., "185:1" for Quest 1 in Zone 185)
              </p>
            </div>

            {/* Prerequisites List */}
            {prerequisites.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>
                <Link2 className='w-8 h-8 mx-auto mb-2 opacity-50' />
                <p>No prerequisites configured</p>
                <p className='text-sm'>
                  This quest will be available to all players who meet the level
                  requirements.
                </p>
              </div>
            ) : (
              <div className='space-y-2'>
                {prerequisites.map(prereq => (
                  <div
                    key={prereq.id}
                    className='flex items-center justify-between bg-muted/50 rounded-lg px-4 py-3'
                  >
                    <div className='flex items-center gap-3'>
                      <Link2 className='w-4 h-4 text-muted-foreground' />
                      <span className='font-mono text-sm'>
                        Quest {prereq.prerequisiteQuestZoneId}:
                        {prereq.prerequisiteQuestId}
                      </span>
                    </div>
                    <button
                      type='button'
                      onClick={() => handleDeletePrerequisite(prereq.id)}
                      className='p-1.5 text-destructive hover:text-destructive-foreground hover:bg-destructive rounded'
                      title='Remove prerequisite'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className='mt-4 text-sm text-muted-foreground'>
              <p>
                <strong>Note:</strong> Prerequisites create a linear quest
                chain. Players must complete quests in order.
              </p>
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
