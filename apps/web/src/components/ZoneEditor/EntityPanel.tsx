'use client';

import { updateMob, updateObject } from '@/lib/entity-mutations';
import { useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react';
import type { EntityDetail } from './EntityDetailPanel';
import { MobNode } from './MobNode';
import { ObjectNode } from './ObjectNode';

// Reuse lightweight palette types
export interface Mob {
  id: number;
  name: string;
  level: number;
  race?: string;
  class?: string;
  mobClass?: string;
  hitpoints?: number;
  alignment?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'boss';
  roomId?: number;
  keywords?: string[];
  description?: string;
  examineDescription?: string;
  hpDice?: string;
  damageDice?: string;
  armorClass?: number;
  hitRoll?: number;
  gender?: string;
  size?: string;
  lifeForce?: string;
  composition?: string;
  strength?: number;
  intelligence?: number;
  wisdom?: number;
  dexterity?: number;
  constitution?: number;
  charisma?: number;
  perception?: number;
  concealment?: number;
  mobFlags?: string[];
  effectFlags?: string[];
  position?: string;
  stance?: string;
  equipment?: Array<{
    id: number;
    name: string;
    type: string;
    cost?: number;
    wearLocation?: string;
  }>;
  forceFullWidth?: boolean;
}

export interface GameObject {
  id: number;
  name: string;
  type: string;
  keywords?: string[];
  value?: number;
  weight?: number;
  level?: number;
  material?: string;
  condition?: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  roomId?: number;
  description?: string;
  examineDescription?: string;
  forceFullWidth?: boolean;
}

interface EntityPanelProps {
  mobs: Mob[];
  objects: GameObject[];
  zoneId: number;
  selectedEntity: EntityDetail | null;
  onSelectEntity: (detail: EntityDetail) => void;
  onClearSelection: () => void;
  onMobDragStart: (mob: Mob) => void;
  onObjectDragStart: (object: GameObject) => void;
  viewMode: 'edit' | 'view';
  panelWidth: number; // width provided by parent for responsive layout
}

export const EntityPanel: React.FC<EntityPanelProps> = ({
  mobs,
  objects,
  zoneId,
  selectedEntity,
  onSelectEntity,
  onClearSelection,
  onMobDragStart,
  onObjectDragStart,
  viewMode,
  panelWidth,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'mobs' | 'objects'>('mobs');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  // Editing state (unconditional to keep hook order stable)
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState<string>('');
  const [draftLevel, setDraftLevel] = useState<number | undefined>(undefined);
  const [draftDescription, setDraftDescription] = useState<string>('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // Keyboard shortcuts for detail view
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!selectedEntity) return; // Only active in detail view
      if (!editing) {
        // Start edit
        if (e.key.toLowerCase() === 'e') {
          e.preventDefault();
          setEditing(true);
          return;
        }
        // Back shortcuts to clear selection
        if (
          e.key === 'Escape' ||
          (e.altKey && e.key === 'ArrowLeft') ||
          (e.ctrlKey && e.key === '[')
        ) {
          e.preventDefault();
          guardedClearSelection();
          return;
        }
      } else {
        // Editing shortcuts
        if (e.key === 'Escape') {
          e.preventDefault();
          handleCancelEdit();
          return;
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          handleSave();
          return;
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedEntity, editing, draftName, draftLevel, draftDescription]);
  useEffect(() => {
    if (!selectedEntity) return;
    if (selectedEntity.kind === 'mob') {
      const mob = selectedEntity.data as Mob;
      setDraftName(mob.name || '');
      setDraftLevel(mob.level);
      setDraftDescription(mob.description || '');
    } else if (selectedEntity.kind === 'object') {
      const obj = selectedEntity.data as GameObject;
      setDraftName(obj.name || '');
      setDraftLevel(obj.level);
      setDraftDescription(obj.description || '');
    } else if (selectedEntity.kind === 'shop') {
      setDraftName(
        selectedEntity.keeper ? `${selectedEntity.keeper.name}'s Shop` : 'Shop'
      );
      setDraftLevel(undefined);
      setDraftDescription('');
    }
  }, [selectedEntity]);

  // LIST STATE ----------------------------------------------------------------
  if (!selectedEntity) {
    const isWide = panelWidth >= 520;
    const isMedium = panelWidth >= 400 && panelWidth < 520;
    const listLayoutClass = isWide
      ? 'grid grid-cols-2 gap-3'
      : isMedium
        ? 'grid grid-cols-1 gap-2'
        : 'space-y-3';
    const lowerSearch = searchTerm.toLowerCase();
    const filteredMobs = mobs.filter(mob => {
      const name = (mob.name || '').toLowerCase();
      const race = (mob.race || '').toLowerCase();
      const mobClass = (mob.class || mob.mobClass || '').toLowerCase();
      const matchesSearch =
        !lowerSearch ||
        name.includes(lowerSearch) ||
        race.includes(lowerSearch) ||
        mobClass.includes(lowerSearch);
      const matchesDifficulty =
        !selectedDifficulty || mob.difficulty === selectedDifficulty;
      return matchesSearch && matchesDifficulty;
    });

    const filteredObjects = objects.filter(obj => {
      const name = (obj.name || '').toLowerCase();
      const type = (obj.type || '').toLowerCase();
      const material = (obj.material || '').toLowerCase();
      const matchesSearch =
        !lowerSearch ||
        name.includes(lowerSearch) ||
        type.includes(lowerSearch) ||
        material.includes(lowerSearch);
      const matchesType = !selectedType || obj.type === selectedType;
      return matchesSearch && matchesType;
    });

    const uniqueDifficulties = [
      ...new Set(mobs.map(mob => mob.difficulty).filter(Boolean)),
    ];
    const uniqueTypes = [...new Set(objects.map(obj => obj.type))];

    const handleDragStart = (
      e: React.DragEvent,
      entity: Mob | GameObject,
      type: 'mob' | 'object'
    ) => {
      e.dataTransfer.setData(
        'application/json',
        JSON.stringify({ entity, type })
      );
      e.dataTransfer.effectAllowed = 'copy';
      if (type === 'mob') onMobDragStart(entity as Mob);
      else onObjectDragStart(entity as GameObject);
    };

    return (
      <div
        className={`w-full flex flex-col h-full ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
        style={{ minWidth: panelWidth, maxWidth: panelWidth }}
      >
        <div
          className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
        >
          <h3
            className={`text-lg font-semibold mb-3 ${
              isDark ? 'text-gray-100' : 'text-gray-900'
            }`}
          >
            Entities
          </h3>
          <div
            className={`flex space-x-1 p-1 rounded-lg ${
              isDark ? 'bg-gray-700' : 'bg-gray-100'
            }`}
          >
            <button
              onClick={() => setActiveTab('mobs')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'mobs'
                  ? isDark
                    ? 'bg-gray-600 text-blue-400 shadow-sm'
                    : 'bg-white text-blue-700 shadow-sm'
                  : isDark
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              👹 Mobs ({mobs.length})
            </button>
            <button
              onClick={() => setActiveTab('objects')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'objects'
                  ? isDark
                    ? 'bg-gray-600 text-blue-400 shadow-sm'
                    : 'bg-white text-blue-700 shadow-sm'
                  : isDark
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📦 Objects ({objects.length})
            </button>
          </div>
        </div>
        <div
          className={`p-4 border-b space-y-3 ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <div>
            <label
              className={`block text-xs font-medium mb-1 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Search
            </label>
            <input
              type='text'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                  : 'bg-white border-gray-300 focus:border-blue-500'
              }`}
            />
          </div>
          {activeTab === 'mobs' && (
            <div>
              <label
                className={`block text-xs font-medium mb-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Difficulty
              </label>
              <select
                value={selectedDifficulty}
                onChange={e => setSelectedDifficulty(e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-gray-100'
                    : 'bg-white border-gray-300'
                }`}
              >
                <option value=''>All difficulties</option>
                {uniqueDifficulties.map(d => (
                  <option key={d} value={d || ''}>
                    {d ? d.charAt(0).toUpperCase() + d.slice(1) : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
          {activeTab === 'objects' && (
            <div>
              <label
                className={`block text-xs font-medium mb-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Type
              </label>
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-gray-100'
                    : 'bg-white border-gray-300'
                }`}
              >
                <option value=''>All types</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className='flex-1 overflow-y-auto p-4'>
          <div className={listLayoutClass}>
            {activeTab === 'mobs' && (
              <>
                {filteredMobs.length === 0 ? (
                  <div
                    className={`text-center py-8 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    <p className='text-sm'>No mobs found</p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className={`text-sm mt-1 ${
                          isDark
                            ? 'text-blue-400 hover:text-blue-300'
                            : 'text-blue-600 hover:text-blue-800'
                        }`}
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                ) : (
                  filteredMobs.map(mob => (
                    <div
                      key={mob.id}
                      draggable
                      onClick={() => onSelectEntity({ kind: 'mob', data: mob })}
                      onDragStart={e => handleDragStart(e, mob, 'mob')}
                      className='cursor-pointer group'
                    >
                      <MobNode
                        data={{ ...mob, forceFullWidth: true }}
                        selected={false}
                        id={`mob-${mob.id}`}
                        type='mob'
                        dragging={false}
                        isConnectable={false}
                        zIndex={0}
                        xPos={0}
                        yPos={0}
                      />
                    </div>
                  ))
                )}
              </>
            )}
            {activeTab === 'objects' && (
              <>
                {filteredObjects.length === 0 ? (
                  <div
                    className={`text-center py-8 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    <p className='text-sm'>No objects found</p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className={`text-sm mt-1 ${
                          isDark
                            ? 'text-blue-400 hover:text-blue-300'
                            : 'text-blue-600 hover:text-blue-800'
                        }`}
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                ) : (
                  filteredObjects.map(obj => (
                    <div
                      key={obj.id}
                      draggable
                      onClick={() =>
                        onSelectEntity({ kind: 'object', data: obj })
                      }
                      onDragStart={e => handleDragStart(e, obj, 'object')}
                      className='cursor-pointer group'
                    >
                      <ObjectNode
                        data={{ ...obj, forceFullWidth: true }}
                        selected={false}
                        id={`object-${obj.id}`}
                        type='object'
                        dragging={false}
                        isConnectable={false}
                        zIndex={0}
                        xPos={0}
                        yPos={0}
                      />
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>
        <div
          className={`p-4 border-t ${
            isDark
              ? 'border-gray-700 bg-gray-750'
              : 'border-gray-200 bg-gray-50'
          }`}
        >
          <div
            className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
          >
            <p className='mb-1'>
              💡 <strong>Tip:</strong> Click an entity to inspect or drag onto a
              room.
            </p>
            <p className={isDark ? 'text-gray-500' : 'text-gray-500'}>
              Zone {zoneId} • {filteredMobs.length + filteredObjects.length}{' '}
              entities visible
            </p>
          </div>
        </div>
      </div>
    );
  }

  // DETAIL STATE --------------------------------------------------------------
  const entity = selectedEntity;
  const displayName =
    entity.kind === 'mob'
      ? (entity.data as Mob).name || `Mob ${(entity.data as Mob).id}`
      : entity.kind === 'object'
        ? (entity.data as GameObject).name ||
          `Object ${(entity.data as GameObject).id}`
        : entity.keeper
          ? `${entity.keeper.name}'s Shop`
          : `Shop ${entity.data.id}`;

  // Inline edit scaffold ------------------------------------------------------
  const dirty = (() => {
    if (!editing) return false;
    if (entity.kind === 'mob') {
      const mob = entity.data as Mob;
      return (
        draftName !== (mob.name || '') ||
        draftLevel !== mob.level ||
        draftDescription !== (mob.description || '')
      );
    }
    if (entity.kind === 'object') {
      const obj = entity.data as GameObject;
      return (
        draftName !== (obj.name || '') ||
        draftLevel !== obj.level ||
        draftDescription !== (obj.description || '')
      );
    }
    return false;
  })();

  const validate = () => {
    if (draftName.trim().length === 0) return 'Name cannot be empty';
    if (draftName.length > 80) return 'Name exceeds 80 characters';
    if (draftLevel !== undefined) {
      if (draftLevel < 0) return 'Level must be >= 0';
      if (draftLevel > 120) return 'Level too high';
    }
    if (draftDescription.length > 1000)
      return 'Description exceeds 1000 characters';
    return null;
  };

  const handleSave = async () => {
    if (!dirty) {
      setEditing(false);
      return;
    }
    const validationError = validate();
    if (validationError) {
      setSaveError(validationError);
      return;
    }
    setSaveError(null);
    setSaving(true);
    // For now: optimistic local update only. GraphQL mutation will be added later.
    try {
      if (entity.kind === 'mob') {
        const mob = entity.data as Mob;
        // Optimistic update first
        const optimistic: Mob = {
          ...mob,
          name: draftName,
          level: draftLevel ?? mob.level,
          description: draftDescription,
        };
        onSelectEntity({ ...entity, data: optimistic });
        const server = await updateMob({
          id: mob.id,
          zoneId,
          data: {
            name: draftName,
            level: draftLevel ?? mob.level,
            description: draftDescription,
          },
        });
        // Reconcile: ensure we keep any server canonical fields
        const reconciled: Mob = {
          ...optimistic,
          name: server.name,
          level: server.level,
          description: optimistic.description || '',
        } as Mob;
        onSelectEntity({ ...entity, data: reconciled });
      } else if (entity.kind === 'object') {
        const obj = entity.data as GameObject;
        const optimistic: GameObject = {
          ...obj,
          name: draftName,
          description: draftDescription,
          ...(draftLevel !== undefined ? { level: draftLevel } : {}),
        };
        onSelectEntity({ ...entity, data: optimistic });
        const server = await updateObject({
          id: obj.id,
          zoneId,
          data: {
            name: draftName,
            level: draftLevel !== undefined ? draftLevel : obj.level || 0,
            roomDescription: draftDescription,
          },
        });
        const reconciled: GameObject = {
          ...optimistic,
          name: server.name,
          level: server.level,
        } as GameObject;
        onSelectEntity({ ...entity, data: reconciled });
      }
      setEditing(false);
    } catch (err: any) {
      console.error('Failed to save entity:', err);
      setSaveError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (dirty && !window.confirm('Discard unsaved changes?')) return;
    setEditing(false);
    // Reset drafts to original
    if (entity.kind === 'mob') {
      const mob = entity.data as Mob;
      setDraftName(mob.name || '');
      setDraftLevel(mob.level);
      setDraftDescription(mob.description || '');
    } else if (entity.kind === 'object') {
      const obj = entity.data as GameObject;
      setDraftName(obj.name || '');
      setDraftLevel(obj.level);
      setDraftDescription(obj.description || '');
    }
  };

  const guardedClearSelection = () => {
    if (editing && dirty) {
      if (!window.confirm('You have unsaved changes. Leave anyway?')) return;
    }
    onClearSelection();
  };

  const isWideDetail = panelWidth >= 560;
  return (
    <div
      className={`w-full flex flex-col h-full ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
      style={{ minWidth: panelWidth, maxWidth: panelWidth }}
    >
      <div
        className={`px-4 py-4 border-b flex items-start gap-3 ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}
      >
        <button
          onClick={guardedClearSelection}
          title='Back (Esc, Alt+←, Ctrl+[)'
          className='px-2 py-1 text-xs rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
        >
          ← Back
        </button>
        <div className='flex-1 min-w-0'>
          {editing ? (
            <div className='space-y-2'>
              <input
                value={draftName}
                onChange={e => setDraftName(e.target.value)}
                placeholder='Name'
                autoFocus
                className={`w-full px-2 py-1 text-sm rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-gray-100'
                    : 'bg-white border-gray-300'
                }`}
              />
              {(entity.kind === 'mob' || entity.kind === 'object') && (
                <div className='flex items-center gap-2'>
                  <label className='text-[10px] opacity-70'>Level</label>
                  <input
                    type='number'
                    value={draftLevel ?? ''}
                    onChange={e =>
                      setDraftLevel(
                        e.target.value === ''
                          ? undefined
                          : Number(e.target.value)
                      )
                    }
                    className={`w-20 px-2 py-1 text-xs rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              )}
            </div>
          ) : (
            <h4 className='text-lg font-semibold truncate'>{displayName}</h4>
          )}
          <div className='text-[10px] opacity-70 flex flex-wrap gap-2 mt-1'>
            <span>ID: {entity.data.id}</span>
            <span>Kind: {entity.kind}</span>
            {entity.kind === 'mob' && (
              <span>
                Lvl {(entity.data as Mob).level} • {(entity.data as Mob).race}
              </span>
            )}
            {entity.kind === 'object' && (
              <span>Type {(entity.data as GameObject).type}</span>
            )}
            {entity.kind === 'shop' && (
              <span>
                Buy/Sell: {(entity.data as any).buyProfit}/
                {(entity.data as any).sellProfit}%
              </span>
            )}
          </div>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            title='Edit (E)'
            className='text-xs px-2 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-500'
          >
            Edit
          </button>
        )}
        {editing && (
          <div className='flex items-center gap-2'>
            <button
              onClick={handleCancelEdit}
              title='Cancel (Esc)'
              className='text-xs px-2 py-1 rounded-md bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600'
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !dirty || draftName.trim() === ''}
              title='Save (Ctrl+Enter)'
              className={`text-xs px-3 py-1 rounded-md ${
                saving
                  ? 'bg-blue-400 cursor-wait text-white'
                  : !dirty || draftName.trim() === ''
                    ? 'bg-blue-300 cursor-not-allowed opacity-60'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>
      <div
        className={`flex-1 overflow-y-auto px-4 py-3 text-xs space-y-6 ${isWideDetail ? 'grid grid-cols-2 gap-6 space-y-0' : ''}`}
      >
        {saveError && (
          <div className='col-span-2 text-red-600 dark:text-red-400 text-[11px] bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-2 py-1 rounded'>
            {saveError}
          </div>
        )}
        {/* Overview */}
        <section className={isWideDetail ? 'col-span-1' : ''}>
          <h5 className='font-semibold uppercase tracking-wide mb-2 text-[10px]'>
            Overview
          </h5>
          {entity.kind === 'mob' && (
            <>
              {editing ? (
                <textarea
                  value={draftDescription}
                  onChange={e => setDraftDescription(e.target.value)}
                  placeholder='Description'
                  rows={3}
                  className={`w-full mb-2 px-2 py-1 text-xs rounded border resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-gray-100'
                      : 'bg-white border-gray-300'
                  }`}
                />
              ) : (
                (entity.data as Mob).description && (
                  <div className='mb-2 whitespace-pre-wrap'>
                    {(entity.data as Mob).description}
                  </div>
                )
              )}
              {(entity.data as Mob).examineDescription && (
                <div className='italic opacity-80 whitespace-pre-wrap mb-2'>
                  {(entity.data as Mob).examineDescription}
                </div>
              )}
              {(entity.data as Mob).difficulty && (
                <div>Difficulty: {(entity.data as Mob).difficulty}</div>
              )}
              {(entity.data as Mob).alignment && (
                <div>Alignment: {(entity.data as Mob).alignment}</div>
              )}
              {(entity.data as Mob).gender || (entity.data as Mob).size ? (
                <div>
                  Profile: {(entity.data as Mob).gender}{' '}
                  {(entity.data as Mob).size}
                </div>
              ) : null}
              {(entity.data as Mob).lifeForce ||
              (entity.data as Mob).composition ? (
                <div>
                  Essence: {(entity.data as Mob).lifeForce} /{' '}
                  {(entity.data as Mob).composition}
                </div>
              ) : null}
              {(entity.data as Mob).keywords?.length ? (
                <div className='flex flex-wrap gap-1 mt-1'>
                  {(entity.data as Mob).keywords!.map(k => (
                    <span
                      key={k}
                      className='px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700'
                    >
                      {k}
                    </span>
                  ))}
                </div>
              ) : null}
            </>
          )}
          {entity.kind === 'object' && (
            <>
              {editing ? (
                <textarea
                  value={draftDescription}
                  onChange={e => setDraftDescription(e.target.value)}
                  placeholder='Description'
                  rows={3}
                  className={`w-full mb-2 px-2 py-1 text-xs rounded border resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-gray-100'
                      : 'bg-white border-gray-300'
                  }`}
                />
              ) : (
                (entity.data as GameObject).description && (
                  <div className='mb-2 whitespace-pre-wrap'>
                    {(entity.data as GameObject).description}
                  </div>
                )
              )}
              {(entity.data as GameObject).examineDescription && (
                <div className='italic opacity-80 whitespace-pre-wrap mb-2'>
                  {(entity.data as GameObject).examineDescription}
                </div>
              )}
              {(entity.data as GameObject).keywords?.length ? (
                <div className='flex flex-wrap gap-1 mt-1'>
                  {(entity.data as GameObject).keywords!.map(k => (
                    <span
                      key={k}
                      className='px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700'
                    >
                      {k}
                    </span>
                  ))}
                </div>
              ) : null}
            </>
          )}
          {entity.kind === 'shop' && (
            <div className='space-y-1'>
              {entity.keeper && (
                <div>
                  Keeper: {entity.keeper.name} (Lv {entity.keeper.level})
                </div>
              )}
              <div>Buy Profit: {(entity.data as any).buyProfit}%</div>
              <div>Sell Profit: {(entity.data as any).sellProfit}%</div>
            </div>
          )}
        </section>
        {/* Stats */}
        {entity.kind === 'mob' && (
          <section className={isWideDetail ? 'col-span-1' : ''}>
            <h5 className='font-semibold uppercase tracking-wide mb-2 text-[10px]'>
              Stats
            </h5>
            <div className='grid grid-cols-2 gap-2'>
              {(() => {
                const mob = entity.data as Mob;
                const keys: Array<keyof Mob> = [
                  'strength',
                  'intelligence',
                  'wisdom',
                  'dexterity',
                  'constitution',
                  'charisma',
                ];
                return keys.map(k =>
                  mob[k] !== undefined ? (
                    <div key={k as string} className='flex justify-between'>
                      <span className='capitalize'>{k}:</span>
                      <span>{mob[k] as number}</span>
                    </div>
                  ) : null
                );
              })()}
            </div>
            <div className='mt-2 space-y-1'>
              {(entity.data as Mob).perception !== undefined && (
                <div className='flex justify-between'>
                  <span>Perception:</span>
                  <span>{(entity.data as Mob).perception}</span>
                </div>
              )}
              {(entity.data as Mob).concealment !== undefined && (
                <div className='flex justify-between'>
                  <span>Concealment:</span>
                  <span>{(entity.data as Mob).concealment}</span>
                </div>
              )}
              {(entity.data as Mob).armorClass !== undefined && (
                <div className='flex justify-between'>
                  <span>Armor Class:</span>
                  <span>{(entity.data as Mob).armorClass}</span>
                </div>
              )}
              {(entity.data as Mob).hitRoll !== undefined && (
                <div className='flex justify-between'>
                  <span>Hit Roll:</span>
                  <span>{(entity.data as Mob).hitRoll}</span>
                </div>
              )}
            </div>
          </section>
        )}
        {/* Combat */}
        {entity.kind === 'mob' && (
          <section className={isWideDetail ? 'col-span-1' : ''}>
            <h5 className='font-semibold uppercase tracking-wide mb-2 text-[10px]'>
              Combat
            </h5>
            {(entity.data as Mob).hpDice && (
              <div className='flex justify-between'>
                <span>HP Dice:</span>
                <span>{(entity.data as Mob).hpDice}</span>
              </div>
            )}
            {(entity.data as Mob).damageDice && (
              <div className='flex justify-between'>
                <span>Damage Dice:</span>
                <span>{(entity.data as Mob).damageDice}</span>
              </div>
            )}
            {(entity.data as Mob).position && (
              <div className='flex justify-between'>
                <span>Position:</span>
                <span>{(entity.data as Mob).position}</span>
              </div>
            )}
            {(entity.data as Mob).stance && (
              <div className='flex justify-between'>
                <span>Stance:</span>
                <span>{(entity.data as Mob).stance}</span>
              </div>
            )}
          </section>
        )}
        {/* Equipment */}
        {entity.kind === 'mob' && (
          <section className={isWideDetail ? 'col-span-1' : ''}>
            <h5 className='font-semibold uppercase tracking-wide mb-2 text-[10px]'>
              Equipment
            </h5>
            {(entity.data as Mob).equipment?.length ? (
              <ul className='space-y-1'>
                {(entity.data as Mob).equipment!.map(eq => (
                  <li
                    key={eq.id}
                    className='flex justify-between border-b border-dashed pb-0.5'
                  >
                    <span className='truncate'>
                      {eq.name} <span className='opacity-60'>({eq.type})</span>
                    </span>
                    {eq.wearLocation && (
                      <span className='uppercase tracking-wide opacity-60'>
                        {eq.wearLocation}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className='opacity-60'>No equipment resets found.</div>
            )}
          </section>
        )}
        {/* Flags */}
        <section className={isWideDetail ? 'col-span-1' : ''}>
          <h5 className='font-semibold uppercase tracking-wide mb-2 text-[10px]'>
            Flags & Effects
          </h5>
          {entity.kind === 'mob' && (
            <>
              {(entity.data as Mob).mobFlags?.length ? (
                <div className='mb-2'>
                  <h6 className='font-medium text-[10px] mb-1'>Mob Flags</h6>
                  <div className='flex flex-wrap gap-1'>
                    {(entity.data as Mob).mobFlags!.map(f => (
                      <span
                        key={f}
                        className='px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900 dark:text-blue-200'
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {(entity.data as Mob).effectFlags?.length ? (
                <div>
                  <h6 className='font-medium text-[10px] mb-1'>Effect Flags</h6>
                  <div className='flex flex-wrap gap-1'>
                    {(entity.data as Mob).effectFlags!.map(f => (
                      <span
                        key={f}
                        className='px-1 py-0.5 rounded bg-purple-100 dark:bg-purple-900 dark:text-purple-200'
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          )}
          {entity.kind === 'object' && (
            <div className='opacity-60'>
              No flag data fetched for objects yet.
            </div>
          )}
          {entity.kind === 'shop' && (
            <div className='opacity-60'>Shop flags not implemented.</div>
          )}
        </section>
        {/* Raw JSON (edit mode only) */}
        {viewMode === 'edit' && (
          <section>
            <h5 className='font-semibold uppercase tracking-wide mb-2 text-[10px]'>
              Raw
            </h5>
            <pre
              className={`p-2 rounded-md overflow-x-auto text-[10px] ${
                isDark ? 'bg-gray-900 text-gray-200' : 'bg-gray-100'
              }`}
            >
              {JSON.stringify(entity, null, 2)}
            </pre>
          </section>
        )}
      </div>
      {viewMode === 'edit' && (
        <div
          className={`px-4 py-3 border-t flex items-center gap-2 ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <button
            onClick={guardedClearSelection}
            title='Close (Esc)'
            className='ml-auto text-xs px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};
