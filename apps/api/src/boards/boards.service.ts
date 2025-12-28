import { Injectable } from '@nestjs/common';
import { Board, BoardMessage, BoardMessageEdit, Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class BoardsService {
  constructor(private readonly database: DatabaseService) {}

  // Board operations
  async findAllBoards(args?: {
    skip?: number;
    take?: number;
    search?: string;
    includeMessages?: boolean;
  }): Promise<Board[]> {
    const whereClause: Prisma.BoardWhereInput = {};

    if (args?.search?.trim()) {
      whereClause.OR = [
        { alias: { contains: args.search, mode: 'insensitive' } },
        { title: { contains: args.search, mode: 'insensitive' } },
      ];
    }

    const findManyArgs: Prisma.BoardFindManyArgs = {
      where: whereClause,
      orderBy: { alias: 'asc' },
      include: {
        messages: args?.includeMessages
          ? {
              orderBy: [{ sticky: 'desc' }, { postedAt: 'desc' }],
              include: { edits: true },
            }
          : false,
        _count: { select: { messages: true } },
      },
    };

    if (args?.skip !== undefined) findManyArgs.skip = args.skip;
    if (args?.take !== undefined) findManyArgs.take = args.take;

    return this.database.board.findMany(findManyArgs);
  }

  async findBoardById(id: number): Promise<Board | null> {
    return this.database.board.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: [{ sticky: 'desc' }, { postedAt: 'desc' }],
          include: { edits: { orderBy: { editedAt: 'asc' } } },
        },
        _count: { select: { messages: true } },
      },
    });
  }

  async findBoardByAlias(alias: string): Promise<Board | null> {
    return this.database.board.findUnique({
      where: { alias },
      include: {
        messages: {
          orderBy: [{ sticky: 'desc' }, { postedAt: 'desc' }],
          include: { edits: { orderBy: { editedAt: 'asc' } } },
        },
        _count: { select: { messages: true } },
      },
    });
  }

  async countBoards(where?: Prisma.BoardWhereInput): Promise<number> {
    const countArgs: Prisma.BoardCountArgs = {};
    if (where) countArgs.where = where;
    return this.database.board.count(countArgs);
  }

  async createBoard(data: Prisma.BoardCreateInput): Promise<Board> {
    return this.database.board.create({
      data,
      include: { _count: { select: { messages: true } } },
    });
  }

  async updateBoard(id: number, data: Prisma.BoardUpdateInput): Promise<Board> {
    return this.database.board.update({
      where: { id },
      data,
      include: { _count: { select: { messages: true } } },
    });
  }

  async deleteBoard(id: number): Promise<Board> {
    return this.database.board.delete({ where: { id } });
  }

  // Message operations
  async findMessagesByBoard(
    boardId: number,
    args?: { skip?: number; take?: number }
  ): Promise<BoardMessage[]> {
    const findManyArgs: Prisma.BoardMessageFindManyArgs = {
      where: { boardId },
      orderBy: [{ sticky: 'desc' }, { postedAt: 'desc' }],
      include: { edits: { orderBy: { editedAt: 'asc' } } },
    };

    if (args?.skip !== undefined) findManyArgs.skip = args.skip;
    if (args?.take !== undefined) findManyArgs.take = args.take;

    return this.database.boardMessage.findMany(findManyArgs);
  }

  async findMessageById(id: number): Promise<BoardMessage | null> {
    return this.database.boardMessage.findUnique({
      where: { id },
      include: {
        board: true,
        edits: { orderBy: { editedAt: 'asc' } },
      },
    });
  }

  async countMessages(boardId?: number): Promise<number> {
    const countArgs: Prisma.BoardMessageCountArgs = {};
    if (boardId !== undefined) countArgs.where = { boardId };
    return this.database.boardMessage.count(countArgs);
  }

  async createMessage(
    data: Prisma.BoardMessageCreateInput
  ): Promise<BoardMessage> {
    return this.database.boardMessage.create({
      data,
      include: { edits: true },
    });
  }

  async updateMessage(
    id: number,
    data: Prisma.BoardMessageUpdateInput,
    editorName?: string
  ): Promise<BoardMessage> {
    // If we have an editor, record the edit
    if (editorName) {
      await this.database.boardMessageEdit.create({
        data: {
          message: { connect: { id } },
          editor: editorName,
          editedAt: new Date(),
        },
      });
    }

    return this.database.boardMessage.update({
      where: { id },
      data,
      include: { edits: { orderBy: { editedAt: 'asc' } } },
    });
  }

  async deleteMessage(id: number): Promise<BoardMessage> {
    return this.database.boardMessage.delete({ where: { id } });
  }

  // Edit history operations
  async findEditsByMessage(messageId: number): Promise<BoardMessageEdit[]> {
    return this.database.boardMessageEdit.findMany({
      where: { messageId },
      orderBy: { editedAt: 'asc' },
    });
  }
}
