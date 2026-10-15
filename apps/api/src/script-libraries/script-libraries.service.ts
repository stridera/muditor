import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@muditor/db';
import { lintLua } from '@muditor/types';
import { DatabaseService } from '../database/database.service';
import {
  CreateScriptLibraryInput,
  LIBRARY_NAME_MAX_LENGTH,
  LIBRARY_NAME_MESSAGE,
  LIBRARY_NAME_PATTERN,
  UpdateScriptLibraryInput,
} from './script-library.dto';

/** Libraries owned by a god zone are hidden from anonymous callers and mortals. */
function visibleTo(hideGodZones: boolean): Prisma.ScriptLibraryWhereInput {
  return hideGodZones
    ? { OR: [{ zoneId: null }, { zone: { isGodZone: false } }] }
    : {};
}

@Injectable()
export class ScriptLibrariesService {
  constructor(private readonly prisma: DatabaseService) {}

  findAll(hideGodZones = false) {
    return this.prisma.scriptLibrary.findMany({
      where: visibleTo(hideGodZones),
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number, hideGodZones = false) {
    const library = await this.prisma.scriptLibrary.findFirst({
      where: { id, ...visibleTo(hideGodZones) },
    });
    if (!library) {
      throw new NotFoundException(`Script library ${id} not found`);
    }
    return library;
  }

  async create(input: CreateScriptLibraryInput, userId?: string) {
    this.assertValidName(input.name);
    this.assertSyntax(input.code);
    await this.assertZoneExists(input.zoneId);
    try {
      return await this.prisma.scriptLibrary.create({
        data: {
          name: input.name,
          zoneId: input.zoneId ?? null,
          description: input.description ?? null,
          code: input.code,
          createdBy: userId ?? null,
          updatedBy: userId ?? null,
        },
      });
    } catch (err) {
      this.rethrowUnique(err, input.name);
    }
  }

  async update(id: number, input: UpdateScriptLibraryInput, userId?: string) {
    await this.findOne(id);
    if (input.name !== undefined) this.assertValidName(input.name);
    if (input.code !== undefined) this.assertSyntax(input.code);
    if (input.zoneId !== undefined) await this.assertZoneExists(input.zoneId);

    const data: Prisma.ScriptLibraryUncheckedUpdateInput = {
      updatedBy: userId ?? null,
    };
    if (input.name !== undefined) data.name = input.name;
    if (input.zoneId !== undefined) data.zoneId = input.zoneId;
    if (input.description !== undefined) data.description = input.description;
    if (input.code !== undefined) data.code = input.code;

    try {
      return await this.prisma.scriptLibrary.update({ where: { id }, data });
    } catch (err) {
      this.rethrowUnique(err, input.name ?? '');
    }
  }

  async delete(id: number) {
    await this.findOne(id);
    return this.prisma.scriptLibrary.delete({ where: { id } });
  }

  private assertValidName(name: string): void {
    if (
      name.length === 0 ||
      name.length > LIBRARY_NAME_MAX_LENGTH ||
      !LIBRARY_NAME_PATTERN.test(name)
    ) {
      throw new BadRequestException(LIBRARY_NAME_MESSAGE);
    }
  }

  /**
   * Server-side Lua syntax check (luaparse, the same parser the trigger linter
   * uses). Only hard syntax errors reject the save; lint warnings do not.
   */
  private assertSyntax(code: string): void {
    const syntax = lintLua(code).find(
      issue => issue.rule === 'syntax-error' && issue.severity === 'error'
    );
    if (syntax) {
      throw new BadRequestException(
        `Lua syntax error at line ${syntax.line}: ${syntax.message}`
      );
    }
  }

  private async assertZoneExists(zoneId: number | null | undefined) {
    if (zoneId === null || zoneId === undefined) return;
    const zone = await this.prisma.zones.findUnique({
      where: { id: zoneId },
      select: { id: true },
    });
    if (!zone) throw new BadRequestException(`Zone ${zoneId} does not exist`);
  }

  private rethrowUnique(err: unknown, name: string): never {
    if ((err as { code?: string } | null)?.code === 'P2002') {
      throw new ConflictException(`A library named "${name}" already exists`);
    }
    throw err;
  }
}
