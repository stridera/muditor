'use client';

import { ChevronDown, ChevronUp, Filter, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface SearchFilters {
  searchTerm: string;
  levelMin?: number;
  levelMax?: number;
  types?: string[];
  customFilters?: Record<string, any>;
}

export interface SearchPreset {
  id: string;
  name: string;
  filters: SearchFilters;
}

interface EnhancedSearchProps {
  onFiltersChange: (filters: SearchFilters) => void;
  placeholder?: string;
  availableTypes?: string[];
  showLevelFilter?: boolean;
  customFilterOptions?: {
    key: string;
    label: string;
    type: 'select' | 'range' | 'boolean';
    options?: Array<{ value: string; label: string }>;
  }[];
  presets?: SearchPreset[];
  className?: string;
}

export default function EnhancedSearch({
  onFiltersChange,
  placeholder = 'Search...',
  availableTypes = [],
  showLevelFilter = false,
  customFilterOptions = [],
  presets = [],
  className = '',
}: EnhancedSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    types: [],
    customFilters: {},
  });

  // Default search presets
  const defaultPresets: SearchPreset[] = [
    {
      id: 'high-level',
      name: 'High Level (50+)',
      filters: { searchTerm: '', levelMin: 50 },
    },
    {
      id: 'low-level',
      name: 'Low Level (1-20)',
      filters: { searchTerm: '', levelMin: 1, levelMax: 20 },
    },
    {
      id: 'mid-level',
      name: 'Mid Level (21-49)',
      filters: { searchTerm: '', levelMin: 21, levelMax: 49 },
    },
  ];

  const allPresets = [...defaultPresets, ...presets];

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const updateFilters = (updates: Partial<SearchFilters>) => {
    setFilters(prev => {
      const next: SearchFilters = { ...prev };
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined) {
          // Omit undefined keys entirely to satisfy exactOptionalPropertyTypes
          delete (next as any)[key];
        } else {
          (next as any)[key] = value;
        }
      }
      return next;
    });
  };

  const toggleType = (type: string) => {
    const currentTypes = filters.types || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    updateFilters({ types: newTypes });
  };

  const applyPreset = (preset: SearchPreset) => {
    setFilters(preset.filters);
    setIsExpanded(false);
  };

  const clearAllFilters = () => {
    setFilters({
      searchTerm: '',
      types: [],
      customFilters: {},
    });
  };

  const hasActiveFilters =
    filters.searchTerm ||
    (filters.types && filters.types.length > 0) ||
    filters.levelMin !== undefined ||
    filters.levelMax !== undefined ||
    Object.keys(filters.customFilters || {}).length > 0;

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Basic Search */}
      <div className='p-4'>
        <div className='flex gap-2'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='text'
              placeholder={placeholder}
              value={filters.searchTerm}
              onChange={e => updateFilters({ searchTerm: e.target.value })}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
              hasActiveFilters
                ? 'border-blue-500 text-blue-700 bg-blue-50'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            <Filter className='h-4 w-4 mr-1' />
            Filters
            {hasActiveFilters && (
              <span className='ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full'>
                {
                  [
                    filters.searchTerm && 'text',
                    filters.types?.length &&
                      `${filters.types.length} type${filters.types.length > 1 ? 's' : ''}`,
                    (filters.levelMin !== undefined ||
                      filters.levelMax !== undefined) &&
                      'level',
                    Object.keys(filters.customFilters || {}).length && 'custom',
                  ].filter(Boolean).length
                }
              </span>
            )}
            {isExpanded ? (
              <ChevronUp className='h-4 w-4 ml-1' />
            ) : (
              <ChevronDown className='h-4 w-4 ml-1' />
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className='inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-md text-sm'
            >
              <X className='h-4 w-4 mr-1' />
              Clear
            </button>
          )}
        </div>

        {/* Quick Presets */}
        {allPresets.length > 0 && (
          <div className='flex flex-wrap gap-2 mt-3'>
            <span className='text-xs text-gray-500 font-medium'>
              Quick filters:
            </span>
            {allPresets.map(preset => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className='text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors'
              >
                {preset.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className='border-t p-4 space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {/* Level Range Filter */}
            {showLevelFilter && (
              <div className='space-y-2'>
                <label className='block text-sm font-medium text-gray-700'>
                  Level Range
                </label>
                <div className='grid grid-cols-2 gap-2'>
                  <input
                    type='number'
                    placeholder='Min'
                    value={filters.levelMin ?? ''}
                    onChange={e => {
                      const raw = e.target.value;
                      if (raw === '') {
                        setFilters(prev => {
                          const { levelMin, ...rest } = prev;
                          return rest as SearchFilters;
                        });
                      } else {
                        updateFilters({ levelMin: parseInt(raw, 10) });
                      }
                    }}
                    className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
                  />
                  <input
                    type='number'
                    placeholder='Max'
                    value={filters.levelMax ?? ''}
                    onChange={e => {
                      const raw = e.target.value;
                      if (raw === '') {
                        setFilters(prev => {
                          const { levelMax, ...rest } = prev;
                          return rest as SearchFilters;
                        });
                      } else {
                        updateFilters({ levelMax: parseInt(raw, 10) });
                      }
                    }}
                    className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
                  />
                </div>
              </div>
            )}

            {/* Type Filter */}
            {availableTypes.length > 0 && (
              <div className='space-y-2'>
                <label className='block text-sm font-medium text-gray-700'>
                  Types ({filters.types?.length || 0} selected)
                </label>
                <div className='max-h-32 overflow-y-auto space-y-1 border border-gray-200 rounded-md p-2'>
                  {availableTypes.map(type => (
                    <label key={type} className='flex items-center text-sm'>
                      <input
                        type='checkbox'
                        checked={filters.types?.includes(type) || false}
                        onChange={() => toggleType(type)}
                        className='mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                      <span className='capitalize'>{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Filters */}
            {customFilterOptions.map(option => (
              <div key={option.key} className='space-y-2'>
                <label className='block text-sm font-medium text-gray-700'>
                  {option.label}
                </label>

                {option.type === 'select' && option.options && (
                  <select
                    value={filters.customFilters?.[option.key] || ''}
                    onChange={e =>
                      updateFilters({
                        customFilters: {
                          ...filters.customFilters,
                          [option.key]: e.target.value || undefined,
                        },
                      })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
                  >
                    <option value=''>All</option>
                    {option.options.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}

                {option.type === 'boolean' && (
                  <label className='flex items-center text-sm'>
                    <input
                      type='checkbox'
                      checked={filters.customFilters?.[option.key] || false}
                      onChange={e =>
                        updateFilters({
                          customFilters: {
                            ...filters.customFilters,
                            [option.key]: e.target.checked || undefined,
                          },
                        })
                      }
                      className='mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                    Enable {option.label}
                  </label>
                )}
              </div>
            ))}
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className='pt-2 border-t'>
              <div className='text-sm text-gray-600'>
                <span className='font-medium'>Active filters:</span>
                <div className='flex flex-wrap gap-1 mt-1'>
                  {filters.searchTerm && (
                    <span className='inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded'>
                      Text: "{filters.searchTerm}"
                    </span>
                  )}
                  {filters.types?.map(type => (
                    <span
                      key={type}
                      className='inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded'
                    >
                      {type}
                    </span>
                  ))}
                  {(filters.levelMin !== undefined ||
                    filters.levelMax !== undefined) && (
                    <span className='inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded'>
                      Level: {filters.levelMin || 0}-{filters.levelMax || '∞'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
