/**
 * Turn the TagInput string ("sword, iron long") into a keyword array.
 * TagInput joins tags with ", ", and GraphQL would coerce that single string
 * into a one-element list (["sword, iron"]), so split on commas and
 * whitespace and drop empties/duplicates.
 */
export function parseKeywords(input: string | readonly string[]): string[] {
  const parts = Array.isArray(input) ? input : [input];
  const seen = new Set<string>();
  for (const part of parts as string[]) {
    for (const kw of String(part).split(/[\s,]+/)) {
      if (kw) seen.add(kw);
    }
  }
  return [...seen];
}

/** Form-state string for the TagInput from the stored keyword array. */
export function keywordsToInput(keywords: unknown): string {
  if (Array.isArray(keywords))
    return parseKeywords(keywords as string[]).join(', ');
  return typeof keywords === 'string' ? keywords : '';
}
