import { ForbiddenException, UseGuards, applyDecorators } from '@nestjs/common';
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import type { Users } from '@muditor/db';
import { UserRole } from '@muditor/db';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { roleAtLeast } from '../auth/role.util';
import { RequireZoneWrite } from '../common/decorators/zone-scope.decorator';
import { hidesGodZones } from '../common/god-zone-visibility';
import {
  CreateScriptLibraryInput,
  ScriptLibraryDto,
  UpdateScriptLibraryInput,
} from './script-library.dto';
import { ScriptLibrariesService } from './script-libraries.service';

/**
 * Write rules for libraries (enforced by the standard zone guards):
 *   - HEAD_BUILDER and above: any library, including global ones (no zone)
 *   - BUILDER: only libraries whose zone they hold a WRITE/ADMIN grant on.
 *     A global library (zoneId null) has no zone to check, so the guard
 *     denies it (fail closed).
 *   - IMMORTAL and PLAYER: never.
 * Reads are public, like triggers (libraries in god zones: IMMORTAL+).
 */
/** Update/delete address a library by id; its zone is looked up. */
const LibraryWriteById = () =>
  applyDecorators(
    RequireZoneWrite({
      lookup: {
        arg: 'id',
        resolve: (db, id) =>
          db.scriptLibrary
            .findUnique({ where: { id }, select: { zoneId: true } })
            .then(row => row?.zoneId),
      },
    })
  );

@Resolver(() => ScriptLibraryDto)
export class ScriptLibrariesResolver {
  constructor(private readonly libraries: ScriptLibrariesService) {}

  @ResolveField(() => Int)
  lineCount(@Parent() library: Pick<ScriptLibraryDto, 'code'>): number {
    return (library.code ?? '')
      .split('\n')
      .filter(line => line.trim().length > 0).length;
  }

  @Query(() => [ScriptLibraryDto], { name: 'scriptLibraries' })
  @UseGuards(OptionalJwtAuthGuard)
  findAll(@CurrentUser() user?: Users | null) {
    return this.libraries.findAll(hidesGodZones(user ?? null));
  }

  @Query(() => ScriptLibraryDto, { name: 'scriptLibrary' })
  @UseGuards(OptionalJwtAuthGuard)
  findOne(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user?: Users | null
  ) {
    return this.libraries.findOne(id, hidesGodZones(user ?? null));
  }

  @Mutation(() => ScriptLibraryDto)
  @RequireZoneWrite()
  createScriptLibrary(
    @Args('input') input: CreateScriptLibraryInput,
    @CurrentUser() user: Users
  ) {
    return this.libraries.create(input, user.id);
  }

  @Mutation(() => ScriptLibraryDto)
  @LibraryWriteById()
  updateScriptLibrary(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateScriptLibraryInput,
    @CurrentUser() user: Users
  ) {
    // `zoneId: null` would make the library global, which only HEAD_BUILDER+
    // may do: the guard sees the library's old zone, not the new (null) one.
    if (
      input.zoneId === null &&
      !roleAtLeast(user.role, UserRole.HEAD_BUILDER)
    ) {
      throw new ForbiddenException(
        'Only a head builder can make a library global'
      );
    }
    return this.libraries.update(id, input, user.id);
  }

  @Mutation(() => ScriptLibraryDto)
  @LibraryWriteById()
  deleteScriptLibrary(@Args('id', { type: () => Int }) id: number) {
    return this.libraries.delete(id);
  }
}
