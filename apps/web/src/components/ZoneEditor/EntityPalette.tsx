'use client';

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { MobNode } from './MobNode';
import { ObjectNode } from './ObjectNode';

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
}

export interface Object {
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
}

interface EntityPaletteProps {
  mobs: Mob[];
  objects: Object[];
  onMobDragStart: (mob: Mob) => void;
  onObjectDragStart: (object: Object) => void;
  zoneId: number;
}

export const EntityPalette: React.FC<EntityPaletteProps> = ({
  mobs,
  objects,
  onMobDragStart,
  onObjectDragStart,
  zoneId,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'mobs' | 'objects'>('mobs');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');

  const filteredMobs = mobs.filter(mob => {
    const matchesSearch =
      mob.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mob.race?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mob.class?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty =
      !selectedDifficulty || mob.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const filteredObjects = objects.filter(obj => {
    const matchesSearch =
      obj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obj.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obj.material?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || obj.type === selectedType;
    return matchesSearch && matchesType;
  });

  const uniqueDifficulties = [
    ...new Set(mobs.map(mob => mob.difficulty).filter(Boolean)),
  ];
  const uniqueTypes = [...new Set(objects.map(obj => obj.type))];

  const handleDragStart = (
    e: React.DragEvent,
    entity: Mob | Object,
    type: 'mob' | 'object'
  ) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ entity, type })
    );
    e.dataTransfer.effectAllowed = 'copy';

    if (type === 'mob') {
      onMobDragStart(entity as Mob);
    } else {
      onObjectDragStart(entity as Object);
    }
  };

  return (
    <div className={`w-80 border-l flex flex-col h-full ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      {/* Header */}
      <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
          Entity Palette
        </h3>

        {/* Tabs */}
        <div className={`flex space-x-1 p-1 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <button
            onClick={() => setActiveTab('mobs')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'mobs'
                ? isDark ? 'bg-gray-600 text-blue-400 shadow-sm' : 'bg-white text-blue-700 shadow-sm'
                : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            👹 Mobs ({mobs.length})
          </button>
          <button
            onClick={() => setActiveTab('objects')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'objects'
                ? isDark ? 'bg-gray-600 text-blue-400 shadow-sm' : 'bg-white text-blue-700 shadow-sm'
                : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📦 Objects ({objects.length})
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={`p-4 border-b space-y-3 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        {/* Search */}
        <div>
          <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
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

        {/* Tab-specific filters */}
        {activeTab === 'mobs' && (
          <div>
            <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
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
              {uniqueDifficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>
                  {difficulty
                    ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
                    : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {activeTab === 'objects' && (
          <div>
            <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
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

      {/* Entity List */}
      <div className='flex-1 overflow-y-auto p-4'>
        <div className='space-y-3'>
          {activeTab === 'mobs' && (
            <>
              {filteredMobs.length === 0 ? (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <p className='text-sm'>No mobs found</p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className={`text-sm mt-1 ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
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
                    onDragStart={e => handleDragStart(e, mob, 'mob')}
                    className='cursor-grab active:cursor-grabbing'
                  >
                    <MobNode
                      data={mob}
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
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <p className='text-sm'>No objects found</p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className={`text-sm mt-1 ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
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
                    onDragStart={e => handleDragStart(e, obj, 'object')}
                    className='cursor-grab active:cursor-grabbing'
                  >
                    <ObjectNode
                      data={obj}
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

      {/* Footer */}
      <div className={`p-4 border-t ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <p className='mb-1'>
            💡 <strong>Tip:</strong> Drag entities onto room nodes to place them
          </p>
          <p className={isDark ? 'text-gray-500' : 'text-gray-500'}>
            Zone {zoneId} • {filteredMobs.length + filteredObjects.length}{' '}
            entities visible
          </p>
        </div>
      </div>
    </div>
  );
};
