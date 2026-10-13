'use client';

import { AbilityPicker } from '@/components/mob-ai/AbilityPicker';
import { Button } from '@/components/ui/button';
import { ColoredTextInline } from '@/components/ColoredTextViewer';
import {
  isChargedItemType,
  MAX_ITEM_SPELLS,
  moveRow,
  newRowKey,
  type SpellRow,
} from '@/lib/objectSpells';
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';

interface Props {
  type: string;
  rows: SpellRow[];
  onChange: (rows: SpellRow[]) => void;
  /** Level given to a newly added slot */
  defaultLevel: number;
  disabled?: boolean;
}

const NUMBER_INPUT =
  'w-20 rounded-md border border-input bg-background text-foreground px-2 py-1 text-sm';

/**
 * Ordered spell slots of a potion / scroll / wand / staff. The game fires the
 * slots top to bottom; the same spell may appear in several slots.
 */
export function ItemSpellsEditor({
  type,
  rows,
  onChange,
  defaultLevel,
  disabled = false,
}: Props) {
  const charged = isChargedItemType(type);
  const full = rows.length >= MAX_ITEM_SPELLS;
  const update = (index: number, patch: Partial<SpellRow>) =>
    onChange(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  return (
    <div className='space-y-3' data-testid='item-spells-editor'>
      <div>
        <h4 className='text-sm font-medium text-foreground'>Spells</h4>
        <p className='text-xs text-muted-foreground'>
          Cast in this order when the item is used. Add the same spell twice to
          cast it twice.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className='text-sm text-muted-foreground'>
          No spells yet: using this item does nothing.
        </p>
      ) : (
        <ol className='space-y-2'>
          {rows.map((row, index) => (
            <li
              key={row.key}
              className='flex flex-wrap items-center gap-2 rounded-md border border-border bg-background px-3 py-2'
            >
              <span className='w-5 text-xs text-muted-foreground'>
                {index + 1}.
              </span>
              <span className='min-w-0 flex-1 truncate text-sm text-foreground'>
                <ColoredTextInline markup={row.name} />
              </span>
              <label className='flex items-center gap-1 text-xs text-muted-foreground'>
                Level
                <input
                  type='number'
                  min={0}
                  max={1000}
                  aria-label={`Level of spell ${index + 1}`}
                  value={row.level}
                  disabled={disabled}
                  onChange={e =>
                    update(index, {
                      level: Math.min(
                        1000,
                        Math.max(0, Math.trunc(Number(e.target.value) || 0))
                      ),
                    })
                  }
                  className={NUMBER_INPUT}
                />
              </label>
              {charged && (
                <label className='flex items-center gap-1 text-xs text-muted-foreground'>
                  Charges
                  <input
                    type='number'
                    min={0}
                    max={10000}
                    aria-label={`Charges of spell ${index + 1}`}
                    value={row.charges ?? ''}
                    placeholder='unlimited'
                    disabled={disabled}
                    onChange={e =>
                      update(index, {
                        charges:
                          e.target.value === ''
                            ? null
                            : Math.min(
                                10000,
                                Math.max(0, Math.trunc(Number(e.target.value)))
                              ),
                      })
                    }
                    className={NUMBER_INPUT}
                  />
                </label>
              )}
              <Button
                type='button'
                variant='ghost'
                size='sm'
                aria-label={`Move spell ${index + 1} up`}
                disabled={disabled || index === 0}
                onClick={() => onChange(moveRow(rows, index, index - 1))}
              >
                <ArrowUp className='h-4 w-4' />
              </Button>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                aria-label={`Move spell ${index + 1} down`}
                disabled={disabled || index === rows.length - 1}
                onClick={() => onChange(moveRow(rows, index, index + 1))}
              >
                <ArrowDown className='h-4 w-4' />
              </Button>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                aria-label={`Remove spell ${index + 1}`}
                disabled={disabled}
                onClick={() => onChange(rows.filter((_, i) => i !== index))}
              >
                <Trash2 className='h-4 w-4 text-red-500' />
              </Button>
            </li>
          ))}
        </ol>
      )}

      {full ? (
        <p className='text-xs text-muted-foreground'>
          At most {MAX_ITEM_SPELLS} spells per item.
        </p>
      ) : (
        <div>
          <p className='mb-1 text-xs text-muted-foreground'>
            Search a spell and click it to add a slot.
          </p>
          <AbilityPicker
            value={null}
            hideSelected
            disabled={disabled}
            onChange={ability =>
              onChange([
                ...rows,
                {
                  key: newRowKey(),
                  abilityId: ability.id,
                  name: ability.name,
                  level: defaultLevel,
                  charges: null,
                },
              ])
            }
          />
        </div>
      )}
    </div>
  );
}
