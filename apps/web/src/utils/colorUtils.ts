/**
 * Color Utilities for Theme-Aware Rendering
 *
 * Provides utilities for adjusting colors based on theme (light/dark)
 * and ensuring proper contrast for readability.
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): RGB | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result && result[1] && result[2] && result[3]
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase();
}

/**
 * Calculate relative luminance (WCAG formula)
 */
export function getLuminance(rgb: RGB): number {
  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;

  const r =
    rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g =
    gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b =
    bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: RGB, color2: RGB): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Adjust color brightness for better contrast
 */
export function adjustForContrast(
  foreground: string,
  background: string,
  minContrast: number = 4.5
): string {
  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);

  if (!fg || !bg) return foreground;

  let ratio = getContrastRatio(fg, bg);
  if (ratio >= minContrast) return foreground;

  // Determine if we should lighten or darken
  const bgLum = getLuminance(bg);
  const shouldLighten = bgLum < 0.5;

  let adjustedFg = { ...fg };
  const factor = shouldLighten ? 1.1 : 0.9;

  for (let i = 0; i < 20; i++) {
    if (shouldLighten) {
      adjustedFg = {
        r: Math.min(255, adjustedFg.r * factor),
        g: Math.min(255, adjustedFg.g * factor),
        b: Math.min(255, adjustedFg.b * factor),
      };
    } else {
      adjustedFg = {
        r: Math.max(0, adjustedFg.r * factor),
        g: Math.max(0, adjustedFg.g * factor),
        b: Math.max(0, adjustedFg.b * factor),
      };
    }

    ratio = getContrastRatio(adjustedFg, bg);
    if (ratio >= minContrast) break;
  }

  return rgbToHex(adjustedFg);
}

/**
 * Get appropriate foreground color for a background
 */
export function getContrastingText(backgroundColor: string): string {
  const bg = hexToRgb(backgroundColor);
  if (!bg) return '#000000';

  const luminance = getLuminance(bg);
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Adjust color for theme (light/dark mode)
 */
export function adjustForTheme(
  color: string,
  isDark: boolean,
  backgroundColor?: string
): string {
  if (!backgroundColor) {
    backgroundColor = isDark ? '#1A1A1A' : '#FFFFFF';
  }

  return adjustForContrast(color, backgroundColor, isDark ? 4.5 : 4.5);
}

/**
 * Check if color is too dark for dark backgrounds
 */
export function isTooSimilar(
  color1: string,
  color2: string,
  threshold: number = 1.5
): boolean {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  if (!c1 || !c2) return false;

  const ratio = getContrastRatio(c1, c2);
  return ratio < threshold;
}

/**
 * Mapping of XML-Lite color tags to Tailwind CSS classes
 * Format: <color:name>text</> or <b:color>text</>
 */
const COLOR_MAP: Record<string, string> = {
  red: 'text-red-500',
  green: 'text-green-500',
  yellow: 'text-yellow-500',
  blue: 'text-blue-500',
  magenta: 'text-magenta-500',
  cyan: 'text-cyan-500',
  white: 'text-white',
  black: 'text-black',
  gray: 'text-gray-500',
};

/**
 * Parse XML-Lite color tags and return React-friendly structure
 * Supports: <color>text</>, <b:color>text</>, etc.
 */
export interface ColorSegment {
  text: string;
  color?: string | undefined;
  bold?: boolean;
}

export function parseXmlLiteColors(text: string): ColorSegment[] {
  if (!text) return [];

  const segments: ColorSegment[] = [];
  const regex = /<(?:b:)?(\w+)>(.*?)<\/?>/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add any text before this match
    if (match.index > lastIndex) {
      segments.push({ text: text.substring(lastIndex, match.index) });
    }

    // Add the colored segment
    const isBold = text.substring(match.index, match.index + 3) === '<b:';
    const color = match[1] ?? 'white';
    const content = match[2] ?? '';

    segments.push({
      text: content,
      color: COLOR_MAP[color] || COLOR_MAP['white'],
      bold: isBold,
    });

    lastIndex = regex.lastIndex;
  }

  // Add any remaining text
  if (lastIndex < text.length) {
    segments.push({ text: text.substring(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ text }];
}

/**
 * Strip all XML-Lite color codes from text
 */
export function stripXmlLiteColors(text: string): string {
  if (!text) return '';
  return text.replace(/<(?:b:)?(\w+)>(.*?)<\/?>/g, '$2');
}
