import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ZonesModule } from './zones/zones.module';
import { RoomsModule } from './rooms/rooms.module';
import { MobsModule } from './mobs/mobs.module';
import { ObjectsModule } from './objects/objects.module';
import { ShopsModule } from './shops/shops.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: process.env.GRAPHQL_PLAYGROUND === 'true',
      debug: process.env.GRAPHQL_DEBUG === 'true',
      context: ({ req, res }) => ({ req, res }),
      subscriptions: {
        'subscriptions-transport-ws': {
          onConnect: (connectionParams: any, webSocket: any) => {
            return {
              req: {
                headers: {
                  authorization: connectionParams.Authorization || connectionParams.authorization,
                },
              },
            };
          },
        },
        'graphql-ws': {
          onConnect: (context: any) => {
            const { connectionParams } = context;
            return {
              req: {
                headers: {
                  authorization: connectionParams.Authorization || connectionParams.authorization,
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
  ],
})
export class AppModule {}