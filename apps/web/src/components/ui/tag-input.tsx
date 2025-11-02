'use client';

import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import * as React from 'react';
import { Badge } from './badge';

export interface TagInputProps {
  value: string | string[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
}

export function TagInput({
  value,
  onChange,
  placeholder = 'Type and press space or comma to add',
  className,
  error = false,
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Parse tags from either array or comma-separated string
  const tags = React.useMemo(() => {
    if (!value) return [];

    // If value is already an array, use it directly
    if (Array.isArray(value)) {
      return value.map(tag => tag.trim()).filter(tag => tag.length > 0);
    }

    // If value is a string, split by comma
    if (typeof value === 'string') {
      return value
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
    }

    return [];
  }, [value]);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;

    // Don't add duplicates
    if (tags.includes(trimmedTag)) {
      setInputValue('');
      return;
    }

    const newTags = [...tags, trimmedTag];
    onChange(newTags.join(', '));
    setInputValue('');
  };

  const removeTag = (indexToRemove: number) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove);
    onChange(newTags.join(', '));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      removeTag(tags.length - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Check if the last character is a comma or space
    if (value.endsWith(',') || value.endsWith(' ')) {
      addTag(value.slice(0, -1));
    } else {
      setInputValue(value);
    }
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div
      onClick={handleContainerClick}
      className={cn(
        'flex flex-wrap gap-2 p-2 rounded-md border bg-white min-h-[42px] cursor-text transition-colors',
        error ? 'border-red-300' : 'border-gray-300',
        'focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500',
        className
      )}
    >
      {tags.map((tag, index) => (
        <Badge
          key={index}
          variant='secondary'
          className='pl-2.5 pr-1 py-1 text-sm flex items-center gap-1'
        >
          {tag}
          <button
            type='button'
            onClick={e => {
              e.stopPropagation();
              removeTag(index);
            }}
            className='ml-1 rounded-full hover:bg-gray-400/20 p-0.5 transition-colors'
          >
            <X className='h-3 w-3' />
          </button>
        </Badge>
      ))}
      <input
        ref={inputRef}
        type='text'
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ''}
        className='flex-1 min-w-[120px] outline-none text-sm bg-transparent'
      />
    </div>
  );
}
