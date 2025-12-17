/**
 * ColoredTextViewer Component
 *
 * Renders XML-Lite color markup with proper theme-aware styling.
 * Read-only display component for showing colored text.
 */

'use client';

import React from 'react';
import { parseXmlLite, type StyledSegment } from '@/utils/xmlLiteParser';
import { adjustForTheme } from '@/utils/colorUtils';
import { useTheme } from 'next-themes';

export interface ColoredTextViewerProps {
  /**
   * XML-Lite markup to render
   */
  markup: string;

  /**
   * Optional className for styling
   */
  className?: string;

  /**
   * Font family (monospace recommended for MUD text)
   */
  fontFamily?: string;

  /**
   * Background color override (defaults to theme background)
   */
  backgroundColor?: string;

  /**
   * Enable/disable theme-aware color adjustment
   */
  adjustColors?: boolean;
}

/**
 * Render a single styled segment
 */
function SegmentRenderer({
  segment,
  isDark,
  backgroundColor,
  adjustColors,
}: {
  segment: StyledSegment;
  isDark: boolean;
  backgroundColor?: string;
  adjustColors: boolean;
}) {
  const style: React.CSSProperties = {};

  // Apply colors (with theme adjustment if enabled)
  if (segment.colors.foreground) {
    style.color = adjustColors
      ? adjustForTheme(segment.colors.foreground, isDark, backgroundColor)
      : segment.colors.foreground;
  }

  if (segment.colors.background) {
    style.backgroundColor = segment.colors.background;
  }

  // Apply text styles
  if (segment.style.bold) style.fontWeight = 'bold';
  if (segment.style.underline) {
    style.textDecoration = segment.style.strikethrough
      ? 'underline line-through'
      : 'underline';
  } else if (segment.style.strikethrough) {
    style.textDecoration = 'line-through';
  }
  if (segment.style.italic) style.fontStyle = 'italic';
  if (segment.style.dim) style.opacity = 0.6;
  if (segment.style.blink) style.animation = 'blink 1s step-start infinite';
  if (segment.style.hidden) style.visibility = 'hidden';

  // Reverse video (swap fg/bg)
  if (segment.style.reverse && segment.colors.foreground) {
    const temp = style.color;
    style.color = style.backgroundColor || (isDark ? '#1A1A1A' : '#FFFFFF');
    style.backgroundColor = temp as string;
  }

  return <span style={style}>{segment.text}</span>;
}

/**
 * ColoredTextViewer - Renders XML-Lite markup with colors
 */
export function ColoredTextViewer({
  markup,
  className,
  fontFamily = 'monospace',
  backgroundColor,
  adjustColors = true,
}: ColoredTextViewerProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!markup) {
    return null;
  }

  const { segments } = parseXmlLite(markup);
  const isDark = mounted
    ? theme === 'dark' || (theme === 'system' && systemTheme === 'dark')
    : false;

  return (
    <div
      className={className}
      style={{
        fontFamily,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        backgroundColor: backgroundColor || (isDark ? '#1A1A1A' : '#FFFFFF'),
        padding: '0.5rem',
        borderRadius: '0.375rem',
      }}
    >
      <style>{`
        @keyframes blink {
          50% {
            opacity: 0;
          }
        }
      `}</style>
      {segments.map((segment, index) => (
        <SegmentRenderer
          key={index}
          segment={segment}
          isDark={isDark}
          {...(backgroundColor ? { backgroundColor } : {})}
          adjustColors={adjustColors}
        />
      ))}
    </div>
  );
}

/**
 * Inline variant - renders without container styling
 */
export function ColoredTextInline({
  markup,
  className,
  adjustColors = true,
}: Omit<ColoredTextViewerProps, 'fontFamily' | 'backgroundColor'>) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!markup) {
    return null;
  }

  const { segments } = parseXmlLite(markup);
  const isDark = mounted
    ? theme === 'dark' || (theme === 'system' && systemTheme === 'dark')
    : false;

  return (
    <span className={className}>
      {segments.map((segment, index) => (
        <SegmentRenderer
          key={index}
          segment={segment}
          isDark={isDark}
          adjustColors={adjustColors}
        />
      ))}
    </span>
  );
}
