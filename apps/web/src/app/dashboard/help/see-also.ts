/**
 * Parse the "See also:" line of a help entry into display references.
 *
 * Case is preserved (legacy help writes them in caps; the lookup query
 * lowercases server-side), so the links read the way the author wrote them.
 */
export function parseSeeAlso(content: string): string[] {
  const seeAlsoMatch = content.match(/See\s+also\s*:?\s*(.+?)(?:\n\n|\n$|$)/i);
  if (!seeAlsoMatch || !seeAlsoMatch[1]) return [];

  return seeAlsoMatch[1]
    .split(/[,]|\s+and\s+|\s{2,}/)
    .map(ref => ref.trim().replace(/^["']+|["'.]+$/g, ''))
    .filter(ref => ref.length > 0 && ref.toLowerCase() !== 'and');
}
