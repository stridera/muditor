import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import type { Request, Response } from 'express';
import { join } from 'path';
import { AbilitiesModule } from './abilities/abilities.module';
import { AuthModule } from './auth/auth.module';
import { CharactersModule } from './characters/characters.module';
import { ClassesModule } from './classes/classes.module';
import { CommonModule } from './common/common.module';
import { DatabaseModule } from './database/database.module';
import { GrantsModule } from './grants/grants.module';
import { HelpModule } from './help/help.module';
import { ServerStatusModule } from './server-status/server-status.module';
import { SiteContentModule } from './site-content/site-content.module';
import { GameLoginModule } from './game-login/game-login.module';
import { MobsModule } from './mobs/mobs.module';
import { ObjectsModule } from './objects/objects.module';
import { QuestsModule } from './quests/quests.module';
import { RacesModule } from './races/races.module';
import { RoomsModule } from './rooms/rooms.module';
import { ShopsModule } from './shops/shops.module';
import { SettingsModule } from './settings/settings.module';
import { SocialsModule } from './socials/socials.module';
import { TriggersModule } from './triggers/triggers.module';
import { UsersModule } from './users/users.module';
import { ValidationModule } from './validation/validation.module';
import { ZonesModule } from './zones/zones.module';
import { AccountStorageModule } from './account-storage/account-storage.module';
import { BoardsModule } from './boards/boards.module';
import { BridgeModule } from './bridge/bridge.module';
import { DiscordModule } from './discord/discord.module';
import { depthLimit, MAX_QUERY_DEPTH } from './common/depth-limit';
import { getJwtSecret } from './auth/jwt-secret';
import * as jwt from 'jsonwebtoken';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // .env.development is a dev-only file: never load it in production
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? ['.env', '../../.env']
          : ['.env', '../../.env', '../../.env.development'],
    }),
    CommonModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      // Never enabled in production, regardless of GRAPHQL_PLAYGROUND
      playground:
        process.env.NODE_ENV !== 'production' &&
        process.env.GRAPHQL_PLAYGROUND === 'true',
      // Introspection (Apollo Sandbox) only outside production
      introspection: process.env.NODE_ENV !== 'production',
      validationRules: [depthLimit(MAX_QUERY_DEPTH)],
      debug:
        process.env.NODE_ENV !== 'production' &&
        process.env.GRAPHQL_DEBUG === 'true',
      context: ({ req, res }: { req: Request; res: Response }) => ({
        req,
        res,
      }),
      // Apollo Server 5 uses graphql-ws by default for subscriptions
      subscriptions: {
        'graphql-ws': {
          onConnect: ctx => {
            const params = (ctx.connectionParams || {}) as Record<
              string,
              unknown
            >;
            const auth = (params['Authorization'] ||
              params['authorization']) as string | undefined;
            if (auth) {
              try {
                const token = auth.replace('Bearer ', '');
                const decoded = jwt.verify(
                  token,
                  getJwtSecret()
                ) as jwt.JwtPayload;
                return {
                  req: {
                    headers: {
                      authorization: auth,
                      userId: decoded.sub,
                    },
                  },
                };
              } catch {
                // Invalid token — fall through with auth header only
              }
            }
            return { req: { headers: { authorization: auth } } };
          },
        },
      },
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    ZonesModule,
    RoomsModule,
    MobsModule,
    ObjectsModule,
    QuestsModule,
    ShopsModule,
    TriggersModule,
    ValidationModule,
    CharactersModule,
    GrantsModule,
    AbilitiesModule,
    RacesModule,
    ClassesModule,
    SocialsModule,
    HelpModule,
    SiteContentModule,
    GameLoginModule,
    ServerStatusModule,
    SettingsModule,
    AccountStorageModule,
    BoardsModule,
    BridgeModule,
    DiscordModule,
  ],
})
export class AppModule {}
