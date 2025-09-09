'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useZone } from '@/contexts/zone-context';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { DualInterface } from '@/components/dashboard/dual-interface';
import {
  Plus,
  Edit,
  Trash2,
  CheckSquare,
  Square,
  Download,
  Copy,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Eye,
} from 'lucide-react';
import ZoneSelector from '../../../components/ZoneSelector';
import EnhancedSearch, {
  SearchFilters,
} from '../../../components/EnhancedSearch';
import {
  applySearchFilters,
  createMobPresets,
} from '../../../lib/search-utils';

interface Mob {
  id: number;
  keywords: string;
  shortDesc: string;
  longDesc: string;
  detailedDesc?: string;
  level: number;
  alignment?: number;
  hpDiceNum: number;
  hpDiceSize: number;
  hpDiceBonus: number;
  manaDiceNum?: number;
  manaDiceSize?: number;
  manaDiceBonus?: number;
  damDiceNum?: number;
  damDiceSize?: number;
  damDiceBonus?: number;
  mobClass?: string;
  race?: string;
  lifeForce?: string;
  mobType?: string;
  aiPackage?: string;
  spec?: string;
  damageType?: string;
  height?: number;
  weight?: number;
  pos?: string;
  defpos?: string;
  bareHandDamage?: number;
  hitroll?: number;
  armorClass?: number;
  str?: number;
  intel?: number;
  wis?: number;
  dex?: number;
  con?: number;
  cha?: number;
  luck?: number;
  maxAge?: number;
  raceAlign?: number;
  mobflags?: string[];
  affflags?: string[];
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
  const zoneParam = searchParams.get('zone');
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
              query GetMobsByZone($zoneId: Int!, $offset: Int, $limit: Int, $orderBy: String, $orderDirection: String) {
                mobsByZone(zoneId: $zoneId, offset: $offset, limit: $limit, orderBy: $orderBy, orderDirection: $orderDirection) {
                  id
                  keywords
                  shortDesc
                  longDesc
                  hpDiceNum
                  hpDiceSize
                  hpDiceBonus
                  level
                  zoneId
                }
                mobsCount(zoneId: $zoneId)
              }
            `
          : `
              query GetMobs($offset: Int, $limit: Int, $orderBy: String, $orderDirection: String) {
                mobs(offset: $offset, limit: $limit, orderBy: $orderBy, orderDirection: $orderDirection) {
                  id
                  keywords
                  shortDesc
                  longDesc
                  hpDiceNum
                  hpDiceSize
                  hpDiceBonus
                  level
                  zoneId
                }
                mobsCount
              }
            `;

        const offset = (currentPage - 1) * itemsPerPage;
        const variables = selectedZone
          ? {
              zoneId: selectedZone,
              offset,
              limit: itemsPerPage,
              orderBy: sortBy,
              orderDirection: sortOrder,
            }
          : {
              offset,
              limit: itemsPerPage,
              orderBy: sortBy,
              orderDirection: sortOrder,
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
            ? `query { mobsByZone(zoneId: ${selectedZone}) { id keywords shortDesc longDesc hpDiceNum hpDiceSize hpDiceBonus level zoneId } mobsCount }`
            : `query { mobs { id keywords shortDesc longDesc hpDiceNum hpDiceSize hpDiceBonus level zoneId } mobsCount }`;

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

          setMobs(allMobs.slice(offset, offset + itemsPerPage));
          setMobsCount(fallbackResult.data.mobsCount || allMobs.length);
          return;
        }

        setMobs(result.data.mobs || result.data.mobsByZone || []);
        setMobsCount(result.data.mobsCount || 0);
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
    healthPoints: mob => mob.level * 10, // Use level-based HP since dice are all 0
    isHighLevel: mob => mob.level >= 50,
    isNewbie: mob => mob.level <= 10,
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
            shortDesc
            longDesc
            detailedDesc
            level
            alignment
            hpDiceNum
            hpDiceSize
            hpDiceBonus
            manaDiceNum
            manaDiceSize
            manaDiceBonus
            damDiceNum
            damDiceSize
            damDiceBonus
            mobClass
            race
            lifeForce
            mobType
            aiPackage
            spec
            damageType
            height
            weight
            pos
            defpos
            bareHandDamage
            hitroll
            armorClass
            str
            intel
            wis
            dex
            con
            cha
            luck
            maxAge
            raceAlign
            mobflags
            affflags
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

      // Create clone data (remove id and modify shortDesc)
      const cloneData = {
        keywords: originalMob.keywords,
        shortDesc: `${originalMob.shortDesc} (Copy)`,
        longDesc: originalMob.longDesc,
        detailedDesc: originalMob.detailedDesc,
        level: originalMob.level,
        alignment: originalMob.alignment,
        hpDiceNum: originalMob.hpDiceNum,
        hpDiceSize: originalMob.hpDiceSize,
        hpDiceBonus: originalMob.hpDiceBonus,
        manaDiceNum: originalMob.manaDiceNum,
        manaDiceSize: originalMob.manaDiceSize,
        manaDiceBonus: originalMob.manaDiceBonus,
        damDiceNum: originalMob.damDiceNum,
        damDiceSize: originalMob.damDiceSize,
        damDiceBonus: originalMob.damDiceBonus,
        mobClass: originalMob.mobClass,
        race: originalMob.race,
        lifeForce: originalMob.lifeForce,
        mobType: originalMob.mobType,
        aiPackage: originalMob.aiPackage,
        spec: originalMob.spec,
        damageType: originalMob.damageType,
        height: originalMob.height,
        weight: originalMob.weight,
        pos: originalMob.pos,
        defpos: originalMob.defpos,
        bareHandDamage: originalMob.bareHandDamage,
        hitroll: originalMob.hitroll,
        armorClass: originalMob.armorClass,
        str: originalMob.str,
        intel: originalMob.intel,
        wis: originalMob.wis,
        dex: originalMob.dex,
        con: originalMob.con,
        cha: originalMob.cha,
        luck: originalMob.luck,
        maxAge: originalMob.maxAge,
        raceAlign: originalMob.raceAlign,
        mobflags: originalMob.mobflags,
        affflags: originalMob.affflags,
        zoneId: originalMob.zoneId,
      };

      // Create the cloned mob
      const createMutation = `
        mutation CreateMob($data: CreateMobInput!) {
          createMob(data: $data) {
            id
            keywords
            shortDesc
            longDesc
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
      if (mob && !mob.detailedDesc) {
        setLoadingDetails(new Set(loadingDetails).add(mobId));
        try {
          const getMobQuery = `
            query GetMob($id: Int!) {
              mob(id: $id) {
                id
                keywords
                shortDesc
                longDesc
                detailedDesc
                level
                alignment
                hpDiceNum
                hpDiceSize
                hpDiceBonus
                manaDiceNum
                manaDiceSize
                manaDiceBonus
                damDiceNum
                damDiceSize
                damDiceBonus
                mobClass
                race
                lifeForce
                mobType
                aiPackage
                spec
                damageType
                height
                weight
                pos
                defpos
                bareHandDamage
                hitroll
                armorClass
                str
                intel
                wis
                dex
                con
                cha
                luck
                maxAge
                raceAlign
                mobflags
                affflags
                zoneId
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

  const formatDice = (num: number, size: number, bonus: number) => {
    if (num === 0 && size === 0 && bonus === 0) return '0';
    return `${num}d${size}${bonus >= 0 ? '+' : ''}${bonus}`;
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
            <option value='shortDesc'>Name</option>
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
              className='bg-white border rounded-lg p-4 hover:shadow-md transition-shadow'
            >
              <div className='flex items-start justify-between'>
                {/* Checkbox for selection */}
                <div className='flex items-start gap-3'>
                  <button
                    onClick={() => toggleMobSelection(mob.id)}
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
                        {mob.shortDesc}
                      </h3>
                      <button
                        onClick={() => toggleMobExpanded(mob.id)}
                        className='text-gray-400 hover:text-blue-600 p-1'
                        disabled={loadingDetails.has(mob.id)}
                      >
                        {loadingDetails.has(mob.id) ? (
                          <div className='w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin' />
                        ) : expandedMobs.has(mob.id) ? (
                          <ChevronUp className='w-4 h-4' />
                        ) : (
                          <ChevronDown className='w-4 h-4' />
                        )}
                      </button>
                    </div>
                    <p className='text-sm text-gray-600 mb-2'>
                      Keywords: {mob.keywords}
                    </p>
                    <p className='text-gray-700 mb-2 line-clamp-2'>
                      {mob.longDesc}
                    </p>
                    <div className='flex items-center gap-4 text-sm text-gray-500'>
                      <span>Level {mob.level}</span>
                      <span>
                        HP:{' '}
                        {formatDice(
                          mob.hpDiceNum,
                          mob.hpDiceSize,
                          mob.hpDiceBonus
                        )}
                      </span>
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
                                {formatDice(
                                  mob.hpDiceNum,
                                  mob.hpDiceSize,
                                  mob.hpDiceBonus
                                )}
                              </div>
                              <div>
                                <span className='text-gray-500'>Mana:</span>{' '}
                                {formatDice(
                                  mob.manaDiceNum || 0,
                                  mob.manaDiceSize || 0,
                                  mob.manaDiceBonus || 0
                                )}
                              </div>
                              <div>
                                <span className='text-gray-500'>Damage:</span>{' '}
                                {formatDice(
                                  mob.damDiceNum || 0,
                                  mob.damDiceSize || 0,
                                  mob.damDiceBonus || 0
                                )}
                              </div>
                              <div>
                                <span className='text-gray-500'>AC:</span>{' '}
                                {mob.armorClass || 0}
                              </div>
                              <div>
                                <span className='text-gray-500'>Hitroll:</span>{' '}
                                {mob.hitroll || 0}
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
                                {mob.str || 13}
                              </div>
                              <div>
                                <span className='text-gray-500'>INT:</span>{' '}
                                {mob.intel || 13}
                              </div>
                              <div>
                                <span className='text-gray-500'>WIS:</span>{' '}
                                {mob.wis || 13}
                              </div>
                              <div>
                                <span className='text-gray-500'>DEX:</span>{' '}
                                {mob.dex || 13}
                              </div>
                              <div>
                                <span className='text-gray-500'>CON:</span>{' '}
                                {mob.con || 13}
                              </div>
                              <div>
                                <span className='text-gray-500'>CHA:</span>{' '}
                                {mob.cha || 13}
                              </div>
                            </div>
                          </div>

                          {/* Physical */}
                          {(mob.height || mob.weight) && (
                            <div>
                              <h4 className='font-semibold text-sm text-gray-700 mb-2'>
                                Physical
                              </h4>
                              <div className='space-y-1 text-sm'>
                                {mob.height && (
                                  <div>
                                    <span className='text-gray-500'>
                                      Height:
                                    </span>{' '}
                                    {mob.height}
                                  </div>
                                )}
                                {mob.weight && (
                                  <div>
                                    <span className='text-gray-500'>
                                      Weight:
                                    </span>{' '}
                                    {mob.weight}
                                  </div>
                                )}
                                {mob.pos && (
                                  <div>
                                    <span className='text-gray-500'>
                                      Position:
                                    </span>{' '}
                                    {mob.pos}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Flags */}
                          {(mob.mobflags?.length || mob.affflags?.length) && (
                            <div className='md:col-span-2'>
                              <h4 className='font-semibold text-sm text-gray-700 mb-2'>
                                Flags
                              </h4>
                              <div className='space-y-2'>
                                {mob.mobflags && mob.mobflags.length > 0 && (
                                  <div>
                                    <span className='text-xs text-gray-500 block'>
                                      Mob Flags:
                                    </span>
                                    <div className='flex flex-wrap gap-1'>
                                      {mob.mobflags.map((flag, index) => (
                                        <span
                                          key={index}
                                          className='inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded'
                                        >
                                          {flag}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {mob.affflags && mob.affflags.length > 0 && (
                                  <div>
                                    <span className='text-xs text-gray-500 block'>
                                      Effect Flags:
                                    </span>
                                    <div className='flex flex-wrap gap-1'>
                                      {mob.affflags.map((flag, index) => (
                                        <span
                                          key={index}
                                          className='inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded'
                                        >
                                          {flag}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Detailed Description */}
                        {mob.detailedDesc && (
                          <div className='mt-4 pt-4 border-t border-gray-200'>
                            <h4 className='font-semibold text-sm text-gray-700 mb-2'>
                              Detailed Description
                            </h4>
                            <p className='text-sm text-gray-700'>
                              {mob.detailedDesc}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className='flex items-center gap-2 ml-4'>
                  <button
                    onClick={() => toggleMobExpanded(mob.id)}
                    className='inline-flex items-center text-purple-600 hover:text-purple-800 px-3 py-1 text-sm'
                    disabled={loadingDetails.has(mob.id)}
                  >
                    <Eye className='w-3 h-3 mr-1' />
                    {expandedMobs.has(mob.id) ? 'Collapse' : 'Expand'}
                  </button>
                  <Link href={`/dashboard/mobs/editor?id=${mob.id}`}>
                    <button className='inline-flex items-center text-blue-600 hover:text-blue-800 px-3 py-1 text-sm'>
                      <Edit className='w-3 h-3 mr-1' />
                      Edit
                    </button>
                  </Link>
                  <button
                    onClick={() => handleCloneMob(mob.id)}
                    disabled={cloningId === mob.id}
                    className='inline-flex items-center text-green-600 hover:text-green-800 px-3 py-1 text-sm disabled:opacity-50'
                  >
                    <Copy className='w-3 h-3 mr-1' />
                    {cloningId === mob.id ? 'Cloning...' : 'Clone'}
                  </button>
                  <button className='inline-flex items-center text-red-600 hover:text-red-800 px-3 py-1 text-sm'>
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
