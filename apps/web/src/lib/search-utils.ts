import { SearchFilters } from '../components/EnhancedSearch';

/**
 * Advanced search utility functions for filtering entities
 */

export interface Searchable {
  id: number;
  keywords?: string;
  shortDesc?: string;
  longDesc?: string;
  level?: number;
  type?: string;
  [key: string]: any;
}

/**
 * Apply advanced search filters to an array of entities
 */
export function applySearchFilters<T extends Searchable>(
  items: T[],
  filters: SearchFilters,
  customFieldMappings?: Record<string, (item: T) => any>
): T[] {
  return items.filter(item => {
    // Text search
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase().trim();

      // Support for quoted exact matches
      const isExactMatch =
        searchTerm.startsWith('"') && searchTerm.endsWith('"');
      const searchValue = isExactMatch ? searchTerm.slice(1, -1) : searchTerm;

      const searchFields = [
        item.keywords,
        item.shortDesc,
        item.longDesc,
        item.id?.toString(),
        item.type,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (isExactMatch) {
        if (!searchFields.includes(searchValue)) return false;
      } else {
        // Support for multiple search terms (AND logic)
        const terms = searchValue.split(' ').filter(term => term.length > 0);
        if (!terms.every(term => searchFields.includes(term))) return false;
      }
    }

    // Level range filter
    if (filters.levelMin !== undefined && item.level !== undefined) {
      if (item.level < filters.levelMin) return false;
    }
    if (filters.levelMax !== undefined && item.level !== undefined) {
      if (item.level > filters.levelMax) return false;
    }

    // Type filter
    if (filters.types && filters.types.length > 0 && item.type) {
      if (!filters.types.includes(item.type)) return false;
    }

    // Custom filters
    if (filters.customFilters && customFieldMappings) {
      for (const [key, value] of Object.entries(filters.customFilters)) {
        if (value === undefined || value === null || value === '') continue;

        const mapping = customFieldMappings[key];
        if (mapping) {
          const itemValue = mapping(item);

          // Boolean filter
          if (typeof value === 'boolean') {
            if (!!itemValue !== value) return false;
          }
          // String/number exact match
          else {
            if (itemValue !== value) return false;
          }
        }
      }
    }

    return true;
  });
}

/**
 * Get unique values from a field across all items (useful for generating filter options)
 */
export function getUniqueValues<T extends Record<string, any>>(
  items: T[],
  fieldPath: string
): string[] {
  const values = new Set<string>();

  items.forEach(item => {
    const value = getNestedValue(item, fieldPath);
    if (value !== undefined && value !== null && value !== '') {
      // Handle arrays
      if (Array.isArray(value)) {
        value.forEach(v => values.add(String(v)));
      } else {
        values.add(String(value));
      }
    }
  });

  return Array.from(values).sort();
}

/**
 * Get nested object value using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
}

/**
 * Generate search suggestions based on current input
 */
export function generateSearchSuggestions<T extends Searchable>(
  items: T[],
  currentTerm: string,
  maxSuggestions = 5
): string[] {
  if (!currentTerm || currentTerm.length < 2) return [];

  const term = currentTerm.toLowerCase();
  const suggestions = new Set<string>();

  items.forEach(item => {
    // Add matching keywords
    if (item.keywords) {
      item.keywords.split(' ').forEach(keyword => {
        if (keyword.toLowerCase().includes(term) && keyword.length > 2) {
          suggestions.add(keyword);
        }
      });
    }

    // Add matching short descriptions (first few words)
    if (item.shortDesc) {
      const words = item.shortDesc.split(' ').slice(0, 3);
      words.forEach(word => {
        if (word.toLowerCase().includes(term) && word.length > 2) {
          suggestions.add(word.toLowerCase());
        }
      });
    }
  });

  return Array.from(suggestions)
    .filter(suggestion => suggestion !== term)
    .slice(0, maxSuggestions)
    .sort();
}

/**
 * Create search presets for different entity types
 */
export const createMobPresets = () => [
  {
    id: 'aggressive-mobs',
    name: 'Aggressive Mobs',
    filters: { searchTerm: '', customFilters: { aggressive: true } },
  },
  {
    id: 'boss-mobs',
    name: 'Boss Level (80+)',
    filters: { searchTerm: '', levelMin: 80 },
  },
  {
    id: 'newbie-mobs',
    name: 'Newbie Friendly (1-10)',
    filters: { searchTerm: '', levelMin: 1, levelMax: 10 },
  },
];

export const createObjectPresets = () => [
  {
    id: 'weapons',
    name: 'Weapons',
    filters: { searchTerm: '', types: ['weapon'] },
  },
  {
    id: 'armor',
    name: 'Armor & Clothing',
    filters: { searchTerm: '', types: ['armor', 'clothing'] },
  },
  {
    id: 'valuable-items',
    name: 'Valuable Items (1000+ cost)',
    filters: { searchTerm: '', customFilters: { minCost: 1000 } },
  },
  {
    id: 'lightweight',
    name: 'Lightweight (≤5 lbs)',
    filters: { searchTerm: '', customFilters: { maxWeight: 5 } },
  },
];
