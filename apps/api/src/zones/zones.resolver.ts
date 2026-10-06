import { RequireZoneWrite } from '../common/decorators/zone-scope.decorator';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GrantPermission, UserRole, type Users } from '@muditor/db';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GrantsService } from '../grants/grants.service';
import { CreateZoneInput, UpdateZoneInput, ZoneDto } from './zone.dto';
import { ZonesService } from './zones.service';

@Resolver(() => ZoneDto)
export class ZonesResolver {
  constructor(
    private readonly zonesService: ZonesService,
    private readonly grantsService: GrantsService
  ) {}

  @Query(() => [ZoneDto], { name: 'zones' })
  async findAll(
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number
  ): Promise<ZoneDto[]> {
    const params: { skip?: number; take?: number } = {};
    if (skip !== undefined) params.skip = skip;
    if (take !== undefined) params.take = take;
    return this.zonesService.findAll(params);
  }

  @Query(() => ZoneDto, { name: 'zone' })
  async findOne(
    @Args('id', { type: () => Int }) id: number
  ): Promise<ZoneDto | null> {
    return this.zonesService.findOne(id);
  }

  @Query(() => Int, { name: 'zonesCount' })
  async count(): Promise<number> {
    return this.zonesService.count();
  }

  /**
   * Guarded like every other zone write: BUILDER minimum role plus a WRITE
   * grant on the target zone id. A brand-new zone cannot have a pre-existing
   * grant, so in practice only the grant-bypass roles (IMPLEMENTOR, CODER,
   * HEAD_BUILDER) can create zones.
   *
   * Should creation ever be opened to plain BUILDERs, they must not create a
   * zone they cannot edit: a BUILDER creator is automatically given an ADMIN
   * grant on the new zone. Bypass roles need no grant.
   */
  @Mutation(() => ZoneDto)
  @RequireZoneWrite({ keys: ['id'] })
  async createZone(
    @Args('data') data: CreateZoneInput,
    @CurrentUser() user: Users
  ): Promise<ZoneDto> {
    const zone = await this.zonesService.create(data);
    if (user.role === UserRole.BUILDER) {
      await this.grantsService.grantZoneAccess(
        {
          userId: user.id,
          zoneId: zone.id,
          permissions: [GrantPermission.ADMIN],
        },
        user.id
      );
    }
    return zone;
  }

  @Mutation(() => ZoneDto)
  @RequireZoneWrite({ keys: ['id'] })
  async updateZone(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateZoneInput
  ): Promise<ZoneDto> {
    return this.zonesService.update(id, data);
  }

  @Mutation(() => ZoneDto)
  @RequireZoneWrite({ keys: ['id'] })
  async deleteZone(
    @Args('id', { type: () => Int }) id: number
  ): Promise<ZoneDto> {
    return this.zonesService.delete(id);
  }
}
