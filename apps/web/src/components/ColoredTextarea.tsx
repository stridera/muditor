/**
 * ColoredTextarea Component
 *
 * Multi-line textarea with color markup support and preview.
 * Based on ColoredInput but for longer text like descriptions.
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { ColoredTextInline } from './ColoredTextViewer';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Palette } from 'lucide-react';

export interface ColoredTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
  rows?: number;
}

const COLORS = [
  { name: 'Red', tag: 'red', hex: '#CD0000' },
  { name: 'Green', tag: 'green', hex: '#00CD00' },
  { name: 'Yellow', tag: 'yellow', hex: '#CDCD00' },
  { name: 'Blue', tag: 'blue', hex: '#0000EE' },
  { name: 'Magenta', tag: 'magenta', hex: '#CD00CD' },
  { name: 'Cyan', tag: 'cyan', hex: '#00CDCD' },
  { name: 'White', tag: 'white', hex: '#E5E5E5' },
];

const BRIGHT_COLORS = [
  { name: 'Bright Red', tag: 'b:red', hex: '#FF0000' },
  { name: 'Bright Green', tag: 'b:green', hex: '#00FF00' },
  { name: 'Bright Yellow', tag: 'b:yellow', hex: '#FFFF00' },
  { name: 'Bright Blue', tag: 'b:blue', hex: '#5C5CFF' },
  { name: 'Bright Magenta', tag: 'b:magenta', hex: '#FF00FF' },
  { name: 'Bright Cyan', tag: 'b:cyan', hex: '#00FFFF' },
  { name: 'Bright White', tag: 'b:white', hex: '#FFFFFF' },
];

export function ColoredTextarea({
  value,
  onChange,
  placeholder,
  className,
  id,
  disabled,
  rows = 3,
}: ColoredTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const wrapSelection = useCallback(
    (colorTag: string) => {
      if (!textareaRef.current) return;

      const textarea = textareaRef.current;
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      const selectedText = value.substring(start, end);

      if (!selectedText) {
        // No selection - insert empty tags at cursor
        const before = value.substring(0, start);
        const after = value.substring(end);
        const newValue = `${before}<${colorTag}></${colorTag}>${after}`;
        onChange(newValue);

        // Position cursor between tags
        setTimeout(() => {
          textarea.focus();
          const cursorPos = start + colorTag.length + 2;
          textarea.setSelectionRange(cursorPos, cursorPos);
        }, 0);
      } else {
        // Wrap selected text
        const before = value.substring(0, start);
        const after = value.substring(end);
        const newValue = `${before}<${colorTag}>${selectedText}</${colorTag}>${after}`;
        onChange(newValue);

        // Restore selection
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(
            start + colorTag.length + 2,
            start + colorTag.length + 2 + selectedText.length
          );
        }, 0);
      }

      setIsOpen(false);
    },
    [value, onChange]
  );

  return (
    <div className={className}>
      <div className='flex gap-1'>
        <Textarea
          ref={textareaRef}
          id={id}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className='flex-1 font-mono text-sm resize-none'
        />
        {!disabled && (
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                type='button'
                variant='outline'
                size='icon'
                className='shrink-0 self-start'
                title='Add color (select text first)'
              >
                <Palette className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-48'>
              <div className='px-2 py-1.5 text-xs text-muted-foreground'>
                Select text first, then pick color
              </div>
              <DropdownMenuSeparator />
              <div className='grid grid-cols-7 gap-1 p-2'>
                {COLORS.map(color => (
                  <button
                    key={color.tag}
                    type='button'
                    className='h-5 w-5 rounded border hover:border-primary transition-colors'
                    style={{ backgroundColor: color.hex }}
                    onClick={() => wrapSelection(color.tag)}
                    title={color.name}
                  />
                ))}
              </div>
              <div className='grid grid-cols-7 gap-1 px-2 pb-2'>
                {BRIGHT_COLORS.map(color => (
                  <button
                    key={color.tag}
                    type='button'
                    className='h-5 w-5 rounded border hover:border-primary transition-colors'
                    style={{ backgroundColor: color.hex }}
                    onClick={() => wrapSelection(color.tag)}
                    title={color.name}
                  />
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => wrapSelection('b')}>
                Bold
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => wrapSelection('u')}>
                Underline
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      {value && (
        <div className='mt-1 px-2 py-1 bg-muted/50 rounded text-sm font-mono whitespace-pre-wrap'>
          <ColoredTextInline markup={value} />
        </div>
      )}
    </div>
  );
}
