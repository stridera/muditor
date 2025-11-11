import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import type { Request, Response } from 'express';
import { join } from 'path';
import { AbilitiesModule } from './abilities/abilities.module';
import { AuthModule } from './auth/auth.module';
import { CharactersModule } from './characters/characters.module';
import { ClassesModule } from './classes/classes.module';
import { CommonModule } from './common/common.module';
import { DatabaseModule } from './database/database.module';
import { EquipmentSetsModule } from './equipment-sets/equipment-sets.module';
import { GrantsModule } from './grants/grants.module';
import { MobsModule } from './mobs/mobs.module';
import { ObjectsModule } from './objects/objects.module';
import { RacesModule } from './races/races.module';
import { RoomsModule } from './rooms/rooms.module';
import { ShopsModule } from './shops/shops.module';
import { TriggersModule } from './triggers/triggers.module';
import { UsersModule } from './users/users.module';
import { ValidationModule } from './validation/validation.module';
import { ZonesModule } from './zones/zones.module';

@Module({
  imports: [
    CommonModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: process.env.GRAPHQL_PLAYGROUND === 'true',
      introspection: true, // Required for Apollo Sandbox in Apollo Server 5
      debug: process.env.GRAPHQL_DEBUG === 'true',
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
    ShopsModule,
    TriggersModule,
    ValidationModule,
    CharactersModule,
    EquipmentSetsModule,
    GrantsModule,
    AbilitiesModule,
    RacesModule,
    ClassesModule,
  ],
})
export class AppModule {}
