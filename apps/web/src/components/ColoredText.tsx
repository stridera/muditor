import React from 'react';
import { parseXmlLiteColors, type ColorSegment } from '@/utils/colorUtils';
import { cn } from '@/lib/utils';

interface ColoredTextProps {
  text: string;
  className?: string;
}

/**
 * Renders text with XML-Lite color codes as colored spans
 * Example: "<b:magenta>Sorcerer</>" renders as bold magenta text
 */
export function ColoredText({ text, className }: ColoredTextProps) {
  const segments = parseXmlLiteColors(text);

  return (
    <span className={cn('inline', className)}>
      {segments.map((segment: ColorSegment, index: number) => (
        <span
          key={index}
          className={cn(segment.color, segment.bold && 'font-bold')}
        >
          {segment.text}
        </span>
      ))}
    </span>
  );
}
