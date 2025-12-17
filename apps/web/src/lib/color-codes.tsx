// MUD color code parsing and rendering
// Supports formats like: <yellow>text</>, <b:red>text</>, <magenta>text</>

const COLOR_MAP: Record<string, string> = {
  black: 'text-gray-900',
  red: 'text-red-600',
  green: 'text-green-600',
  yellow: 'text-yellow-600',
  blue: 'text-blue-600',
  magenta: 'text-magenta-600',
  cyan: 'text-cyan-600',
  white: 'text-gray-100',
  gray: 'text-gray-500',
  orange: 'text-orange-600',
  purple: 'text-purple-600',
};

interface ColoredTextSegment {
  text: string;
  color?: string;
  bold?: boolean;
}

export function parseColorCodes(text: string): ColoredTextSegment[] {
  const segments: ColoredTextSegment[] = [];
  const regex = /<(b:)?(\w+)>(.*?)(?:<\/?>|$)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add any plain text before this match
    if (match.index > lastIndex) {
      segments.push({
        text: text.substring(lastIndex, match.index),
      });
    }

    // Add the colored segment
    segments.push({
      text: match[3],
      color: match[2],
      bold: match[1] === 'b:',
    });

    lastIndex = regex.lastIndex;
  }

  // Add any remaining plain text
  if (lastIndex < text.length) {
    segments.push({
      text: text.substring(lastIndex),
    });
  }

  return segments;
}

interface ColoredTextProps {
  text: string;
  className?: string;
}

export function ColoredText({ text, className = '' }: ColoredTextProps) {
  const segments = parseColorCodes(text);

  return (
    <span className={className}>
      {segments.map((segment, index) => {
        const colorClass = segment.color ? COLOR_MAP[segment.color] || '' : '';
        const classes = [colorClass, segment.bold ? 'font-bold' : '']
          .filter(Boolean)
          .join(' ');

        return (
          <span key={index} className={classes || undefined}>
            {segment.text}
          </span>
        );
      })}
    </span>
  );
}
