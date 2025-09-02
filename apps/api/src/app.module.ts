import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

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
  ],
})
export class AppModule {}