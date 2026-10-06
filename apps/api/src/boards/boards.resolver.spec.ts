import { ForbiddenException } from '@nestjs/common';
import { UserRole, type Users } from '@muditor/db';
import { BoardMessagesResolver, BoardsResolver } from './boards.resolver';
import type { BoardsService } from './boards.service';

const user = (id: string, displayName: string, role: UserRole): Users =>
  ({ id, displayName, role }) as unknown as Users;

const author = user('u-author', 'Alice', UserRole.BUILDER);
const stranger = user('u-stranger', 'Mallory', UserRole.PLAYER);
const immortal = user('u-imm', 'Zeus', UserRole.IMMORTAL);
const player = user('u-player', 'Pat', UserRole.PLAYER);

function makeService() {
  const message = {
    id: 7,
    boardId: 1,
    poster: 'Alice',
    posterLevel: 102,
    postedAt: new Date(),
    subject: 's',
    content: 'c',
    sticky: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    edits: [],
  };
  return {
    findMessageById: jest.fn().mockResolvedValue(message),
    updateMessage: jest.fn().mockResolvedValue(message),
    deleteMessage: jest.fn().mockResolvedValue(message),
    createMessage: jest.fn().mockResolvedValue(message),
    getPosterIdentity: jest.fn(async (u: Users) => ({
      names: [u.displayName],
      level: 102,
    })),
    createBoard: jest.fn().mockResolvedValue({
      id: 1,
      alias: 'a',
      title: 't',
      locked: false,
      privileges: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    updateBoard: jest.fn(),
    deleteBoard: jest.fn(),
  };
}

describe('BoardMessagesResolver authorization', () => {
  let service: ReturnType<typeof makeService>;
  let resolver: BoardMessagesResolver;

  beforeEach(() => {
    service = makeService();
    resolver = new BoardMessagesResolver(service as unknown as BoardsService);
  });

  it('forbids a non-author non-staff user editing a message', async () => {
    await expect(
      resolver.updateBoardMessage(7, { content: 'defaced' }, stranger)
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(service.updateMessage).not.toHaveBeenCalled();
  });

  it('forbids a non-author non-staff user deleting a message', async () => {
    await expect(
      resolver.deleteBoardMessage(7, stranger)
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(service.deleteMessage).not.toHaveBeenCalled();
  });

  it('lets the author edit, recording the authenticated user as editor (ignores client editor)', async () => {
    await resolver.updateBoardMessage(
      7,
      { content: 'fixed' },
      author,
      'SomeoneElse'
    );
    expect(service.updateMessage).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ content: 'fixed' }),
      'Alice'
    );
  });

  it('lets IMMORTAL+ edit and delete any message', async () => {
    await resolver.updateBoardMessage(7, { sticky: true }, immortal);
    await resolver.deleteBoardMessage(7, immortal);
    expect(service.updateMessage).toHaveBeenCalledWith(
      7,
      expect.anything(),
      'Zeus'
    );
    expect(service.deleteMessage).toHaveBeenCalledWith(7);
  });

  it('forbids posting under a name the caller does not own, and derives level server-side', async () => {
    await expect(
      resolver.createBoardMessage(
        {
          boardId: 1,
          poster: 'Alice',
          posterLevel: 105,
          subject: 's',
          content: 'c',
        },
        stranger
      )
    ).rejects.toBeInstanceOf(ForbiddenException);

    await resolver.createBoardMessage(
      {
        boardId: 1,
        poster: 'alice',
        posterLevel: 105,
        subject: 's',
        content: 'c',
      },
      author
    );
    expect(service.createMessage).toHaveBeenCalledWith(
      expect.objectContaining({ poster: 'Alice', posterLevel: 102 })
    );
  });
});

describe('BoardsResolver authorization', () => {
  it('requires BUILDER+ to create, update and delete boards', async () => {
    const service = makeService();
    const resolver = new BoardsResolver(service as unknown as BoardsService);

    await expect(
      resolver.createBoard({ alias: 'a', title: 't' }, player)
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      resolver.updateBoard(1, { title: 'x' }, immortal)
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(resolver.deleteBoard(1, player)).rejects.toBeInstanceOf(
      ForbiddenException
    );
    expect(service.createBoard).not.toHaveBeenCalled();
    expect(service.updateBoard).not.toHaveBeenCalled();
    expect(service.deleteBoard).not.toHaveBeenCalled();

    await resolver.createBoard({ alias: 'a', title: 't' }, author);
    expect(service.createBoard).toHaveBeenCalledTimes(1);
  });
});
