import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType('PublicServerStatus', {
  description: 'Public game server status (no authentication required)',
})
export class PublicServerStatusDto {
  @Field({ description: 'True when the game server answered the status probe' })
  online: boolean;

  @Field(() => Int, { nullable: true, description: 'Players currently online' })
  playersOnline?: number | null;

  @Field(() => Int, {
    nullable: true,
    description:
      'Seconds since the game server started (null when the server does not report it)',
  })
  uptimeSeconds?: number | null;

  @Field(() => Int, { nullable: true, description: 'Current world tick' })
  tick?: number | null;

  @Field({ description: 'Public hostname players connect to' })
  host: string;

  @Field(() => Int, { description: 'Public telnet port' })
  port: number;

  @Field(() => Int, { nullable: true, description: 'Public TLS port' })
  tlsPort?: number | null;
}
