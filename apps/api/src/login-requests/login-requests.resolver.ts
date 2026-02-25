import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import type { Observable } from 'rxjs';
import { map } from 'rxjs';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { BridgeService } from '../bridge/bridge.service';
import { GameEventType } from '../bridge/game-event.dto';
import { LoginRequestDto } from './login-requests.dto';
import { LoginRequestsService } from './login-requests.service';

/**
 * Convert an RxJS Observable into an AsyncIterableIterator
 * required by GraphQL subscription resolvers.
 */
function toAsyncIterable<T>(
  observable: Observable<T>
): AsyncIterableIterator<T> {
  const pullQueue: Array<{
    resolve: (result: IteratorResult<T>) => void;
    reject: (error: unknown) => void;
  }> = [];
  const pushQueue: T[] = [];
  let done = false;

  const subscription = observable.subscribe({
    next(value: T) {
      if (pullQueue.length > 0) {
        pullQueue.shift()!.resolve({ value, done: false });
      } else {
        pushQueue.push(value);
      }
    },
    error(err: unknown) {
      done = true;
      for (const waiter of pullQueue.splice(0)) {
        waiter.reject(err);
      }
    },
    complete() {
      done = true;
      for (const waiter of pullQueue.splice(0)) {
        waiter.resolve({ value: undefined as unknown as T, done: true });
      }
    },
  });

  return {
    next(): Promise<IteratorResult<T>> {
      if (pushQueue.length > 0) {
        return Promise.resolve({ value: pushQueue.shift()!, done: false });
      }
      if (done) {
        return Promise.resolve({
          value: undefined as unknown as T,
          done: true,
        });
      }
      return new Promise((resolve, reject) => {
        pullQueue.push({ resolve, reject });
      });
    },
    return(): Promise<IteratorResult<T>> {
      subscription.unsubscribe();
      done = true;
      for (const waiter of pullQueue.splice(0)) {
        waiter.resolve({ value: undefined as unknown as T, done: true });
      }
      return Promise.resolve({ value: undefined as unknown as T, done: true });
    },
    throw(err: unknown): Promise<IteratorResult<T>> {
      subscription.unsubscribe();
      done = true;
      return Promise.reject(err);
    },
    [Symbol.asyncIterator]() {
      return this;
    },
  };
}

@Resolver()
export class LoginRequestsResolver {
  constructor(
    private readonly loginRequestsService: LoginRequestsService,
    private readonly bridgeService: BridgeService
  ) {}

  @Query(() => [LoginRequestDto])
  @UseGuards(GraphQLJwtAuthGuard)
  async pendingLoginRequests(
    @CurrentUser('id') userId: string
  ): Promise<LoginRequestDto[]> {
    return this.loginRequestsService.getPendingRequests(userId);
  }

  @Mutation(() => LoginRequestDto)
  @UseGuards(GraphQLJwtAuthGuard)
  async approveLoginRequest(
    @Args('requestId') requestId: string,
    @CurrentUser('id') userId: string
  ): Promise<LoginRequestDto> {
    return this.loginRequestsService.approveRequest(requestId, userId);
  }

  @Mutation(() => LoginRequestDto)
  @UseGuards(GraphQLJwtAuthGuard)
  async denyLoginRequest(
    @Args('requestId') requestId: string,
    @CurrentUser('id') userId: string
  ): Promise<LoginRequestDto> {
    return this.loginRequestsService.denyRequest(requestId, userId);
  }

  @Subscription(() => LoginRequestDto, {
    description: 'Subscribe to new login request events for the current user',
    filter: (payload, _variables, context) => {
      const userId = context?.req?.headers?.userId;
      return payload?.userId === userId;
    },
    resolve: (payload: LoginRequestDto) => payload,
  })
  loginRequestCreated() {
    return toAsyncIterable(
      this.bridgeService
        .getEventsByTypes([GameEventType.AUTH_LOGIN_REQUEST])
        .pipe(map(event => event.metadata as unknown as LoginRequestDto))
    );
  }
}
