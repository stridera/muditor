import * as PrismaBrowser from '../../../packages/db/src/generated/prisma/browser';
import * as PrismaNamespace from '../../../packages/db/src/generated/prisma/internal/prismaNamespaceBrowser';

export * from '../../../packages/db/src/generated/prisma/enums';
export * from '../../../packages/db/src/generated/prisma/models';
export const Prisma = PrismaNamespace;
export const $Enums = PrismaBrowser.$Enums;

export class PrismaClient {
  constructor(_options?: unknown) {}

  $extends(_extensions?: unknown) {
    return this;
  }

  async $connect() {}
  async $disconnect() {}
  async $queryRaw() {
    return [];
  }
}
