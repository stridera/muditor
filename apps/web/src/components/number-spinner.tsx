'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useRef, useState } from 'react';

interface NumberSpinnerProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  error?: string;
  helpText?: string;
  className?: string;
  placeholder?: string;
}

/**
 * NumberSpinner - Enhanced number input with increment/decrement buttons
 *
 * Features:
 * - Spinner buttons for easy value adjustment
 * - Keyboard support (up/down arrows)
 * - Min/max validation
 * - Step increment control
 * - Prevents value loss on backspace (maintains min value)
 * - Proper focus management
 */
export function NumberSpinner({
  label,
  value,
  onChange,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  error,
  helpText,
  className = '',
  placeholder,
}: NumberSpinnerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const clamp = (val: number): number => {
    return Math.max(min, Math.min(max, val));
  };

  const handleIncrement = () => {
    const newValue = clamp(value + step);
    onChange(newValue);
    inputRef.current?.focus();
  };

  const handleDecrement = () => {
    const newValue = clamp(value - step);
    onChange(newValue);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    // Allow empty input while typing
    if (rawValue === '' || rawValue === '-') {
      // Don't call onChange yet - wait for blur
      return;
    }

    const parsed = parseInt(rawValue, 10);
    if (!isNaN(parsed)) {
      onChange(clamp(parsed));
    }
  };

  const handleBlur = () => {
    setIsFocused(false);

    // If input is empty or invalid on blur, restore to min value
    const currentValue = inputRef.current?.value;
    if (
      !currentValue ||
      currentValue === '' ||
      currentValue === '-' ||
      isNaN(parseInt(currentValue, 10))
    ) {
      onChange(min);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleDecrement();
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className='block text-sm font-medium text-card-foreground mb-1'>
          {label}
        </label>
      )}

      <div className='relative'>
        <input
          ref={inputRef}
          type='number'
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          className={`block w-full rounded-md border bg-background shadow-sm focus:ring-ring focus:border-ring pr-8 sm:text-sm ${
            error ? 'border-destructive' : 'border-input'
          }`}
        />

        {/* Spinner buttons */}
        <div className='absolute right-0 top-0 bottom-0 flex flex-col border-l border-input bg-muted/30'>
          <button
            type='button'
            onClick={handleIncrement}
            disabled={value >= max}
            className='flex-1 px-1.5 hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            aria-label='Increment'
          >
            <ChevronUp className='w-3 h-3' />
          </button>
          <button
            type='button'
            onClick={handleDecrement}
            disabled={value <= min}
            className='flex-1 px-1.5 hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-t border-input'
            aria-label='Decrement'
          >
            <ChevronDown className='w-3 h-3' />
          </button>
        </div>
      </div>

      {error && <p className='text-destructive text-xs mt-1'>{error}</p>}
      {helpText && !error && (
        <p className='text-xs text-muted-foreground mt-1'>{helpText}</p>
      )}
    </div>
  );
}
