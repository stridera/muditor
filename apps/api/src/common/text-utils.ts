/**
 * Strip XML-Lite color markup from text
 * Removes tags like <red>, <b:black>, </>, etc. leaving only plain text
 */
export function stripMarkup(markup: string): string {
  if (!markup) return '';

  // Remove all tags: opening tags, closing tags, and full resets
  return markup.replace(/<[^>]*>/g, '');
}
