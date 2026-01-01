/**
 * XML-Lite Parser for FieryMUD Color Markup
 *
 * Parses XML-Lite markup (e.g., <red>text</red>, <b:green>bold green</b:green>)
 * and converts it to structured data for rendering.
 *
 * References:
 * - fierymud/docs/COLOR_CODES_XMLLITE.md
 */

export interface TextStyle {
  bold?: boolean;
  underline?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  dim?: boolean;
  blink?: boolean;
  reverse?: boolean;
  hidden?: boolean;
}

export interface TextColors {
  foreground?: string;
  background?: string;
}

export interface StyledSegment {
  text: string;
  style: TextStyle;
  colors: TextColors;
}

export interface ParsedText {
  segments: StyledSegment[];
  rawText: string;
}

// Named color mappings (16-color ANSI palette)
const NAMED_COLORS: Record<string, string> = {
  black: '#000000',
  red: '#CD0000',
  green: '#00CD00',
  yellow: '#CDCD00',
  blue: '#0000EE',
  magenta: '#CD00CD',
  purple: '#CD00CD', // alias
  cyan: '#00CDCD',
  teal: '#00CDCD', // alias
  white: '#E5E5E5',
  brown: '#CDCD00', // same as yellow
  orange: '#FFFF00', // bright yellow
};

// Bright color variants (used with bold or uppercase XML tags)
const BRIGHT_COLORS: Record<string, string> = {
  black: '#7F7F7F',
  red: '#FF0000',
  green: '#00FF00',
  yellow: '#FFFF00',
  blue: '#5C5CFF',
  magenta: '#FF00FF',
  purple: '#FF00FF',
  cyan: '#00FFFF',
  teal: '#00FFFF',
  white: '#FFFFFF',
};

/**
 * Parse XML-Lite markup to structured segments
 */
export function parseXmlLite(markup: string): ParsedText {
  if (!markup) {
    return { segments: [], rawText: '' };
  }

  const segments: StyledSegment[] = [];
  const tagStack: Array<{ style: TextStyle; colors: TextColors }> = [];
  let currentStyle: TextStyle = {};
  let currentColors: TextColors = {};
  let currentText = '';
  let i = 0;

  const flushText = () => {
    if (currentText) {
      segments.push({
        text: currentText,
        style: { ...currentStyle },
        colors: { ...currentColors },
      });
      currentText = '';
    }
  };

  const applyModifiers = (modifiers: string[]) => {
    for (const mod of modifiers) {
      // Text attributes
      if (mod === 'b') currentStyle.bold = true;
      else if (mod === 'u') currentStyle.underline = true;
      else if (mod === 'i') currentStyle.italic = true;
      else if (mod === 's') currentStyle.strikethrough = true;
      else if (mod === 'dim') currentStyle.dim = true;
      else if (mod === 'blink') currentStyle.blink = true;
      else if (mod === 'reverse') currentStyle.reverse = true;
      else if (mod === 'hide' || mod === 'hidden') currentStyle.hidden = true;
      // Named foreground colors
      else if (NAMED_COLORS[mod]) {
        currentColors.foreground = currentStyle.bold
          ? BRIGHT_COLORS[mod] || NAMED_COLORS[mod]
          : NAMED_COLORS[mod];
      }

      // Named background colors (bg- prefix)
      else if (mod.startsWith('bg-')) {
        const colorName = mod.substring(3);
        if (NAMED_COLORS[colorName]) {
          currentColors.background = NAMED_COLORS[colorName];
        }
      }

      // Indexed colors (256-color palette)
      else if (mod.startsWith('c') && /^c\d{1,3}$/.test(mod)) {
        const index = parseInt(mod.substring(1), 10);
        if (index >= 0 && index <= 255) {
          currentColors.foreground = indexedColorToHex(index);
        }
      } else if (mod.startsWith('bgc') && /^bgc\d{1,3}$/.test(mod)) {
        const index = parseInt(mod.substring(3), 10);
        if (index >= 0 && index <= 255) {
          currentColors.background = indexedColorToHex(index);
        }
      }

      // RGB colors (#RRGGBB)
      else if (mod.startsWith('#') && /^#[0-9A-Fa-f]{6}$/.test(mod)) {
        currentColors.foreground = mod.toUpperCase();
      } else if (mod.startsWith('bg#') && /^bg#[0-9A-Fa-f]{6}$/.test(mod)) {
        currentColors.background = mod.substring(2).toUpperCase();
      }
    }
  };

  while (i < markup.length) {
    const char = markup[i];

    if (char === '<') {
      // Find matching >
      const closeIndex = markup.indexOf('>', i);
      if (closeIndex === -1) {
        // No matching >, treat as literal
        currentText += char;
        i++;
        continue;
      }

      const tagContent = markup.substring(i + 1, closeIndex);

      // Full reset tag (</>)
      if (tagContent === '/') {
        flushText();
        currentStyle = {};
        currentColors = {};
        tagStack.length = 0;
        i = closeIndex + 1;
        continue;
      }

      // Closing tag (</name>)
      if (tagContent.startsWith('/')) {
        flushText();
        // Pop from stack
        if (tagStack.length > 0) {
          const previous = tagStack.pop()!;
          currentStyle = previous.style;
          currentColors = previous.colors;
        } else {
          currentStyle = {};
          currentColors = {};
        }
        i = closeIndex + 1;
        continue;
      }

      // Opening tag (<name> or <name:mod:mod>)
      flushText();

      // Push current state to stack
      tagStack.push({
        style: { ...currentStyle },
        colors: { ...currentColors },
      });

      // Parse modifiers
      const modifiers = tagContent.split(':').filter(Boolean);
      applyModifiers(modifiers);

      i = closeIndex + 1;
    } else {
      currentText += char;
      i++;
    }
  }

  // Flush remaining text
  flushText();

  // Get raw text (without markup)
  const rawText = segments.map(s => s.text).join('');

  return { segments, rawText };
}

/**
 * Convert 256-color palette index to hex color
 */
function indexedColorToHex(index: number): string {
  if (index < 0 || index > 255) return '#FFFFFF';

  // 0-15: Standard ANSI colors
  if (index < 16) {
    const colors = [
      '#000000',
      '#CD0000',
      '#00CD00',
      '#CDCD00',
      '#0000EE',
      '#CD00CD',
      '#00CDCD',
      '#E5E5E5',
      '#7F7F7F',
      '#FF0000',
      '#00FF00',
      '#FFFF00',
      '#5C5CFF',
      '#FF00FF',
      '#00FFFF',
      '#FFFFFF',
    ];
    return colors[index] ?? '#FFFFFF';
  }

  // 16-231: 6x6x6 RGB cube
  if (index < 232) {
    const i = index - 16;
    const r = Math.floor(i / 36);
    const g = Math.floor((i % 36) / 6);
    const b = i % 6;

    const toHex = (n: number) => {
      const value = n === 0 ? 0 : 55 + n * 40;
      return value.toString(16).padStart(2, '0');
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }

  // 232-255: Grayscale
  const gray = 8 + (index - 232) * 10;
  const hex = gray.toString(16).padStart(2, '0');
  return `#${hex}${hex}${hex}`.toUpperCase();
}

/**
 * Strip all XML-Lite markup and return plain text
 */
export function stripMarkup(markup: string): string {
  const { rawText } = parseXmlLite(markup);
  return rawText;
}

/**
 * Validate XML-Lite markup syntax
 */
export function validateMarkup(markup: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const tagStack: string[] = [];
  let i = 0;

  while (i < markup.length) {
    if (markup[i] === '<') {
      const closeIndex = markup.indexOf('>', i);
      if (closeIndex === -1) {
        errors.push(`Unclosed tag at position ${i}`);
        break;
      }

      const tagContent = markup.substring(i + 1, closeIndex);

      // Skip full reset
      if (tagContent === '/') {
        tagStack.length = 0;
        i = closeIndex + 1;
        continue;
      }

      // Closing tag
      if (tagContent.startsWith('/')) {
        const tagName = tagContent.substring(1);
        if (tagStack.length === 0) {
          errors.push(
            `Closing tag </${tagName}> without matching opening tag at position ${i}`
          );
        } else {
          // Pop from stack - we accept any closing tag when stack is not empty
          // This supports both </> and explicit closing tags like </b:green>
          tagStack.pop();
        }
        i = closeIndex + 1;
        continue;
      }

      // Opening tag - push the FULL tag content (including all modifiers)
      // e.g., <b:green> pushes 'b:green', not just 'b'
      tagStack.push(tagContent || 'anonymous');
      i = closeIndex + 1;
    } else {
      i++;
    }
  }

  if (tagStack.length > 0) {
    errors.push(`Unclosed tags: ${tagStack.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}
