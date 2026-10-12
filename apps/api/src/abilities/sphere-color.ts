// Grammar of a sphere colour (SphereStyle.color) exactly as the game renders it:
// fierymud-rs `tag_part_known` with `basic_color` (crates/mud-server/src/commands.rs).
// A value outside it would be ignored by the game, which then uses its built-in colour.

const MODIFIERS = new Set([
  'b',
  'u',
  'i',
  's',
  'd',
  'dim',
  'blink',
  'reverse',
  'hide',
]);

// The eight base colours plus the aliases `brown`, `purple`, `teal` and `orange`.
// Semantic tag aliases (`<fire>`, `<danger>`) are not allowed, so colours cannot recurse.
const BASIC_COLORS = new Set([
  'black',
  'red',
  'green',
  'yellow',
  'brown',
  'blue',
  'purple',
  'magenta',
  'cyan',
  'teal',
  'white',
  'orange',
]);

const HEX6 = /^[0-9a-f]{6}$/;

function isAnsi256Index(s: string): boolean {
  return /^[0-9]{1,3}$/.test(s) && Number(s) <= 255;
}

function isTagPart(part: string): boolean {
  if (MODIFIERS.has(part)) return true;
  if (part.startsWith('bg-')) return BASIC_COLORS.has(part.slice(3));
  if (part.startsWith('bg#')) return HEX6.test(part.slice(3));
  if (part.startsWith('#')) return HEX6.test(part.slice(1));
  if (part.startsWith('bgc') && isAnsi256Index(part.slice(3))) return true;
  if (part.startsWith('c') && isAnsi256Index(part.slice(1))) return true;
  return BASIC_COLORS.has(part);
}

/** True when `color` (already trimmed and lowercased) is a tag body the game renders. */
export function isRenderableSphereColor(color: string): boolean {
  return color.split(':').every(isTagPart);
}
