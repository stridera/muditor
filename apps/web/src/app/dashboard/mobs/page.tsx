'use client';

import { PermissionGuard } from '@/components/auth/permission-guard';
import { DualInterface } from '@/components/dashboard/dual-interface';
import { ColoredTextInline } from '@/components/ColoredTextViewer';
import { useZone } from '@/contexts/zone-context';
import {
  GetMobsDocument,
  GetMobsByZoneDocument,
  type GetMobsQuery,
  type GetMobsByZoneQuery,
  type GetMobsByZoneQueryVariables,
} from '@/generated/graphql';
import { useQuery } from '@apollo/client/react';
import {
  ArrowDown,
  ArrowUp,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  Download,
  Edit,
  Plus,
  Square,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import EnhancedSearch, {
  type EnhancedSearchRef,
  type SearchFilters,
} from '../../../components/EnhancedSearch';
import {
  applySearchFilters,
  createMobPresets,
} from '../../../lib/search-utils';

interface Mob {
  id: number;
  keywords: string[];
  name: string;
  roomDescription: string;
  examineDescription: string;
  level?: number;
  alignment?: number;
  hpDice: string;
  damageDice: string;
  race?: string;
  lifeForce?: string;
  damageType?: string;
  hitRoll?: number;
  armorClass?: number;
  strength?: number;
  intelligence?: number;
  wisdom?: number;
  dexterity?: number;
  constitution?: number;
  charisma?: number;
  wealth?: number;
  mobClass?: string;
  mobFlags?: string[];
  effectFlags?: string[];
  zoneId: number;
}

export default function MobsPage() {
  return (
    <PermissionGuard requireImmortal={true}>
      <MobsContent />
    </PermissionGuard>
  );
}

function MobsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const zoneParam = searchParams.get('zone');
  const idParam = searchParams.get('id');
  const { selectedZone, setSelectedZone } = useZone();
  const searchRef = useRef<EnhancedSearchRef>(null);

  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    searchTerm: '',
  });
  const [selectedMobs, setSelectedMobs] = useState<Set<number>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [cloningId, setCloningId] = useState<number | null>(null);
  const [expandedMobs, setExpandedMobs] = useState<Set<number>>(new Set());
  const [loadingDetails, setLoadingDetails] = useState<Set<number>>(new Set());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sortBy, setSortBy] = useState('level');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Auto-expand mob if id parameter is provided (for display, not editing)
  useEffect(() => {
    if (idParam) {
      const mobId = parseInt(idParam);
      if (!isNaN(mobId)) {
        setExpandedMobs(prev => new Set(prev).add(mobId));
        // Scroll to the mob after a short delay to allow rendering
        setTimeout(() => {
          const element = document.getElementById(`mob-${mobId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }
  }, [idParam]);

  // Sync zone parameter from URL with context
  useEffect(() => {
    if (zoneParam) {
      const zoneId = parseInt(zoneParam);
      if (!isNaN(zoneId) && selectedZone !== zoneId) {
        setSelectedZone(zoneId);
      }
    } else if (!zoneParam && selectedZone !== null) {
      // Clear zone when parameter is removed from URL
      setSelectedZone(null);
    }
  }, [zoneParam, selectedZone, setSelectedZone]);

  // Fetch mobs using Apollo Client with conditional query
  const {
    loading,
    error: queryError,
    data,
    refetch,
  } = useQuery<GetMobsByZoneQuery | GetMobsQuery>(
    selectedZone ? GetMobsByZoneDocument : GetMobsDocument,
    {
      variables: selectedZone ? { zoneId: selectedZone } : {},
      skip: false, // Always run the query
    }
  );

  // Extract mobs from the query result
  const rawMobs: Mob[] =
    data && 'mobsByZone' in data
      ? (data.mobsByZone as Mob[])
      : data && 'mobs' in data
        ? (data.mobs as Mob[])
        : [];

  // Deduplicate mobs based on composite key (zoneId, id)
  const mobs: Mob[] = Array.from(
    new Map(rawMobs.map(mob => [`${mob.zoneId}-${mob.id}`, mob])).values()
  );

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchFilters.searchTerm]);

  // Keyboard shortcut: '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only focus if '/' is pressed and we're not already in an input/textarea
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName) &&
        !(e.target as HTMLElement)?.isContentEditable
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Apply advanced search filters (zone filtering is done server-side)
  const searchedMobs = applySearchFilters(mobs, searchFilters, {
    // Custom field mappings for mob-specific filters
    healthPoints: mob => (mob.level || 0) * 10, // Use level-based HP since dice are all 0
    isHighLevel: mob => (mob.level || 0) >= 50,
    isNewbie: mob => (mob.level || 0) <= 10,
  });

  // Apply client-side sorting
  const sortedMobs = [...searchedMobs].sort((a, b) => {
    const aVal = a[sortBy as keyof Mob] || 0;
    const bVal = b[sortBy as keyof Mob] || 0;
    if (sortOrder === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });

  // Apply client-side pagination with page clamping
  const totalCount = sortedMobs.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;
  // Clamp currentPage to valid range to handle search filter changes
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const filteredMobs = sortedMobs.slice(startIndex, startIndex + itemsPerPage);
  const filteredCount = totalCount;
  const startItem = totalCount > 0 ? startIndex + 1 : 0;
  const endItem = Math.min(startIndex + itemsPerPage, totalCount);

  // Bulk operations
  const toggleMobSelection = (mobId: number) => {
    const newSelected = new Set(selectedMobs);
    if (newSelected.has(mobId)) {
      newSelected.delete(mobId);
    } else {
      newSelected.add(mobId);
    }
    setSelectedMobs(newSelected);
  };

  const selectAllMobs = () => {
    setSelectedMobs(new Set(filteredMobs.map(mob => mob.id)));
  };

  const clearSelection = () => {
    setSelectedMobs(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedMobs.size === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${selectedMobs.size} mobs? This action cannot be undone.`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const mutation = `
        mutation DeleteMobs($ids: [Int!]!) {
          deleteMobs(ids: $ids)
        }
      `;

      const response = await fetch(
        process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3001/graphql',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: mutation,
            variables: { ids: Array.from(selectedMobs) },
          }),
        }
      );

      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      // Refetch mobs to update the list
      await refetch();
      clearSelection();
    } catch (err) {
      alert(
        `Failed to delete mobs: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloneMob = async (mobId: number) => {
    setCloningId(mobId);
    try {
      // First, fetch the complete mob data
      const getMobQuery = `
        query GetMob($id: Int!) {
          mob(id: $id) {
            id
            keywords
            name
            roomDescription
            examineDescription
            level
            alignment
            hpDiceNum
            hpDiceSize
            hpDiceBonus
            damageDiceNum
            damageDiceSize
            damageDiceBonus
            mobClass
            race
            lifeForce
            damageType
            hitRoll
            armorClass
            strength
            intelligence
            wisdom
            dexterity
            constitution
            charisma
            raceAlign
            mobFlags
            effectFlags
            zoneId
          }
        }
      `;

      const mobResponse = await fetch(
        process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3001/graphql',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: getMobQuery,
            variables: { id: mobId },
          }),
        }
      );

      const mobResult = await mobResponse.json();
      if (mobResult.errors) {
        throw new Error(mobResult.errors[0].message);
      }

      const originalMob = mobResult.data.mob;
      if (!originalMob) {
        throw new Error('Mob not found');
      }

      // Create clone data (remove id and modify name)
      const cloneData = {
        keywords: originalMob.keywords,
        name: `${originalMob.name} (Copy)`,
        roomDescription: originalMob.roomDescription,
        examineDescription: originalMob.examineDescription,
        level: originalMob.level,
        alignment: originalMob.alignment,
        hpDiceNum: originalMob.hpDiceNum,
        hpDiceSize: originalMob.hpDiceSize,
        hpDiceBonus: originalMob.hpDiceBonus,
        damageDiceNum: originalMob.damageDiceNum,
        damageDiceSize: originalMob.damageDiceSize,
        damageDiceBonus: originalMob.damageDiceBonus,
        mobClass: originalMob.mobClass,
        race: originalMob.race,
        lifeForce: originalMob.lifeForce,
        damageType: originalMob.damageType,
        hitRoll: originalMob.hitRoll,
        armorClass: originalMob.armorClass,
        strength: originalMob.strength,
        intelligence: originalMob.intelligence,
        wisdom: originalMob.wisdom,
        dexterity: originalMob.dexterity,
        constitution: originalMob.constitution,
        charisma: originalMob.charisma,
        raceAlign: originalMob.raceAlign,
        mobFlags: originalMob.mobFlags,
        effectFlags: originalMob.effectFlags,
        zoneId: originalMob.zoneId,
      };

      // Create the cloned mob
      const createMutation = `
        mutation CreateMob($data: CreateMobInput!) {
          createMob(data: $data) {
            id
            keywords
            name
            roomDescription
            level
            hpDiceNum
            hpDiceSize
            hpDiceBonus
            zoneId
          }
        }
      `;

      const createResponse = await fetch(
        process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3001/graphql',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: createMutation,
            variables: { data: cloneData },
          }),
        }
      );

      const createResult = await createResponse.json();
      if (createResult.errors) {
        throw new Error(createResult.errors[0].message);
      }

      const newMob = createResult.data.createMob;

      // Refetch mobs to update the list
      await refetch();

      // Show success message (could be replaced with a toast notification)
      alert(`Mob cloned successfully! New mob ID: ${newMob.id}`);
    } catch (err) {
      /* LoggingService.error('Error cloning mob:', err); */
      alert(
        `Failed to clone mob: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    } finally {
      setCloningId(null);
    }
  };

  const exportSelectedMobs = () => {
    if (selectedMobs.size === 0) return;

    const selectedData = filteredMobs.filter(mob => selectedMobs.has(mob.id));
    const jsonData = JSON.stringify(selectedData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `mobs_${selectedMobs.size}_items.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const toggleMobExpanded = async (mobId: number) => {
    const newExpanded = new Set(expandedMobs);
    if (newExpanded.has(mobId)) {
      newExpanded.delete(mobId);
    } else {
      newExpanded.add(mobId);

      // Load detailed data if not already loaded
      const mob = mobs.find(m => m.id === mobId);
      if (mob && !mob.examineDescription) {
        setLoadingDetails(new Set(loadingDetails).add(mobId));
        try {
          const getMobQuery = `
            query GetMob($id: Int!) {
              mob(id: $id) {
                id
                keywords
                name
                roomDescription
                examineDescription
                level
                alignment
                hpDiceNum
                hpDiceSize
                hpDiceBonus
                damageDiceNum
                damageDiceSize
                damageDiceBonus
                mobClass
                race
                lifeForce
                damageType
                position
                defaultPosition
                hitRoll
                armorClass
                move
                strength
                intelligence
                wisdom
                dexterity
                constitution
                charisma
                perception
                concealment
                raceAlign
                gender
                size
                composition
                stance
                copper
                silver
                gold
                platinum
                mobFlags
                effectFlags
                zoneId
                createdAt
                updatedAt
              }
            }
          `;

          const response = await fetch(
            process.env.NEXT_PUBLIC_GRAPHQL_URL ||
              'http://localhost:3001/graphql',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                query: getMobQuery,
                variables: { id: mobId },
              }),
            }
          );

          const result = await response.json();
          if (result.errors) {
            /* LoggingService.error('Error loading mob details:', result.errors[0].message); */
          }
          // Note: Detailed mob data is fetched but not stored - expand shows list data only
        } catch {
          /* LoggingService.error('Error loading mob details'); */
        } finally {
          setLoadingDetails(prev => {
            const newSet = new Set(prev);
            newSet.delete(mobId);
            return newSet;
          });
        }
      }
    }
    setExpandedMobs(newExpanded);
  };

  if (loading) return <div className='p-4'>Loading mobs...</div>;
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
            {selectedZone ? `Zone ${selectedZone} Mobs` : 'All Mobs'}
          </h1>
          <p className='text-sm text-muted-foreground mt-1'>
            Showing {startItem}-{endItem} of {filteredCount} mobs (Page{' '}
            {currentPage} of {totalPages})
          </p>
        </div>
        <Link href='/dashboard/mobs/editor'>
          <button className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/80'>
            <Plus className='w-4 h-4 mr-2' />
            Create New Mob
          </button>
        </Link>
      </div>

      {/* Sort and Items Per Page Controls */}
      <div className='flex items-center gap-4 mb-4 p-4 bg-muted rounded-lg'>
        <div className='flex items-center gap-2'>
          <label className='text-sm font-medium text-muted-foreground'>
            Sort by:
          </label>
          <select
            value={sortBy}
            onChange={e => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className='border border-border rounded px-2 py-1 text-sm bg-background'
          >
            <option value='level'>Level</option>
            <option value='name'>Name</option>
            <option value='id'>ID</option>
            <option value='zoneId'>Zone</option>
          </select>
          <button
            onClick={() => {
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              setCurrentPage(1);
            }}
            className='p-1 hover:bg-muted rounded'
            title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          >
            {sortOrder === 'asc' ? (
              <ArrowUp className='w-4 h-4' />
            ) : (
              <ArrowDown className='w-4 h-4' />
            )}
          </button>
        </div>
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

      {/* Enhanced Search */}
      <EnhancedSearch
        ref={searchRef}
        onFiltersChange={setSearchFilters}
        placeholder='Search mobs by name, keywords, description, or ID...'
        showLevelFilter={true}
        presets={createMobPresets()}
        customFilterOptions={[
          {
            key: 'isHighLevel',
            label: 'High Level Mobs',
            type: 'boolean',
          },
          {
            key: 'isNewbie',
            label: 'Newbie Friendly',
            type: 'boolean',
          },
        ]}
        className='mb-6'
      />

      {/* Bulk Actions Toolbar */}
      {selectedMobs.size > 0 && (
        <div className='bg-primary/10 border border-primary rounded-lg p-4 mb-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <span className='text-primary font-medium'>
                {selectedMobs.size} mob{selectedMobs.size !== 1 ? 's' : ''}{' '}
                selected
              </span>
              <div className='flex items-center gap-2'>
                <button
                  onClick={selectAllMobs}
                  className='text-primary hover:text-primary-foreground text-sm underline'
                  disabled={selectedMobs.size === filteredMobs.length}
                >
                  Select All ({filteredMobs.length})
                </button>
                <button
                  onClick={clearSelection}
                  className='text-primary hover:text-primary-foreground text-sm underline'
                >
                  Clear Selection
                </button>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={exportSelectedMobs}
                className='inline-flex items-center px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/80'
              >
                <Download className='w-3 h-3 mr-1' />
                Export JSON
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className='inline-flex items-center px-3 py-1.5 text-sm bg-destructive text-destructive-foreground rounded hover:bg-destructive/80 disabled:opacity-50'
              >
                <Trash2 className='w-3 h-3 mr-1' />
                {isDeleting ? 'Deleting...' : 'Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredMobs.length === 0 ? (
        <div className='text-center py-12'>
          <div className='text-muted-foreground mb-4'>No mobs found</div>
          <Link href='/dashboard/mobs/editor'>
            <button className='bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/80'>
              Create Mob
            </button>
          </Link>
        </div>
      ) : (
        <div className='grid gap-4'>
          {filteredMobs.map(mob => (
            <div
              id={`mob-${mob.id}`}
              key={`${mob.zoneId}-${mob.id}`}
              className='bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer'
              onClick={() => toggleMobExpanded(mob.id)}
            >
              <div className='flex items-start justify-between'>
                {/* Checkbox for selection */}
                <div className='flex items-start gap-3'>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      toggleMobSelection(mob.id);
                    }}
                    className='mt-1 text-muted-foreground hover:text-primary'
                  >
                    {selectedMobs.has(mob.id) ? (
                      <CheckSquare className='w-5 h-5 text-blue-600' />
                    ) : (
                      <Square className='w-5 h-5' />
                    )}
                  </button>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      <h3 className='font-semibold text-lg text-foreground'>
                        #{mob.id} - <ColoredTextInline markup={mob.name} />
                      </h3>
                      {/* Visual indicator for expand state */}
                      <div className='text-muted-foreground'>
                        {loadingDetails.has(mob.id) ? (
                          <div className='w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin' />
                        ) : expandedMobs.has(mob.id) ? (
                          <ChevronUp className='w-4 h-4' />
                        ) : (
                          <ChevronDown className='w-4 h-4' />
                        )}
                      </div>
                    </div>
                    <div className='flex flex-wrap gap-1 mb-2'>
                      {(mob.keywords ?? [])
                        .filter((k: string) => k)
                        .map((keyword: string, idx: number) => (
                          <span
                            key={`${mob.zoneId}-${mob.id}-kw-${idx}`}
                            className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground'
                          >
                            {keyword}
                          </span>
                        ))}
                    </div>
                    <p className='text-muted-foreground mb-2 line-clamp-2'>
                      {mob.roomDescription}
                    </p>
                    <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                      <span>Level {mob.level}</span>
                      <span>HP: {mob.hpDice}</span>
                      <span>Zone {mob.zoneId}</span>
                    </div>

                    {/* Expanded Details */}
                    {expandedMobs.has(mob.id) && (
                      <div className='mt-4 pt-4 border-t border-border'>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                          {/* Basic Info */}
                          <div>
                            <h4 className='font-semibold text-sm text-muted-foreground mb-2'>
                              Basic Info
                            </h4>
                            <div className='space-y-1 text-sm'>
                              <div>
                                <span className='text-muted-foreground'>
                                  ID:
                                </span>{' '}
                                {mob.id}
                              </div>
                              <div>
                                <span className='text-muted-foreground'>
                                  Class:
                                </span>{' '}
                                {mob.mobClass || 'N/A'}
                              </div>
                              <div>
                                <span className='text-muted-foreground'>
                                  Race:
                                </span>{' '}
                                {mob.race ? mob.race.replace(/_/g, ' ') : 'N/A'}
                              </div>
                              <div>
                                <span className='text-muted-foreground'>
                                  Alignment:
                                </span>{' '}
                                {mob.alignment || 0}
                              </div>
                              <div>
                                <span className='text-muted-foreground'>
                                  Life Force:
                                </span>{' '}
                                {mob.lifeForce || 'N/A'}
                              </div>
                            </div>
                          </div>

                          {/* Combat Stats */}
                          <div>
                            <h4 className='font-semibold text-sm text-muted-foreground mb-2'>
                              Combat Stats
                            </h4>
                            <div className='space-y-1 text-sm'>
                              <div>
                                <span className='text-muted-foreground'>
                                  HP:
                                </span>{' '}
                                {mob.hpDice}
                              </div>
                              <div>
                                <span className='text-muted-foreground'>
                                  Damage:
                                </span>{' '}
                                {mob.damageDice}
                              </div>
                              <div>
                                <span className='text-muted-foreground'>
                                  AC:
                                </span>{' '}
                                {mob.armorClass || 0}
                              </div>
                              <div>
                                <span className='text-muted-foreground'>
                                  Hit Roll:
                                </span>{' '}
                                {mob.hitRoll || 0}
                              </div>
                              <div>
                                <span className='text-muted-foreground'>
                                  Damage Type:
                                </span>{' '}
                                {mob.damageType || 'HIT'}
                              </div>
                            </div>
                          </div>

                          {/* Attributes */}
                          <div>
                            <h4 className='font-semibold text-sm text-muted-foreground mb-2'>
                              Attributes
                            </h4>
                            <div className='grid grid-cols-2 gap-1 text-sm'>
                              <div>
                                <span className='text-muted-foreground'>
                                  STR:
                                </span>{' '}
                                {mob.strength || 13}
                              </div>
                              <div>
                                <span className='text-muted-foreground'>
                                  INT:
                                </span>{' '}
                                {mob.intelligence || 13}
                              </div>
                              <div>
                                <span className='text-muted-foreground'>
                                  WIS:
                                </span>{' '}
                                {mob.wisdom || 13}
                              </div>
                              <div>
                                <span className='text-muted-foreground'>
                                  DEX:
                                </span>{' '}
                                {mob.dexterity || 13}
                              </div>
                              <div>
                                <span className='text-muted-foreground'>
                                  CON:
                                </span>{' '}
                                {mob.constitution || 13}
                              </div>
                              <div>
                                <span className='text-muted-foreground'>
                                  CHA:
                                </span>{' '}
                                {mob.charisma || 13}
                              </div>
                            </div>
                          </div>

                          {/* Flags */}
                          {(mob.mobFlags?.length ||
                            mob.effectFlags?.length) && (
                            <div className='md:col-span-2'>
                              <h4 className='font-semibold text-sm text-muted-foreground mb-2'>
                                Flags
                              </h4>
                              <div className='space-y-2'>
                                {mob.mobFlags && mob.mobFlags.length > 0 && (
                                  <div>
                                    <span className='text-xs text-muted-foreground block'>
                                      Mob Flags:
                                    </span>
                                    <div className='flex flex-wrap gap-1'>
                                      {mob.mobFlags.map(
                                        (flag: string, index: number) => (
                                          <span
                                            key={`${mob.zoneId}-${mob.id}-mf-${index}`}
                                            className='inline-block bg-muted text-muted-foreground text-xs px-2 py-1 rounded'
                                          >
                                            {flag}
                                          </span>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                                {mob.effectFlags &&
                                  mob.effectFlags.length > 0 && (
                                    <div>
                                      <span className='text-xs text-muted-foreground block'>
                                        Effect Flags:
                                      </span>
                                      <div className='flex flex-wrap gap-1'>
                                        {mob.effectFlags.map(
                                          (flag: string, index: number) => (
                                            <span
                                              key={`${mob.zoneId}-${mob.id}-ef-${index}`}
                                              className='inline-block bg-muted text-muted-foreground text-xs px-2 py-1 rounded'
                                            >
                                              {flag}
                                            </span>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Detailed Description */}
                        {mob.examineDescription && (
                          <div className='mt-4 pt-4 border-t border-border'>
                            <h4 className='font-semibold text-sm text-muted-foreground mb-2'>
                              Detailed Description
                            </h4>
                            <p className='text-sm text-muted-foreground'>
                              {mob.examineDescription}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className='flex items-center gap-2 ml-4'>
                  <Link
                    href={`/dashboard/mobs/view?zone=${mob.zoneId}&id=${mob.id}`}
                  >
                    <button
                      onClick={e => e.stopPropagation()}
                      className='inline-flex items-center text-muted-foreground hover:text-foreground px-3 py-1 text-sm'
                    >
                      View
                    </button>
                  </Link>
                  <Link
                    href={`/dashboard/mobs/editor?zone=${mob.zoneId}&id=${mob.id}`}
                  >
                    <button
                      onClick={e => e.stopPropagation()}
                      className='inline-flex items-center text-primary hover:text-primary-foreground px-3 py-1 text-sm'
                    >
                      <Edit className='w-3 h-3 mr-1' />
                      Edit
                    </button>
                  </Link>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleCloneMob(mob.id);
                    }}
                    disabled={cloningId === mob.id}
                    className='inline-flex items-center text-secondary hover:text-secondary-foreground px-3 py-1 text-sm disabled:opacity-50'
                  >
                    <Copy className='w-3 h-3 mr-1' />
                    {cloningId === mob.id ? 'Cloning...' : 'Clone'}
                  </button>
                  <button
                    onClick={e => e.stopPropagation()}
                    className='inline-flex items-center text-destructive hover:text-destructive-foreground px-3 py-1 text-sm'
                  >
                    <Trash2 className='w-3 h-3 mr-1' />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between mt-6 px-4 py-3 bg-muted rounded-lg'>
          <div className='text-sm text-muted-foreground'>
            Showing {startItem}-{endItem} of {filteredCount} results
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
              {(() => {
                const pages = [];
                const maxVisiblePages = 5;

                if (totalPages <= maxVisiblePages) {
                  // Show all pages if total pages is 5 or less
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  // Show pages with ellipsis logic
                  const halfVisible = Math.floor(maxVisiblePages / 2);
                  let startPage = Math.max(1, currentPage - halfVisible);
                  const endPage = Math.min(
                    totalPages,
                    startPage + maxVisiblePages - 1
                  );

                  // Adjust start page if we're near the end
                  if (endPage - startPage < maxVisiblePages - 1) {
                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                  }

                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(i);
                  }
                }

                return pages.map(pageNum => (
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
                ));
              })()}
              {totalPages > 5 && currentPage < totalPages - 2 && (
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
      title='Mobs'
      description='View and manage mob configurations'
      adminView={adminView}
    >
      <div></div>
    </DualInterface>
  );
}
