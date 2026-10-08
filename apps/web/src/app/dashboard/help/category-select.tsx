'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * Radix Select forbids `<SelectItem value="">` (it throws while rendering,
 * which blew up the whole editor dialog). "No category" is therefore carried
 * by this sentinel and mapped to/from the form's empty string at the edge.
 */
export const NO_CATEGORY = '__none__';

export const DEFAULT_HELP_CATEGORIES = [
  'spell',
  'skill',
  'chant',
  'command',
  'class',
  'race',
  'area',
  'reference',
  'guide',
  'building',
] as const;

/** Union of the built-in categories, categories seen in the data, and the current value. */
export function categoryOptions(
  current: string,
  extra: readonly string[] = []
): string[] {
  const seen = new Set<string>(DEFAULT_HELP_CATEGORIES);
  const out: string[] = [...DEFAULT_HELP_CATEGORIES];
  for (const cat of [...extra, current]) {
    if (cat && !seen.has(cat)) {
      seen.add(cat);
      out.push(cat);
    }
  }
  return out;
}

function label(cat: string): string {
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

export function HelpCategorySelect({
  value,
  onChange,
  extraCategories,
}: {
  /** Form value; empty string means "no category". */
  value: string;
  onChange: (value: string) => void;
  extraCategories?: readonly string[];
}) {
  return (
    <Select
      value={value === '' ? NO_CATEGORY : value}
      onValueChange={v => onChange(v === NO_CATEGORY ? '' : v)}
    >
      <SelectTrigger>
        <SelectValue placeholder='Select category' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NO_CATEGORY}>None</SelectItem>
        {categoryOptions(value, extraCategories).map(cat => (
          <SelectItem key={cat} value={cat}>
            {label(cat)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
