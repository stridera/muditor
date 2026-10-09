import { ForbiddenException, NotFoundException } from '@nestjs/common';
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
    findBoardPrivileges: jest.fn().mockResolvedValue({
      locked: false,
      privileges: [{ privilege: 'WriteNew', level: 0 }],
    }),
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

describe('createBoardMessage board privileges', () => {
  const input = (extra = {}) => ({
    boardId: 1,
    poster: 'Pat',
    posterLevel: 1,
    subject: 's',
    content: 'c',
    ...extra,
  });
  const setup = (board: unknown) => {
    const service = makeService();
    service.findBoardPrivileges.mockResolvedValue(board);
    return {
      service,
      resolver: new BoardMessagesResolver(service as unknown as BoardsService),
    };
  };

  it('refuses posting on a board without a write rule (staff boards)', async () => {
    const { service, resolver } = setup({ locked: false, privileges: [] });
    await expect(
      resolver.createBoardMessage(input(), player)
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(service.createMessage).not.toHaveBeenCalled();
    // read-only board: READ alone is not enough
    const readOnly = setup({
      locked: false,
      privileges: [{ privilege: 'Read', level: 0 }],
    });
    await expect(
      readOnly.resolver.createBoardMessage(input(), player)
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows a player to post where the write rule is open', async () => {
    const { service, resolver } = setup({
      locked: false,
      privileges: [{ privilege: 'WriteNew', level: 0, maxLevel: 105 }],
    });
    await resolver.createBoardMessage(input(), player);
    expect(service.createMessage).toHaveBeenCalled();
  });

  it('refuses a rule whose level maps to a staff role', async () => {
    const { resolver } = setup({
      locked: false,
      privileges: [{ privilege: 1, minLevel: 101 }],
    });
    await expect(
      resolver.createBoardMessage(input(), player)
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('needs the sticky privilege for sticky posts', async () => {
    const { service, resolver } = setup({
      locked: false,
      privileges: [{ privilege: 'WriteNew', level: 0 }],
    });
    await expect(
      resolver.createBoardMessage(input({ sticky: true }), player)
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(service.createMessage).not.toHaveBeenCalled();
    const open = setup({
      locked: false,
      privileges: [
        { privilege: 'WriteNew', level: 0 },
        { privilege: 'WriteSticky', level: 0 },
      ],
    });
    await open.resolver.createBoardMessage(input({ sticky: true }), player);
    expect(open.service.createMessage).toHaveBeenCalled();
  });

  it('refuses posts on a locked board below BUILDER, even with the write rule', async () => {
    const board = {
      locked: true,
      privileges: [{ privilege: 'WriteNew', level: 0 }],
    };
    const { service, resolver } = setup(board);
    await expect(
      resolver.createBoardMessage(input(), player)
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      resolver.createBoardMessage(input({ poster: 'Zeus' }), immortal)
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(service.createMessage).not.toHaveBeenCalled();
    await resolver.createBoardMessage(input({ poster: 'Alice' }), author);
    expect(service.createMessage).toHaveBeenCalled();
  });

  it('404s on a missing board', async () => {
    const { resolver } = setup(null);
    await expect(
      resolver.createBoardMessage(input(), player)
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('only staff or the sticky privilege may pin on edit', async () => {
    const service = makeService();
    const resolver = new BoardMessagesResolver(
      service as unknown as BoardsService
    );
    service.findMessageById.mockResolvedValue({
      id: 7,
      poster: 'Pat',
      sticky: false,
      board: { privileges: [] },
    });
    await expect(
      resolver.updateBoardMessage(7, { sticky: true }, player)
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(service.updateMessage).not.toHaveBeenCalled();
  });

  it('existing posting tests still pass for authors on open boards', async () => {
    const { service, resolver } = setup({
      locked: false,
      privileges: [{ privilege: 1, minLevel: 0 }],
    });
    await resolver.createBoardMessage(input(), player);
    expect(service.createMessage).toHaveBeenCalled();
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

describe('board reads respect Board.privileges', () => {
  const now = new Date();
  const board = (id: number, privileges: unknown) => ({
    id,
    alias: `b${id}`,
    title: `Board ${id}`,
    locked: false,
    privileges,
    createdAt: now,
    updatedAt: now,
    _count: { messages: 2 },
  });
  const publicBoard = board(1, [0, 1, 2, 3, 4, 5, 6, 7]);
  const godBoard = board(2, []);
  const message = (boardId: number) => ({
    id: boardId * 10,
    boardId,
    poster: 'x',
    posterLevel: 1,
    postedAt: now,
    subject: 's',
    content: 'c',
    sticky: false,
    createdAt: now,
    updatedAt: now,
    edits: [],
  });

  function build() {
    const service = {
      findAllBoards: jest.fn().mockResolvedValue([publicBoard, godBoard]),
      findBoardById: jest.fn(async (id: number) =>
        id === 1 ? publicBoard : godBoard
      ),
      findBoardByAlias: jest.fn(async (a: string) =>
        a === 'b1' ? publicBoard : godBoard
      ),
      countBoards: jest.fn().mockResolvedValue(2),
      findBoardPrivileges: jest.fn(async (id: number) =>
        id === 1 ? publicBoard : id === 2 ? godBoard : null
      ),
      findMessagesByBoard: jest.fn(async (id: number) => [message(id)]),
      findMessageById: jest.fn(async (id: number) => ({
        ...message(id / 10),
        board: id === 10 ? publicBoard : godBoard,
      })),
      countMessages: jest.fn().mockResolvedValue(5),
    };
    return {
      service,
      boards: new BoardsResolver(service as unknown as BoardsService),
      messages: new BoardMessagesResolver(service as unknown as BoardsService),
    };
  }

  it('anonymous callers only see public boards', async () => {
    const { boards } = build();
    const list = await boards.findAllBoards(null);
    expect(list.map(b => b.id)).toEqual([1]);
    expect(await boards.countBoards(null)).toBe(1);
    expect(await boards.findBoard(null, 1)).not.toBeNull();
    expect(await boards.findBoard(null, 2)).toBeNull();
    expect(await boards.findBoard(null, undefined, 'b2')).toBeNull();
  });

  it('players do not see staff boards but IMMORTAL+ see everything', async () => {
    const { boards } = build();
    expect((await boards.findAllBoards(player)).map(b => b.id)).toEqual([1]);
    expect((await boards.findAllBoards(immortal)).map(b => b.id)).toEqual([
      1, 2,
    ]);
    expect(await boards.findBoard(immortal, 2)).not.toBeNull();
    expect(await boards.countBoards(immortal)).toBe(2);
  });

  it('pages after filtering', async () => {
    const { boards } = build();
    const page = await boards.findAllBoards(immortal, 1, 1);
    expect(page.map(b => b.id)).toEqual([2]);
  });

  it('boardMessages: forbids anonymous reads of a staff board, allows public', async () => {
    const { messages, service } = build();
    await expect(messages.findMessages(null, 2)).rejects.toBeInstanceOf(
      ForbiddenException
    );
    expect(service.findMessagesByBoard).not.toHaveBeenCalled();
    expect(await messages.findMessages(null, 1)).toHaveLength(1);
    expect(await messages.findMessages(immortal, 2)).toHaveLength(1);
    expect(await messages.findMessages(null, 99)).toEqual([]);
  });

  it('boardMessage hides messages of staff boards from the public', async () => {
    const { messages } = build();
    expect(await messages.findMessage(null, 20)).toBeNull();
    expect(await messages.findMessage(player, 20)).toBeNull();
    expect(await messages.findMessage(null, 10)).not.toBeNull();
    expect(await messages.findMessage(immortal, 20)).not.toBeNull();
  });

  it('boardMessagesCount does not leak staff board counts', async () => {
    const { messages } = build();
    await expect(messages.countMessages(null, 2)).rejects.toBeInstanceOf(
      ForbiddenException
    );
    expect(await messages.countMessages(null)).toBe(2); // only the public board
    expect(await messages.countMessages(immortal)).toBe(5);
  });
});
