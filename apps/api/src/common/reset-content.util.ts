import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ObjectType } from '@muditor/db';

/** Object types that can hold other objects in a reset (legacy `P` command). */
export const CONTAINER_TYPES: readonly ObjectType[] = [ObjectType.CONTAINER];

/**
 * Surfaces a failed update/delete of a reset row: a missing row (Prisma P2025)
 * becomes a NotFoundException, anything else is rethrown untouched so real
 * failures (bad input, DB down) are never reported as a quiet `false`.
 */
export function rethrowResetRowError(
  e: unknown,
  what: string,
  id: number
): never {
  if ((e as { code?: string } | null)?.code === 'P2025') {
    throw new NotFoundException(`${what} ${id} not found`);
  }
  throw e;
}

/** Turns a foreign-key failure on a reset write into a message a builder can act on. */
export function rethrowResetWriteError(e: unknown): never {
  // Duck-typed like the other services: the Prisma error class is not
  // re-exported by @muditor/db.
  if ((e as { code?: string } | null)?.code === 'P2003') {
    throw new BadRequestException(
      'The mob, object or room this reset points at does not exist'
    );
  }
  throw e;
}

export function assertContainerObject(
  obj: { type: ObjectType; name: string; id: number; zoneId: number },
  role = 'container'
): void {
  if (!CONTAINER_TYPES.includes(obj.type)) {
    throw new BadRequestException(
      `${obj.name} (${obj.zoneId}:${obj.id}) is a ${obj.type} object, not a container; only CONTAINER objects can hold the ${role}'s contents`
    );
  }
}

interface ContentRow {
  id: number;
  parentContentId: number | null;
}

/**
 * The parent of a new content row must be an existing row of the same
 * container (never another reset's) so nesting stays a tree per container.
 */
export function assertSameTree<T extends ContentRow>(
  parent: T | null,
  parentContentId: number
): asserts parent is T {
  if (!parent) {
    throw new BadRequestException(
      `Parent content ${parentContentId} does not belong to this container`
    );
  }
}
