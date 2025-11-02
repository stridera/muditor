import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { CommonModule } from './common/common.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ZonesModule } from './zones/zones.module';
import { RoomsModule } from './rooms/rooms.module';
import { MobsModule } from './mobs/mobs.module';
import { ObjectsModule } from './objects/objects.module';
import { ShopsModule } from './shops/shops.module';
import { TriggersModule } from './triggers/triggers.module';
import { ValidationModule } from './validation/validation.module';
import { CharactersModule } from './characters/characters.module';
import { EquipmentSetsModule } from './equipment-sets/equipment-sets.module';

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
      context: ({ req, res }) => ({ req, res }),
      // Apollo Server 5 uses graphql-ws by default for subscriptions
      subscriptions: {
        'graphql-ws': {
          onConnect: (context: any) => {
            const { connectionParams } = context;
            return {
              req: {
                headers: {
                  authorization:
                    connectionParams.Authorization ||
                    connectionParams.authorization,
                },
              },
            };
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
  ],
})
export class AppModule {}
