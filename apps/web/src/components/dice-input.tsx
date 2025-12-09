'use client';

import { useEffect, useState } from 'react';

interface DiceInputProps {
  label: string;
  num: number;
  size: number;
  bonus: number;
  onNumChange: (value: number) => void;
  onSizeChange: (value: number) => void;
  onBonusChange: (value: number) => void;
  numError?: string;
  sizeError?: string;
  minNum?: number;
  minSize?: number;
  helpText?: string;
}

/**
 * DiceInput - Reusable component for entering dice notation (XdY+Z)
 *
 * Features:
 * - Three separate inputs for number, size, and bonus
 * - Real-time dice notation display (e.g., "3d8+5")
 * - Average calculation display
 * - Validation support
 * - Accessibility labels
 */
export function DiceInput({
  label,
  num,
  size,
  bonus,
  onNumChange,
  onSizeChange,
  onBonusChange,
  numError,
  sizeError,
  minNum = 0,
  minSize = 0,
  helpText,
}: DiceInputProps) {
  const [displayNotation, setDisplayNotation] = useState('');
  const [displayAverage, setDisplayAverage] = useState(0);

  useEffect(() => {
    // Update display notation
    const bonusStr = bonus >= 0 ? `+${bonus}` : bonus === 0 ? '' : `${bonus}`;
    setDisplayNotation(`${num}d${size}${bonusStr}`);

    // Calculate average
    const avgPerDie = (size + 1) / 2;
    const avg = Math.floor(num * avgPerDie + bonus);
    setDisplayAverage(avg);
  }, [num, size, bonus]);

  const hasError = numError || sizeError;

  return (
    <div className='space-y-2'>
      <label className='block text-sm font-medium text-card-foreground'>
        {label}
      </label>

      <div className='grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-2 items-center'>
        {/* Number of dice */}
        <div>
          <input
            type='number'
            placeholder='Num'
            value={num}
            onChange={e => onNumChange(parseInt(e.target.value) || minNum)}
            min={minNum}
            aria-label={`${label} - Number of dice`}
            className={`block w-full rounded-md border bg-background shadow-sm focus:ring-ring focus:border-ring sm:text-sm ${
              numError ? 'border-destructive' : 'border-input'
            }`}
          />
          {numError && (
            <p className='text-destructive text-xs mt-1'>{numError}</p>
          )}
        </div>

        {/* 'd' separator */}
        <span className='text-muted-foreground font-mono text-lg'>d</span>

        {/* Die size */}
        <div>
          <input
            type='number'
            placeholder='Size'
            value={size}
            onChange={e => onSizeChange(parseInt(e.target.value) || minSize)}
            min={minSize}
            aria-label={`${label} - Die size`}
            className={`block w-full rounded-md border bg-background shadow-sm focus:ring-ring focus:border-ring sm:text-sm ${
              sizeError ? 'border-destructive' : 'border-input'
            }`}
          />
          {sizeError && (
            <p className='text-destructive text-xs mt-1'>{sizeError}</p>
          )}
        </div>

        {/* '+' separator */}
        <span className='text-muted-foreground font-mono text-lg'>+</span>

        {/* Bonus */}
        <div>
          <input
            type='number'
            placeholder='Bonus'
            value={bonus}
            onChange={e => onBonusChange(parseInt(e.target.value) || 0)}
            aria-label={`${label} - Bonus`}
            className='block w-full rounded-md border border-input bg-background shadow-sm focus:ring-ring focus:border-ring sm:text-sm'
          />
        </div>
      </div>

      {/* Display notation and average */}
      <div className='flex items-center justify-between text-sm text-muted-foreground'>
        <span className='font-mono'>{displayNotation}</span>
        <span>avg: ~{displayAverage}</span>
      </div>

      {helpText && !hasError && (
        <p className='text-xs text-muted-foreground'>{helpText}</p>
      )}
    </div>
  );
}
