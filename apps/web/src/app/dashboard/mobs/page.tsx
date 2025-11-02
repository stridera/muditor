'use client';

import { PermissionGuard } from '@/components/auth/permission-guard';
import { DualInterface } from '@/components/dashboard/dual-interface';
import { useZone } from '@/contexts/zone-context';
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
import { useEffect, useState } from 'react';
import EnhancedSearch, {
  SearchFilters,
} from '../../../components/EnhancedSearch';
import ZoneSelector from '../../../components/ZoneSelector';
import {
  applySearchFilters,
  createMobPresets,
} from '../../../lib/search-utils';

interface Mob {
  id: number;
  keywords: string;
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

  const [mobs, setMobs] = useState<Mob[]>([]);
  const [mobsCount, setMobsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  // Redirect to mob editor if id parameter is provided
  useEffect(() => {
    if (idParam && zoneParam) {
      const mobId = parseInt(idParam);
      const zoneId = parseInt(zoneParam);
      if (!isNaN(mobId) && !isNaN(zoneId)) {
        router.push(`/dashboard/mobs/editor?zone=${zoneId}&id=${mobId}`);
      }
    }
  }, [idParam, zoneParam, router]);

  // Handle initial zone parameter from URL
  useEffect(() => {
    if (zoneParam && selectedZone === null) {
      const zoneId = parseInt(zoneParam);
      if (!isNaN(zoneId)) {
        setSelectedZone(zoneId);
      }
    }
  }, [zoneParam, selectedZone, setSelectedZone]);

  useEffect(() => {
    const fetchMobs = async () => {
      try {
        const query = selectedZone
          ? `
              query GetMobsByZone($zoneId: Int!) {
                mobsByZone(zoneId: $zoneId) {
                  id
                  keywords
                  name
                  roomDescription
                  examineDescription
                  hpDice
                  damageDice
                  level
                  race
                  hitRoll
                  armorClass
                  alignment
                  lifeForce
                  damageType
                  strength
                  intelligence
                  wisdom
                  dexterity
                  constitution
                  charisma
                  wealth
                  mobFlags
                  effectFlags
                  zoneId
                }
                mobsCount
              }
            `
          : `
              query GetMobs($skip: Int, $take: Int) {
                mobs(skip: $skip, take: $take) {
                  id
                  keywords
                  name
                  roomDescription
                  examineDescription
                  hpDice
                  damageDice
                  level
                  race
                  hitRoll
                  armorClass
                  alignment
                  lifeForce
                  damageType
                  strength
                  intelligence
                  wisdom
                  dexterity
                  constitution
                  charisma
                  wealth
                  mobFlags
                  effectFlags
                  zoneId
                }
                mobsCount
              }
            `;

        const skip = (currentPage - 1) * itemsPerPage;
        const variables = selectedZone
          ? {
              zoneId: selectedZone,
            }
          : {
              skip,
              take: itemsPerPage,
            };

        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, variables }),
        });

        const result = await response.json();
        if (result.errors) {
          // If pagination fails, fall back to basic query
          console.warn(
            'Pagination query failed, falling back to basic query:',
            result.errors[0].message
          );
          const fallbackQuery = selectedZone
            ? `query { mobsByZone(zoneId: ${selectedZone}) { id keywords name roomDescription examineDescription level race hitRoll armorClass alignment lifeForce damageType strength intelligence wisdom dexterity constitution charisma wealth hpDice damageDice mobFlags effectFlags zoneId } mobsCount }`
            : `query { mobs { id keywords name roomDescription examineDescription level race hitRoll armorClass alignment lifeForce damageType strength intelligence wisdom dexterity constitution charisma wealth hpDice damageDice mobFlags effectFlags zoneId } mobsCount }`;

          const fallbackResponse = await fetch(
            'http://localhost:4000/graphql',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query: fallbackQuery }),
            }
          );

          const fallbackResult = await fallbackResponse.json();
          if (fallbackResult.errors) {
            throw new Error(fallbackResult.errors[0].message);
          }

          const allMobs =
            fallbackResult.data.mobs || fallbackResult.data.mobsByZone || [];
          // Sort client-side as fallback
          allMobs.sort((a: Mob, b: Mob) => {
            const aVal = a[sortBy as keyof Mob] || 0;
            const bVal = b[sortBy as keyof Mob] || 0;
            return sortOrder === 'asc'
              ? aVal < bVal
                ? -1
                : 1
              : aVal > bVal
                ? -1
                : 1;
          });

          const offset = (currentPage - 1) * itemsPerPage;
          setMobs(allMobs.slice(offset, offset + itemsPerPage));
          setMobsCount(fallbackResult.data.mobsCount || allMobs.length);
          return;
        }

        if (selectedZone && result.data.mobsByZone) {
          // For zone-specific queries, apply client-side pagination and sorting
          const allMobs = result.data.mobsByZone;

          // Apply sorting
          allMobs.sort((a: Mob, b: Mob) => {
            const aVal = a[sortBy as keyof Mob] || 0;
            const bVal = b[sortBy as keyof Mob] || 0;
            return sortOrder === 'asc'
              ? aVal < bVal
                ? -1
                : 1
              : aVal > bVal
                ? -1
                : 1;
          });

          // Apply pagination
          const skip = (currentPage - 1) * itemsPerPage;
          const paginatedMobs = allMobs.slice(skip, skip + itemsPerPage);

          setMobs(paginatedMobs);
          setMobsCount(allMobs.length); // Use actual filtered count
        } else {
          // For general queries, use server response directly
          setMobs(result.data.mobs || []);
          setMobsCount(result.data.mobsCount || 0);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch mobs');
      } finally {
        setLoading(false);
      }
    };

    fetchMobs();
  }, [selectedZone, currentPage, itemsPerPage, sortBy, sortOrder]);

  // Apply advanced search filters
  const filteredMobs = applySearchFilters(mobs, searchFilters, {
    // Custom field mappings for mob-specific filters
    healthPoints: mob => (mob.level || 0) * 10, // Use level-based HP since dice are all 0
    isHighLevel: mob => (mob.level || 0) >= 50,
    isNewbie: mob => (mob.level || 0) <= 10,
  });

  // Calculate pagination
  const totalPages = Math.ceil(mobsCount / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, mobsCount);

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

      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: mutation,
          variables: { ids: Array.from(selectedMobs) },
        }),
      });

      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      // Remove deleted mobs from the list
      setMobs(mobs.filter(mob => !selectedMobs.has(mob.id)));
      setMobsCount(mobsCount - selectedMobs.size);
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

      const mobResponse = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: getMobQuery,
          variables: { id: mobId },
        }),
      });

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

      const createResponse = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: createMutation,
          variables: { data: cloneData },
        }),
      });

      const createResult = await createResponse.json();
      if (createResult.errors) {
        throw new Error(createResult.errors[0].message);
      }

      const newMob = createResult.data.createMob;

      // Add the new mob to the local state
      setMobs(prevMobs => [newMob, ...prevMobs]);
      setMobsCount(prevCount => prevCount + 1);

      // Show success message (could be replaced with a toast notification)
      alert(`Mob cloned successfully! New mob ID: ${newMob.id}`);
    } catch (err) {
      console.error('Error cloning mob:', err);
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

          const response = await fetch('http://localhost:4000/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: getMobQuery,
              variables: { id: mobId },
            }),
          });

          const result = await response.json();
          if (result.errors) {
            console.error(
              'Error loading mob details:',
              result.errors[0].message
            );
          } else if (result.data.mob) {
            // Update the mob in the list with detailed data
            setMobs(prevMobs =>
              prevMobs.map(m =>
                m.id === mobId ? { ...m, ...result.data.mob } : m
              )
            );
          }
        } catch (err) {
          console.error('Error loading mob details:', err);
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
  if (error)
    return (
      <div className='p-4 text-red-600' data-testid='error-message'>
        Error: {error}
      </div>
    );

  const adminView = (
    <div className='p-6'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            {selectedZone ? `Zone ${selectedZone} Mobs` : 'Mobs'}
          </h1>
          <p className='text-sm text-gray-500 mt-1'>
            Showing {startItem}-{endItem} of {mobsCount} mobs
            {selectedZone && ' in this zone'} (Page {currentPage} of{' '}
            {totalPages})
          </p>
        </div>
        <Link href='/dashboard/mobs/editor'>
          <button className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700'>
            <Plus className='w-4 h-4 mr-2' />
            Create New Mob
          </button>
        </Link>
      </div>

      {/* Zone Selector */}
      <div className='mb-4'>
        <ZoneSelector
          selectedZone={selectedZone}
          onZoneChange={setSelectedZone}
        />
      </div>

      {/* Sort and Items Per Page Controls */}
      <div className='flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg'>
        <div className='flex items-center gap-2'>
          <label className='text-sm font-medium text-gray-700'>Sort by:</label>
          <select
            value={sortBy}
            onChange={e => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className='border border-gray-300 rounded px-2 py-1 text-sm'
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
            className='p-1 hover:bg-gray-200 rounded'
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
          <label className='text-sm font-medium text-gray-700'>
            Items per page:
          </label>
          <select
            value={itemsPerPage}
            onChange={e => {
              setItemsPerPage(parseInt(e.target.value));
              setCurrentPage(1);
            }}
            className='border border-gray-300 rounded px-2 py-1 text-sm'
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
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <span className='text-blue-900 font-medium'>
                {selectedMobs.size} mob{selectedMobs.size !== 1 ? 's' : ''}{' '}
                selected
              </span>
              <div className='flex items-center gap-2'>
                <button
                  onClick={selectAllMobs}
                  className='text-blue-600 hover:text-blue-800 text-sm underline'
                  disabled={selectedMobs.size === filteredMobs.length}
                >
                  Select All ({filteredMobs.length})
                </button>
                <button
                  onClick={clearSelection}
                  className='text-blue-600 hover:text-blue-800 text-sm underline'
                >
                  Clear Selection
                </button>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={exportSelectedMobs}
                className='inline-flex items-center px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700'
              >
                <Download className='w-3 h-3 mr-1' />
                Export JSON
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className='inline-flex items-center px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50'
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
          <div className='text-gray-500 mb-4'>No mobs found</div>
          <Link href='/dashboard/mobs/editor'>
            <button className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'>
              Create Mob
            </button>
          </Link>
        </div>
      ) : (
        <div className='grid gap-4'>
          {filteredMobs.map(mob => (
            <div
              key={mob.id}
              className='bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer'
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
                    className='mt-1 text-gray-400 hover:text-blue-600'
                  >
                    {selectedMobs.has(mob.id) ? (
                      <CheckSquare className='w-5 h-5 text-blue-600' />
                    ) : (
                      <Square className='w-5 h-5' />
                    )}
                  </button>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      <h3 className='font-semibold text-lg text-gray-900'>
                        #{mob.id} - {mob.name}
                      </h3>
                      {/* Visual indicator for expand state */}
                      <div className='text-gray-400'>
                        {loadingDetails.has(mob.id) ? (
                          <div className='w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin' />
                        ) : expandedMobs.has(mob.id) ? (
                          <ChevronUp className='w-4 h-4' />
                        ) : (
                          <ChevronDown className='w-4 h-4' />
                        )}
                      </div>
                    </div>
                    <p className='text-sm text-gray-600 mb-2'>
                      Keywords: {mob.keywords}
                    </p>
                    <p className='text-gray-700 mb-2 line-clamp-2'>
                      {mob.roomDescription}
                    </p>
                    <div className='flex items-center gap-4 text-sm text-gray-500'>
                      <span>Level {mob.level}</span>
                      <span>HP: {mob.hpDice}</span>
                      <span>Zone {mob.zoneId}</span>
                    </div>

                    {/* Expanded Details */}
                    {expandedMobs.has(mob.id) && (
                      <div className='mt-4 pt-4 border-t border-gray-200'>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                          {/* Basic Info */}
                          <div>
                            <h4 className='font-semibold text-sm text-gray-700 mb-2'>
                              Basic Info
                            </h4>
                            <div className='space-y-1 text-sm'>
                              <div>
                                <span className='text-gray-500'>ID:</span>{' '}
                                {mob.id}
                              </div>
                              <div>
                                <span className='text-gray-500'>Class:</span>{' '}
                                {mob.mobClass || 'N/A'}
                              </div>
                              <div>
                                <span className='text-gray-500'>Race:</span>{' '}
                                {mob.race || 'N/A'}
                              </div>
                              <div>
                                <span className='text-gray-500'>
                                  Alignment:
                                </span>{' '}
                                {mob.alignment || 0}
                              </div>
                              <div>
                                <span className='text-gray-500'>
                                  Life Force:
                                </span>{' '}
                                {mob.lifeForce || 'N/A'}
                              </div>
                            </div>
                          </div>

                          {/* Combat Stats */}
                          <div>
                            <h4 className='font-semibold text-sm text-gray-700 mb-2'>
                              Combat Stats
                            </h4>
                            <div className='space-y-1 text-sm'>
                              <div>
                                <span className='text-gray-500'>HP:</span>{' '}
                                {mob.hpDice}
                              </div>
                              <div>
                                <span className='text-gray-500'>Damage:</span>{' '}
                                {mob.damageDice}
                              </div>
                              <div>
                                <span className='text-gray-500'>AC:</span>{' '}
                                {mob.armorClass || 0}
                              </div>
                              <div>
                                <span className='text-gray-500'>Hit Roll:</span>{' '}
                                {mob.hitRoll || 0}
                              </div>
                              <div>
                                <span className='text-gray-500'>
                                  Damage Type:
                                </span>{' '}
                                {mob.damageType || 'HIT'}
                              </div>
                            </div>
                          </div>

                          {/* Attributes */}
                          <div>
                            <h4 className='font-semibold text-sm text-gray-700 mb-2'>
                              Attributes
                            </h4>
                            <div className='grid grid-cols-2 gap-1 text-sm'>
                              <div>
                                <span className='text-gray-500'>STR:</span>{' '}
                                {mob.strength || 13}
                              </div>
                              <div>
                                <span className='text-gray-500'>INT:</span>{' '}
                                {mob.intelligence || 13}
                              </div>
                              <div>
                                <span className='text-gray-500'>WIS:</span>{' '}
                                {mob.wisdom || 13}
                              </div>
                              <div>
                                <span className='text-gray-500'>DEX:</span>{' '}
                                {mob.dexterity || 13}
                              </div>
                              <div>
                                <span className='text-gray-500'>CON:</span>{' '}
                                {mob.constitution || 13}
                              </div>
                              <div>
                                <span className='text-gray-500'>CHA:</span>{' '}
                                {mob.charisma || 13}
                              </div>
                            </div>
                          </div>

                          {/* Flags */}
                          {(mob.mobFlags?.length ||
                            mob.effectFlags?.length) && (
                            <div className='md:col-span-2'>
                              <h4 className='font-semibold text-sm text-gray-700 mb-2'>
                                Flags
                              </h4>
                              <div className='space-y-2'>
                                {mob.mobFlags && mob.mobFlags.length > 0 && (
                                  <div>
                                    <span className='text-xs text-gray-500 block'>
                                      Mob Flags:
                                    </span>
                                    <div className='flex flex-wrap gap-1'>
                                      {mob.mobFlags.map(
                                        (flag: string, index: number) => (
                                          <span
                                            key={index}
                                            className='inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded'
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
                                      <span className='text-xs text-gray-500 block'>
                                        Effect Flags:
                                      </span>
                                      <div className='flex flex-wrap gap-1'>
                                        {mob.effectFlags.map(
                                          (flag: string, index: number) => (
                                            <span
                                              key={index}
                                              className='inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded'
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
                          <div className='mt-4 pt-4 border-t border-gray-200'>
                            <h4 className='font-semibold text-sm text-gray-700 mb-2'>
                              Detailed Description
                            </h4>
                            <p className='text-sm text-gray-700'>
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
                    href={`/dashboard/mobs/editor?zone=${mob.zoneId}&id=${mob.id}`}
                  >
                    <button
                      onClick={e => e.stopPropagation()}
                      className='inline-flex items-center text-blue-600 hover:text-blue-800 px-3 py-1 text-sm'
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
                    className='inline-flex items-center text-green-600 hover:text-green-800 px-3 py-1 text-sm disabled:opacity-50'
                  >
                    <Copy className='w-3 h-3 mr-1' />
                    {cloningId === mob.id ? 'Cloning...' : 'Clone'}
                  </button>
                  <button
                    onClick={e => e.stopPropagation()}
                    className='inline-flex items-center text-red-600 hover:text-red-800 px-3 py-1 text-sm'
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
        <div className='flex items-center justify-between mt-6 px-4 py-3 bg-gray-50 rounded-lg'>
          <div className='text-sm text-gray-500'>
            Showing {startItem}-{endItem} of {mobsCount} results
          </div>
          <div className='flex items-center gap-2'>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className='inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
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
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
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
                    className='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md'
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
              className='inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
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
