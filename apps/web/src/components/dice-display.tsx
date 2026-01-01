'use client';

import { useState, useRef, useEffect } from 'react';

interface DiceDisplayProps {
  num: number;
  size: number;
  bonus: number;
  onNumChange: (value: number) => void;
  onSizeChange: (value: number) => void;
  onBonusChange: (value: number) => void;
  label?: string;
  helpText?: string;
  error?: string | undefined;
  className?: string;
}

/**
 * DiceDisplay - Shows dice in standard notation (e.g., "2d6+20")
 * Click to edit individual components
 */
export function DiceDisplay({
  num,
  size,
  bonus,
  onNumChange,
  onSizeChange,
  onBonusChange,
  label,
  helpText,
  error,
  className = '',
}: DiceDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Format dice notation
  const formatDice = () => {
    const sign = bonus >= 0 ? '+' : '';
    return `${num}d${size}${sign}${bonus}`;
  };

  // Calculate dice statistics
  const calculateStats = () => {
    const min = num + bonus;
    const max = num * size + bonus;
    const avg = Math.floor((num * (size + 1)) / 2 + bonus);
    return { min, max, avg };
  };

  const stats = calculateStats();

  // Close edit mode when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsEditing(false);
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isEditing]);

  return (
    <div className={className} ref={containerRef}>
      {label && (
        <label className='block text-sm font-medium text-card-foreground mb-1'>
          {label}
        </label>
      )}

      {!isEditing ? (
        /* Display Mode */
        <button
          type='button'
          onClick={() => setIsEditing(true)}
          className={`w-full px-3 py-2 rounded-md border bg-background hover:bg-muted/50 transition-colors ${
            error ? 'border-destructive' : 'border-input'
          }`}
        >
          <div className='flex items-center justify-between'>
            <span className='font-mono text-sm font-semibold'>
              {formatDice()}
            </span>
            <span className='text-xs text-muted-foreground'>
              avg: {stats.avg} ({stats.min}-{stats.max})
            </span>
          </div>
        </button>
      ) : (
        /* Edit Mode */
        <div className='grid grid-cols-5 gap-2 items-center'>
          <input
            type='text'
            inputMode='numeric'
            value={num}
            onChange={e => {
              const val = parseInt(e.target.value) || 0;
              onNumChange(val);
            }}
            className='col-span-1 px-2 py-1 text-center rounded-md border border-input bg-background text-sm'
            placeholder='#'
          />
          <span className='text-muted-foreground text-sm text-center'>d</span>
          <input
            type='text'
            inputMode='numeric'
            value={size}
            onChange={e => {
              const val = parseInt(e.target.value) || 0;
              onSizeChange(val);
            }}
            className='col-span-1 px-2 py-1 text-center rounded-md border border-input bg-background text-sm'
            placeholder='#'
          />
          <span className='text-muted-foreground text-sm text-center'>+</span>
          <input
            type='text'
            inputMode='numeric'
            value={bonus}
            onChange={e => {
              const val = parseInt(e.target.value) || 0;
              onBonusChange(val);
            }}
            className='col-span-1 px-2 py-1 text-center rounded-md border border-input bg-background text-sm'
            placeholder='#'
          />
        </div>
      )}

      {error && <p className='text-destructive text-xs mt-1'>{error}</p>}
      {helpText && !error && (
        <p className='text-xs text-muted-foreground mt-1'>{helpText}</p>
      )}
    </div>
  );
}
