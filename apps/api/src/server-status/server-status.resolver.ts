import { Query, Resolver } from '@nestjs/graphql';
import { PublicServerStatusDto } from './server-status.dto';
import { ServerStatusService } from './server-status.service';

@Resolver(() => PublicServerStatusDto)
export class ServerStatusResolver {
  constructor(private readonly serverStatusService: ServerStatusService) {}

  // Public: no guard. Safe because only coarse status is exposed and results
  // are cached for 15s, so callers cannot amplify load on the game server.
  @Query(() => PublicServerStatusDto, {
    name: 'publicServerStatus',
    description: 'Public game server status (cached for 15 seconds)',
  })
  async publicServerStatus() {
    return this.serverStatusService.getStatus();
  }
}
