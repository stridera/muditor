/**
 * Turn heading text into the anchor id used by the help guides.
 * "Phases & Objectives tab" -> "phases-objectives-tab".
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-');
}

/** DOM id for a heading anchor inside a help drawer. */
export function helpAnchorId(slug: string): string {
  return `help-${slug}`;
}
