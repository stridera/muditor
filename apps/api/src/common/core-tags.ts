import { BadRequestException } from '@nestjs/common';

const CORE_PREFIX = 'core:';

/** Trim, drop blanks and exact repeats; keeps the first-seen order. */
export function normalizeTags(tags: readonly string[]): string[] {
  return [...new Set(tags.map(t => t.trim()).filter(t => t.length > 0))];
}

/** The engine-binding `core:<role>` tags in a list. */
export function coreTagsOf(tags: readonly string[]): string[] {
  return tags.filter(t => t.startsWith(CORE_PREFIX));
}

/**
 * `core:<role>` tags bind one row to an engine feature ("keep exactly one
 * class per role"). Reject a malformed tag, or one that another row already
 * carries. `findHolders` returns the other rows holding any of `core`.
 */
export async function assertCoreTagsUnique(
  kind: 'class' | 'ability',
  core: readonly string[],
  findHolders: (
    core: string[]
  ) => Promise<Array<{ name: string; tags: string[] }>>
): Promise<void> {
  for (const tag of core) {
    if (tag.length === CORE_PREFIX.length || /\s/.test(tag)) {
      throw new BadRequestException(
        `Invalid tag "${tag}": core tags look like core:<role> with no spaces`
      );
    }
  }
  if (core.length === 0) return;
  const holders = await findHolders([...core]);
  for (const holder of holders) {
    const clash = holder.tags.find(t => core.includes(t));
    if (clash) {
      throw new BadRequestException(
        `The tag ${clash} is already used by the ${kind} "${holder.name}"; a core tag may only be on one ${kind}`
      );
    }
  }
}
