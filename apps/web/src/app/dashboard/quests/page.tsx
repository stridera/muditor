'use client';

import { PermissionGuard } from '@/components/auth/permission-guard';
import { DualInterface } from '@/components/dashboard/dual-interface';
import { ColoredTextInline } from '@/components/ColoredTextViewer';
import { useZone } from '@/contexts/zone-context';
import {
  GetQuestsDocument,
  GetQuestsByZoneDocument,
  type GetQuestsQuery,
  type GetQuestsByZoneQuery,
} from '@/generated/graphql';
import { useQuery } from '@apollo/client/react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Edit,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  Target,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type Quest = GetQuestsQuery['quests'][number];

export default function QuestsPage() {
  return (
    <PermissionGuard requireImmortal={true}>
      <QuestsContent />
    </PermissionGuard>
  );
}

function QuestsContent() {
  const searchParams = useSearchParams();
  const zoneParam = searchParams.get('zone');
  const { selectedZone, setSelectedZone } = useZone();

  const [expandedQuests, setExpandedQuests] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Sync zone parameter from URL with context
  useEffect(() => {
    if (zoneParam) {
      const zoneId = parseInt(zoneParam);
      if (!isNaN(zoneId) && selectedZone !== zoneId) {
        setSelectedZone(zoneId);
      }
    } else if (!zoneParam && selectedZone !== null) {
      setSelectedZone(null);
    }
  }, [zoneParam, selectedZone, setSelectedZone]);

  // Fetch quests
  const {
    loading,
    error: queryError,
    data,
    refetch,
  } = useQuery<GetQuestsByZoneQuery | GetQuestsQuery>(
    selectedZone ? GetQuestsByZoneDocument : GetQuestsDocument,
    {
      variables: selectedZone ? { zoneId: selectedZone } : {},
    }
  );

  // Extract quests from the query result
  const quests: Quest[] =
    data && 'questsByZone' in data
      ? (data.questsByZone as Quest[])
      : data && 'quests' in data
        ? (data.quests as Quest[])
        : [];

  // Pagination
  const totalCount = quests.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const paginatedQuests = quests.slice(startIndex, startIndex + itemsPerPage);
  const startItem = totalCount > 0 ? startIndex + 1 : 0;
  const endItem = Math.min(startIndex + itemsPerPage, totalCount);

  const toggleQuestExpanded = (zoneId: number, id: number) => {
    const key = `${zoneId}-${id}`;
    const newExpanded = new Set(expandedQuests);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedQuests(newExpanded);
  };

  const getObjectiveTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      KILL_MOB: 'Kill',
      COLLECT_ITEM: 'Collect',
      DELIVER_ITEM: 'Deliver',
      VISIT_ROOM: 'Visit',
      TALK_TO_NPC: 'Talk to',
      USE_SKILL: 'Use Skill',
      CUSTOM_LUA: 'Custom',
    };
    return labels[type] || type;
  };

  if (loading) return <div className='p-4'>Loading quests...</div>;
  if (queryError)
    return (
      <div className='p-4 text-red-600' data-testid='error-message'>
        Error: {queryError.message}
      </div>
    );

  const adminView = (
    <div className='p-6'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-foreground'>
            {selectedZone ? `Zone ${selectedZone} Quests` : 'All Quests'}
          </h1>
          <p className='text-sm text-muted-foreground mt-1'>
            Showing {startItem}-{endItem} of {totalCount} quests (Page{' '}
            {validCurrentPage} of {totalPages})
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => refetch()}
            className='inline-flex items-center px-3 py-2 border border-border rounded-md shadow-sm text-sm font-medium bg-card text-foreground hover:bg-muted'
          >
            <RefreshCw className='w-4 h-4 mr-2' />
            Refresh
          </button>
          <Link href='/dashboard/quests/editor'>
            <button className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/80'>
              <Plus className='w-4 h-4 mr-2' />
              Create New Quest
            </button>
          </Link>
        </div>
      </div>

      {/* Items Per Page Controls */}
      <div className='flex items-center gap-4 mb-4 p-4 bg-muted rounded-lg'>
        <div className='flex items-center gap-2'>
          <label className='text-sm font-medium text-muted-foreground'>
            Items per page:
          </label>
          <select
            value={itemsPerPage}
            onChange={e => {
              setItemsPerPage(parseInt(e.target.value));
              setCurrentPage(1);
            }}
            className='border border-border rounded px-2 py-1 text-sm bg-background'
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {paginatedQuests.length === 0 ? (
        <div className='text-center py-12'>
          <div className='text-muted-foreground mb-4'>No quests found</div>
          <Link href='/dashboard/quests/editor'>
            <button className='bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/80'>
              Create Quest
            </button>
          </Link>
        </div>
      ) : (
        <div className='grid gap-4'>
          {paginatedQuests.map(quest => {
            const questKey = `${quest.zoneId}-${quest.id}`;
            const isExpanded = expandedQuests.has(questKey);
            const totalObjectives =
              quest.phases?.reduce(
                (sum, phase) => sum + (phase.objectives?.length || 0),
                0
              ) || 0;

            return (
              <div
                key={questKey}
                className='bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow'
              >
                <div
                  className='flex items-start justify-between cursor-pointer'
                  onClick={() => toggleQuestExpanded(quest.zoneId, quest.id)}
                >
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      <h3 className='font-semibold text-lg text-foreground'>
                        #{quest.id} - <ColoredTextInline markup={quest.name} />
                      </h3>
                      {quest.hidden && (
                        <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground'>
                          <EyeOff className='w-3 h-3 mr-1' />
                          Hidden
                        </span>
                      )}
                      {quest.repeatable && (
                        <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'>
                          <RefreshCw className='w-3 h-3 mr-1' />
                          Repeatable
                        </span>
                      )}
                      <div className='text-muted-foreground'>
                        {isExpanded ? (
                          <ChevronUp className='w-4 h-4' />
                        ) : (
                          <ChevronDown className='w-4 h-4' />
                        )}
                      </div>
                    </div>

                    {quest.description && (
                      <p className='text-muted-foreground mb-2 line-clamp-2'>
                        {quest.description}
                      </p>
                    )}

                    <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                      <span>Zone {quest.zoneId}</span>
                      <span>
                        Level {quest.minLevel || 1}-{quest.maxLevel || 100}
                      </span>
                      <span>{quest.phases?.length || 0} phases</span>
                      <span>{totalObjectives} objectives</span>
                      {(() => {
                        const totalRewards =
                          quest.phases?.reduce(
                            (sum, phase) => sum + (phase.rewards?.length || 0),
                            0
                          ) || 0;
                        return totalRewards > 0 ? (
                          <span>{totalRewards} rewards</span>
                        ) : null;
                      })()}
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className='mt-4 pt-4 border-t border-border'>
                        {/* Phases */}
                        {quest.phases && quest.phases.length > 0 && (
                          <div className='mb-4'>
                            <h4 className='font-semibold text-sm text-muted-foreground mb-2'>
                              Phases
                            </h4>
                            <div className='space-y-3'>
                              {quest.phases.map((phase, phaseIdx) => (
                                <div
                                  key={phase.id}
                                  className='bg-muted/50 rounded-lg p-3'
                                >
                                  <div className='flex items-center gap-2 mb-2'>
                                    <span className='text-xs bg-primary/20 text-primary px-2 py-0.5 rounded'>
                                      Phase {phaseIdx + 1}
                                    </span>
                                    <span className='font-medium'>
                                      {phase.name}
                                    </span>
                                  </div>
                                  {phase.objectives &&
                                    phase.objectives.length > 0 && (
                                      <div className='space-y-1 ml-4'>
                                        {phase.objectives.map(obj => (
                                          <div
                                            key={obj.id}
                                            className='flex items-center gap-2 text-sm'
                                          >
                                            <Target className='w-3 h-3 text-muted-foreground' />
                                            <span className='text-xs bg-secondary px-1.5 py-0.5 rounded'>
                                              {getObjectiveTypeLabel(
                                                obj.objectiveType
                                              )}
                                            </span>
                                            <span>{obj.playerDescription}</span>
                                            {obj.requiredCount > 1 && (
                                              <span className='text-muted-foreground'>
                                                x{obj.requiredCount}
                                              </span>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Rewards Summary (per phase) */}
                        {quest.phases?.some(
                          phase => phase.rewards && phase.rewards.length > 0
                        ) && (
                          <div className='mb-4'>
                            <h4 className='font-semibold text-sm text-muted-foreground mb-2'>
                              Rewards
                            </h4>
                            <div className='space-y-2'>
                              {quest.phases
                                ?.filter(
                                  phase =>
                                    phase.rewards && phase.rewards.length > 0
                                )
                                .map(phase => (
                                  <div key={phase.id}>
                                    <span className='text-xs text-muted-foreground'>
                                      {phase.name}:
                                    </span>
                                    <div className='flex flex-wrap gap-1 mt-1'>
                                      {phase.rewards?.map(reward => (
                                        <span
                                          key={reward.id}
                                          className='inline-flex items-center px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                                        >
                                          {reward.rewardType}
                                          {reward.amount &&
                                            `: ${reward.amount}`}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Prerequisites */}
                        {quest.prerequisites &&
                          quest.prerequisites.length > 0 && (
                            <div>
                              <h4 className='font-semibold text-sm text-muted-foreground mb-2'>
                                Prerequisites
                              </h4>
                              <div className='flex flex-wrap gap-2'>
                                {quest.prerequisites.map(prereq => (
                                  <span
                                    key={prereq.id}
                                    className='inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  >
                                    Quest {prereq.prerequisiteQuestZoneId}:
                                    {prereq.prerequisiteQuestId}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    )}
                  </div>

                  <div
                    className='flex items-center gap-2 ml-4'
                    onClick={e => e.stopPropagation()}
                  >
                    <Link
                      href={`/dashboard/quests/editor?zone=${quest.zoneId}&id=${quest.id}`}
                    >
                      <button className='inline-flex items-center text-primary hover:text-primary-foreground px-3 py-1 text-sm'>
                        <Edit className='w-3 h-3 mr-1' />
                        Edit
                      </button>
                    </Link>
                    <button className='inline-flex items-center text-destructive hover:text-destructive-foreground px-3 py-1 text-sm'>
                      <Trash2 className='w-3 h-3 mr-1' />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between mt-6 px-4 py-3 bg-muted rounded-lg'>
          <div className='text-sm text-muted-foreground'>
            Showing {startItem}-{endItem} of {totalCount} results
          </div>
          <div className='flex items-center gap-2'>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className='inline-flex items-center px-3 py-2 border border-border rounded-md text-sm font-medium text-foreground bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <ChevronLeft className='w-4 h-4 mr-1' />
              Previous
            </button>

            <div className='flex items-center gap-1'>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 text-sm rounded-md ${
                      currentPage === pageNum
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && (
                <>
                  <span className='px-2 text-gray-500'>...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className='px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md'
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className='inline-flex items-center px-3 py-2 border border-border rounded-md text-sm font-medium text-foreground bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Next
              <ChevronRight className='w-4 h-4 ml-1' />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <DualInterface
      title='Quests'
      description='View and manage quest configurations'
      adminView={adminView}
    >
      <div></div>
    </DualInterface>
  );
}
