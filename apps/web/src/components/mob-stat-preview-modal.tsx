'use client';

import { Check, X } from 'lucide-react';
import { useState } from 'react';

interface StatComparison {
  field: string;
  label: string;
  current: number | string;
  generated: number | string;
  category: 'offensive' | 'defensive' | 'health' | 'resistance';
  isDice?: boolean;
}

interface MobStatPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (selectedFields: string[]) => void;
  comparisons: StatComparison[];
}

export function MobStatPreviewModal({
  isOpen,
  onClose,
  onApply,
  comparisons,
}: MobStatPreviewModalProps) {
  const [selectedFields, setSelectedFields] = useState<Set<string>>(
    new Set(comparisons.map(c => c.field))
  );

  if (!isOpen) return null;

  // Parse dice notation to calculate stats
  const parseDiceStats = (diceStr: string) => {
    const match = String(diceStr).match(/(\d+)d(\d+)([+-]\d+)?/);
    if (!match || !match[1] || !match[2]) return null;
    const num = parseInt(match[1]);
    const size = parseInt(match[2]);
    const bonus = match[3] ? parseInt(match[3]) : 0;
    const min = num + bonus;
    const max = num * size + bonus;
    const avg = Math.floor((num * (size + 1)) / 2 + bonus);
    return { min, max, avg };
  };

  const toggleField = (field: string) => {
    const newSelected = new Set(selectedFields);
    if (newSelected.has(field)) {
      newSelected.delete(field);
    } else {
      newSelected.add(field);
    }
    setSelectedFields(newSelected);
  };

  const selectAll = () => {
    setSelectedFields(new Set(comparisons.map(c => c.field)));
  };

  const deselectAll = () => {
    setSelectedFields(new Set());
  };

  const handleApply = () => {
    onApply(Array.from(selectedFields));
    onClose();
  };

  const categorizedStats = {
    offensive: comparisons.filter(c => c.category === 'offensive'),
    defensive: comparisons.filter(c => c.category === 'defensive'),
    health: comparisons.filter(c => c.category === 'health'),
    resistance: comparisons.filter(c => c.category === 'resistance'),
  };

  const categoryLabels = {
    offensive: 'Offensive Stats',
    defensive: 'Defensive Stats',
    health: 'Health & Damage',
    resistance: 'Elemental Resistances',
  };

  const changedCount = comparisons.filter(
    c => c.current !== c.generated && selectedFields.has(c.field)
  ).length;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black/50 transition-opacity'
        onClick={onClose}
      />

      {/* Modal */}
      <div className='flex min-h-full items-center justify-center p-4'>
        <div className='relative bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col'>
          {/* Header */}
          <div className='flex items-center justify-between p-6 border-b border-border'>
            <div>
              <h2 className='text-xl font-semibold text-card-foreground'>
                Preview Generated Stats
              </h2>
              <p className='text-sm text-muted-foreground mt-1'>
                Review and select which stats to apply. {changedCount} stat
                {changedCount !== 1 ? 's' : ''} will be updated.
              </p>
            </div>
            <button
              onClick={onClose}
              className='text-muted-foreground hover:text-foreground transition-colors'
            >
              <X className='w-5 h-5' />
            </button>
          </div>

          {/* Content */}
          <div className='flex-1 overflow-y-auto p-6 space-y-6'>
            {/* Select All/None */}
            <div className='flex gap-2'>
              <button
                onClick={selectAll}
                className='text-xs px-3 py-1 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors'
              >
                Select All
              </button>
              <button
                onClick={deselectAll}
                className='text-xs px-3 py-1 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors'
              >
                Deselect All
              </button>
            </div>

            {/* Categories */}
            {(
              Object.entries(categorizedStats) as Array<
                [keyof typeof categorizedStats, StatComparison[]]
              >
            ).map(([category, stats]) => {
              if (stats.length === 0) return null;

              return (
                <div key={category} className='space-y-2'>
                  <h3 className='text-sm font-medium text-card-foreground'>
                    {categoryLabels[category]}
                  </h3>
                  <div className='bg-muted/30 rounded-lg p-4 space-y-2'>
                    {stats.map(stat => {
                      const isChanged = stat.current !== stat.generated;
                      const isSelected = selectedFields.has(stat.field);

                      return (
                        <div
                          key={stat.field}
                          className={`flex items-center justify-between p-3 rounded-md transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-accent/20 hover:bg-accent/30'
                              : 'bg-background hover:bg-muted/50'
                          }`}
                          onClick={() => toggleField(stat.field)}
                        >
                          <div className='flex items-center gap-3 flex-1'>
                            {/* Checkbox */}
                            <div
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                                isSelected
                                  ? 'bg-primary border-primary'
                                  : 'border-input'
                              }`}
                            >
                              {isSelected && (
                                <Check className='w-3 h-3 text-primary-foreground' />
                              )}
                            </div>

                            {/* Label */}
                            <span className='text-sm font-medium text-card-foreground min-w-[180px]'>
                              {stat.label}
                            </span>

                            {/* Current Value */}
                            <div className='flex flex-col gap-0.5 min-w-[140px]'>
                              <div className='flex items-center gap-2'>
                                <span className='text-xs text-muted-foreground'>
                                  Current:
                                </span>
                                <span className='text-sm font-mono text-card-foreground font-semibold'>
                                  {stat.current}
                                </span>
                              </div>
                              {stat.isDice &&
                                parseDiceStats(String(stat.current)) && (
                                  <span className='text-xs text-muted-foreground ml-12'>
                                    avg:{' '}
                                    {parseDiceStats(String(stat.current))!.avg}{' '}
                                    ({parseDiceStats(String(stat.current))!.min}
                                    -{parseDiceStats(String(stat.current))!.max}
                                    )
                                  </span>
                                )}
                            </div>

                            {/* Arrow */}
                            {isChanged && (
                              <span className='text-muted-foreground'>→</span>
                            )}

                            {/* Generated Value */}
                            <div className='flex flex-col gap-0.5 min-w-[140px]'>
                              <div className='flex items-center gap-2'>
                                <span className='text-xs text-muted-foreground'>
                                  {isChanged ? 'New:' : 'Same:'}
                                </span>
                                <span
                                  className={`text-sm font-mono font-semibold ${
                                    isChanged
                                      ? 'text-accent-foreground'
                                      : 'text-muted-foreground'
                                  }`}
                                >
                                  {stat.generated}
                                </span>
                              </div>
                              {stat.isDice &&
                                parseDiceStats(String(stat.generated)) && (
                                  <span className='text-xs text-muted-foreground ml-8'>
                                    avg:{' '}
                                    {
                                      parseDiceStats(String(stat.generated))!
                                        .avg
                                    }{' '}
                                    (
                                    {
                                      parseDiceStats(String(stat.generated))!
                                        .min
                                    }
                                    -
                                    {
                                      parseDiceStats(String(stat.generated))!
                                        .max
                                    }
                                    )
                                  </span>
                                )}
                            </div>

                            {/* Change indicator */}
                            {!isChanged && (
                              <span className='text-xs text-muted-foreground italic'>
                                (no change)
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className='flex items-center justify-between p-6 border-t border-border'>
            <p className='text-sm text-muted-foreground'>
              {selectedFields.size} stat{selectedFields.size !== 1 ? 's' : ''}{' '}
              selected
            </p>
            <div className='flex gap-3'>
              <button
                onClick={onClose}
                className='px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={selectedFields.size === 0}
                className='px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                Apply {selectedFields.size > 0 && `(${selectedFields.size})`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
