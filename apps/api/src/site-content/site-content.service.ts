import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserRole, type SiteContentKind } from '@muditor/db';
import { roleAtLeast } from '../auth/role.util';
import { DatabaseService } from '../database/database.service';
import type {
  CreateSiteContentInput,
  UpdateSiteContentInput,
} from './site-content.input';

type Viewer = { role?: UserRole | null } | null | undefined;

/** Max rows returned to anonymous callers (cheap abuse guard). */
const ANONYMOUS_MAX_ROWS = 200;

@Injectable()
export class SiteContentService {
  constructor(private readonly db: DatabaseService) {}

  /** Drafts are only visible to BUILDER and above. */
  private canSeeDrafts(viewer: Viewer): boolean {
    return roleAtLeast(viewer?.role, UserRole.BUILDER);
  }

  /**
   * List site content. Anonymous/low-role callers only ever get published
   * rows; BUILDER+ may pass publishedOnly=false to include drafts.
   */
  async findAll(
    kind: SiteContentKind | undefined,
    publishedOnly: boolean,
    viewer: Viewer
  ) {
    const where: Prisma.SiteContentWhereInput = {};
    if (kind) {
      where.kind = kind;
    }
    if (publishedOnly || !this.canSeeDrafts(viewer)) {
      where.published = true;
    }

    return this.db.siteContent.findMany({
      where,
      ...(!viewer && { take: ANONYMOUS_MAX_ROWS }),
      orderBy: [
        { sortOrder: 'asc' },
        { publishedAt: { sort: 'desc', nulls: 'last' } },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Find a single piece of content by slug. Unpublished content is treated
   * as not found unless the caller is BUILDER+.
   */
  async findBySlug(slug: string, viewer: Viewer) {
    const where: Prisma.SiteContentWhereInput = { slug };
    if (!this.canSeeDrafts(viewer)) {
      where.published = true;
    }

    const entry = await this.db.siteContent.findFirst({ where });
    if (!entry) {
      throw new NotFoundException(`Site content "${slug}" not found`);
    }
    return entry;
  }

  /**
   * Create site content. Requires BUILDER role (enforced by resolver guard).
   */
  async create(data: CreateSiteContentInput, authorId: string) {
    await this.assertSlugFree(data.slug);

    return this.db.siteContent.create({
      data: {
        slug: data.slug,
        kind: data.kind,
        title: data.title,
        summary: data.summary ?? null,
        body: data.body,
        published: data.published,
        publishedAt: data.published ? new Date() : null,
        sortOrder: data.sortOrder,
        authorId,
      },
    });
  }

  /**
   * Update site content. Requires BUILDER role (enforced by resolver guard).
   */
  async update(id: string, data: UpdateSiteContentInput) {
    const existing = await this.ensureExists(id);

    if (data.slug != null && data.slug !== existing.slug) {
      await this.assertSlugFree(data.slug);
    }

    const updateData: Prisma.SiteContentUpdateInput = {};
    if (data.slug != null) updateData.slug = data.slug;
    if (data.kind != null) updateData.kind = data.kind;
    if (data.title != null) updateData.title = data.title;
    if (data.summary !== undefined) updateData.summary = data.summary;
    if (data.body != null) updateData.body = data.body;
    if (data.sortOrder != null) updateData.sortOrder = data.sortOrder;
    if (data.published != null) {
      updateData.published = data.published;
      // Stamp the first publish time; keep it stable across later edits.
      if (data.published && !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    return this.db.siteContent.update({ where: { id }, data: updateData });
  }

  /**
   * Delete site content. Requires BUILDER role (enforced by resolver guard).
   */
  async remove(id: string) {
    await this.ensureExists(id);
    return this.db.siteContent.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const entry = await this.db.siteContent.findUnique({ where: { id } });
    if (!entry) {
      throw new NotFoundException(`Site content with ID ${id} not found`);
    }
    return entry;
  }

  private async assertSlugFree(slug: string) {
    const clash = await this.db.siteContent.findUnique({ where: { slug } });
    if (clash) {
      throw new BadRequestException(
        `Site content with slug "${slug}" already exists`
      );
    }
  }
}
