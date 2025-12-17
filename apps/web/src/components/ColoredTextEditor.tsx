/**
 * ColoredTextEditor Component
 *
 * WYSIWYG editor for XML-Lite color markup with toolbar.
 * Allows users to select text and apply colors/styles visually.
 */

'use client';

import React, { useRef, useState, useCallback } from 'react';
import { ColoredTextViewer } from './ColoredTextViewer';
import { stripMarkup, validateMarkup } from '@/utils/xmlLiteParser';
import { Button } from './ui/button';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Palette,
  X,
  Eye,
  Code,
  AlertCircle,
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

export interface ColoredTextEditorProps {
  /**
   * Current markup value
   */
  value: string;

  /**
   * Callback when markup changes
   */
  onChange: (markup: string) => void;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Optional className
   */
  className?: string;

  /**
   * Max length (in plain text)
   */
  maxLength?: number;

  /**
   * Enable/disable live preview
   */
  showPreview?: boolean;
}

const NAMED_COLORS = [
  { name: 'Red', value: 'red', hex: '#CD0000' },
  { name: 'Green', value: 'green', hex: '#00CD00' },
  { name: 'Yellow', value: 'yellow', hex: '#CDCD00' },
  { name: 'Blue', value: 'blue', hex: '#0000EE' },
  { name: 'Magenta', value: 'magenta', hex: '#CD00CD' },
  { name: 'Cyan', value: 'cyan', hex: '#00CDCD' },
  { name: 'White', value: 'white', hex: '#E5E5E5' },
  { name: 'Black', value: 'black', hex: '#000000' },
];

const BRIGHT_COLORS = [
  { name: 'Bright Red', value: 'b:red', hex: '#FF0000' },
  { name: 'Bright Green', value: 'b:green', hex: '#00FF00' },
  { name: 'Bright Yellow', value: 'b:yellow', hex: '#FFFF00' },
  { name: 'Bright Blue', value: 'b:blue', hex: '#5C5CFF' },
  { name: 'Bright Magenta', value: 'b:magenta', hex: '#FF00FF' },
  { name: 'Bright Cyan', value: 'b:cyan', hex: '#00FFFF' },
  { name: 'Bright White', value: 'b:white', hex: '#FFFFFF' },
];

/**
 * ColoredTextEditor - WYSIWYG editor with toolbar
 */
export function ColoredTextEditor({
  value,
  onChange,
  placeholder = 'Enter text...',
  className,
  maxLength,
  showPreview = true,
}: ColoredTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'markup'>(
    'edit'
  );
  const [customColor, setCustomColor] = useState('#FF0000');

  // Validate markup
  const validation = validateMarkup(value);
  const plainText = stripMarkup(value);
  const textLength = plainText.length;

  /**
   * Wrap selected text with markup tag
   */
  const wrapSelection = useCallback(
    (openTag: string, closeTag: string) => {
      if (!textareaRef.current) return;

      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);

      if (!selectedText) {
        // No selection - just insert cursor position markers
        return;
      }

      const before = value.substring(0, start);
      const after = value.substring(end);
      const newValue = `${before}${openTag}${selectedText}${closeTag}${after}`;

      onChange(newValue);

      // Restore selection
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + openTag.length,
          start + openTag.length + selectedText.length
        );
      }, 0);
    },
    [value, onChange]
  );

  /**
   * Apply text style (bold, italic, etc.)
   */
  const applyStyle = useCallback(
    (style: string) => {
      wrapSelection(`<${style}>`, `</${style}>`);
      setShowColorPicker(false);
    },
    [wrapSelection]
  );

  /**
   * Apply color
   */
  const applyColor = useCallback(
    (colorTag: string) => {
      wrapSelection(`<${colorTag}>`, `</${colorTag}>`);
      setShowColorPicker(false);
    },
    [wrapSelection]
  );

  /**
   * Apply custom hex color
   */
  const applyCustomColor = useCallback(() => {
    if (!/^#[0-9A-Fa-f]{6}$/.test(customColor)) {
      alert('Invalid hex color format. Use #RRGGBB');
      return;
    }
    wrapSelection(`<${customColor}>`, `</${customColor}>`);
    setShowColorPicker(false);
  }, [customColor, wrapSelection]);

  /**
   * Clear all formatting (strip markup)
   */
  const clearFormatting = useCallback(() => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start === end) {
      // No selection - clear all
      onChange(stripMarkup(value));
    } else {
      // Clear selection only
      const selectedText = value.substring(start, end);
      const before = value.substring(0, start);
      const after = value.substring(end);
      const newValue = `${before}${stripMarkup(selectedText)}${after}`;
      onChange(newValue);
    }
  }, [value, onChange]);

  return (
    <div className={className}>
      {/* Toolbar */}
      <div className='border rounded-t-md bg-muted/50 p-2 flex flex-wrap gap-2 items-center'>
        {/* Text Style Buttons */}
        <div className='flex gap-1'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => applyStyle('b')}
            title='Bold'
          >
            <Bold className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => applyStyle('i')}
            title='Italic'
          >
            <Italic className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => applyStyle('u')}
            title='Underline'
          >
            <Underline className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => applyStyle('s')}
            title='Strikethrough'
          >
            <Strikethrough className='h-4 w-4' />
          </Button>
        </div>

        <div className='border-l h-6' />

        {/* Color Picker Toggle */}
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => setShowColorPicker(!showColorPicker)}
          title='Colors'
        >
          <Palette className='h-4 w-4' />
        </Button>

        <div className='border-l h-6' />

        {/* Clear Formatting */}
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={clearFormatting}
          title='Clear Formatting'
        >
          <X className='h-4 w-4' />
        </Button>

        <div className='flex-1' />

        {/* View Mode Toggles */}
        <div className='flex gap-1'>
          <Button
            type='button'
            variant={viewMode === 'edit' ? 'default' : 'ghost'}
            size='sm'
            onClick={() => setViewMode('edit')}
            title='Edit'
          >
            Edit
          </Button>
          <Button
            type='button'
            variant={viewMode === 'preview' ? 'default' : 'ghost'}
            size='sm'
            onClick={() => setViewMode('preview')}
            title='Preview'
          >
            <Eye className='h-4 w-4 mr-1' />
            Preview
          </Button>
          <Button
            type='button'
            variant={viewMode === 'markup' ? 'default' : 'ghost'}
            size='sm'
            onClick={() => setViewMode('markup')}
            title='Raw Markup'
          >
            <Code className='h-4 w-4' />
          </Button>
        </div>

        {/* Character Count */}
        {maxLength && (
          <div className='text-sm text-muted-foreground'>
            {textLength} / {maxLength}
          </div>
        )}
      </div>

      {/* Color Picker Panel */}
      {showColorPicker && (
        <div className='border border-t-0 bg-background p-3 grid grid-cols-4 md:grid-cols-8 gap-2'>
          {/* Named Colors */}
          {NAMED_COLORS.map(color => (
            <button
              key={color.value}
              type='button'
              className='h-8 rounded border-2 hover:border-primary transition-colors'
              style={{ backgroundColor: color.hex }}
              onClick={() => applyColor(color.value)}
              title={color.name}
            />
          ))}

          {/* Bright Colors */}
          {BRIGHT_COLORS.map(color => (
            <button
              key={color.value}
              type='button'
              className='h-8 rounded border-2 hover:border-primary transition-colors'
              style={{ backgroundColor: color.hex }}
              onClick={() => applyColor(color.value)}
              title={color.name}
            />
          ))}

          {/* Custom Color Input */}
          <div className='col-span-4 md:col-span-8 flex gap-2 mt-2'>
            <input
              type='color'
              value={customColor}
              onChange={e => setCustomColor(e.target.value.toUpperCase())}
              className='h-8 w-16 rounded cursor-pointer'
            />
            <input
              type='text'
              value={customColor}
              onChange={e => setCustomColor(e.target.value.toUpperCase())}
              placeholder='#FF0000'
              className='flex-1 px-2 h-8 border rounded font-mono text-sm'
              maxLength={7}
            />
            <Button type='button' size='sm' onClick={applyCustomColor}>
              Apply
            </Button>
          </div>
        </div>
      )}

      {/* Editor/Preview Area */}
      {viewMode === 'edit' && (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className='w-full min-h-[200px] p-3 border border-t-0 rounded-b-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring'
          maxLength={maxLength ? maxLength * 3 : undefined} // Account for markup overhead
        />
      )}

      {viewMode === 'preview' && (
        <div className='border border-t-0 rounded-b-md min-h-[200px]'>
          <ColoredTextViewer markup={value} fontFamily='monospace' />
        </div>
      )}

      {viewMode === 'markup' && (
        <pre className='w-full min-h-[200px] p-3 border border-t-0 rounded-b-md font-mono text-sm overflow-auto bg-muted/30'>
          {value || placeholder}
        </pre>
      )}

      {/* Validation Errors */}
      {!validation.valid && (
        <Alert variant='destructive' className='mt-2'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            <strong>Markup errors:</strong>
            <ul className='list-disc list-inside mt-1'>
              {validation.errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Live Preview (if enabled and editing) */}
      {showPreview && viewMode === 'edit' && value && (
        <div className='mt-2 p-2 border rounded-md bg-muted/30'>
          <div className='text-xs font-semibold text-muted-foreground mb-1'>
            Live Preview:
          </div>
          <ColoredTextViewer markup={value} fontFamily='monospace' />
        </div>
      )}
    </div>
  );
}
