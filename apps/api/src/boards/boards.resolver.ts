import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole, type Users } from '@muditor/db';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { isStaff, roleAtLeast } from '../auth/role.util';
import {
  BoardDto,
  BoardMessageDto,
  BoardMessageEditDto,
  CreateBoardInput,
  CreateBoardMessageInput,
  UpdateBoardInput,
  UpdateBoardMessageInput,
} from './board.dto';
import { BoardsService } from './boards.service';

interface BoardWithCount {
  id: number;
  alias: string;
  title: string;
  locked: boolean;
  privileges: unknown;
  createdAt: Date;
  updatedAt: Date;
  messages?: unknown[];
  _count?: { messages: number };
}

interface MessageWithEdits {
  id: number;
  boardId: number;
  poster: string;
  posterLevel: number;
  postedAt: Date;
  subject: string;
  content: string;
  sticky: boolean;
  createdAt: Date;
  updatedAt: Date;
  edits?: unknown[];
  board?: unknown;
}

function assertBuilder(user: Users): void {
  if (!roleAtLeast(user.role, UserRole.BUILDER)) {
    throw new ForbiddenException('Builder role or higher required');
  }
}

@Resolver(() => BoardDto)
export class BoardsResolver {
  constructor(private readonly boardsService: BoardsService) {}

  @Query(() => [BoardDto], { name: 'boards' })
  async findAllBoards(
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('search', { type: () => String, nullable: true }) search?: string
  ): Promise<BoardDto[]> {
    const args: {
      skip?: number;
      take?: number;
      search?: string;
    } = {};
    if (skip !== undefined) args.skip = skip;
    if (take !== undefined) args.take = take;
    if (search !== undefined) args.search = search;

    const boards = await this.boardsService.findAllBoards(args);
    return boards.map((b: BoardWithCount) => this.mapBoard(b));
  }

  @Query(() => BoardDto, { name: 'board', nullable: true })
  async findBoard(
    @Args('id', { type: () => Int, nullable: true }) id?: number,
    @Args('alias', { type: () => String, nullable: true }) alias?: string
  ): Promise<BoardDto | null> {
    if (id) {
      const board = await this.boardsService.findBoardById(id);
      return board ? this.mapBoard(board as BoardWithCount) : null;
    }
    if (alias) {
      const board = await this.boardsService.findBoardByAlias(alias);
      return board ? this.mapBoard(board as BoardWithCount) : null;
    }
    return null;
  }

  @Query(() => Int, { name: 'boardsCount' })
  async countBoards(): Promise<number> {
    return this.boardsService.countBoards();
  }

  @Mutation(() => BoardDto)
  @UseGuards(JwtAuthGuard)
  async createBoard(
    @Args('data') data: CreateBoardInput,
    @CurrentUser() user: Users
  ): Promise<BoardDto> {
    assertBuilder(user);
    const createData: Prisma.BoardCreateInput = {
      alias: data.alias,
      title: data.title,
      locked: data.locked ?? false,
      privileges: (data.privileges ?? []) as Prisma.InputJsonValue,
    };
    const board = await this.boardsService.createBoard(createData);
    return this.mapBoard(board as BoardWithCount);
  }

  @Mutation(() => BoardDto)
  @UseGuards(JwtAuthGuard)
  async updateBoard(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateBoardInput,
    @CurrentUser() user: Users
  ): Promise<BoardDto> {
    assertBuilder(user);
    const updateData: Prisma.BoardUpdateInput = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.locked !== undefined) updateData.locked = data.locked;
    if (data.privileges !== undefined)
      updateData.privileges = data.privileges as Prisma.InputJsonValue;

    const board = await this.boardsService.updateBoard(id, updateData);
    return this.mapBoard(board as BoardWithCount);
  }

  @Mutation(() => BoardDto)
  @UseGuards(JwtAuthGuard)
  async deleteBoard(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: Users
  ): Promise<BoardDto> {
    assertBuilder(user);
    const board = await this.boardsService.deleteBoard(id);
    return this.mapBoard(board as BoardWithCount);
  }

  private mapBoard(board: BoardWithCount): BoardDto {
    return {
      id: board.id,
      alias: board.alias,
      title: board.title,
      locked: board.locked,
      privileges: board.privileges,
      messages: board.messages
        ? (board.messages as MessageWithEdits[]).map(m => this.mapMessage(m))
        : null,
      messageCount: board._count?.messages ?? board.messages?.length ?? 0,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
    };
  }

  private mapMessage(message: MessageWithEdits): BoardMessageDto {
    return {
      id: message.id,
      boardId: message.boardId,
      poster: message.poster,
      posterLevel: message.posterLevel,
      postedAt: message.postedAt,
      subject: message.subject,
      content: message.content,
      sticky: message.sticky,
      edits: message.edits ? (message.edits as BoardMessageEditDto[]) : null,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  }
}

@Resolver(() => BoardMessageDto)
export class BoardMessagesResolver {
  constructor(private readonly boardsService: BoardsService) {}

  /** Message author (matched against the caller's identity) or IMMORTAL+. */
  private async assertAuthorOrStaff(
    messageId: number,
    user: Users
  ): Promise<void> {
    const message = await this.boardsService.findMessageById(messageId);
    if (!message) {
      throw new NotFoundException(`Board message ${messageId} not found`);
    }
    if (isStaff(user.role)) return;
    const identity = await this.boardsService.getPosterIdentity(user);
    const isAuthor = identity.names.some(
      n => n.toLowerCase() === message.poster.toLowerCase()
    );
    if (!isAuthor) {
      throw new ForbiddenException(
        'Only the author or staff may modify this message'
      );
    }
  }

  @Query(() => [BoardMessageDto], { name: 'boardMessages' })
  async findMessages(
    @Args('boardId', { type: () => Int }) boardId: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number
  ): Promise<BoardMessageDto[]> {
    const args: { skip?: number; take?: number } = {};
    if (skip !== undefined) args.skip = skip;
    if (take !== undefined) args.take = take;

    const messages = await this.boardsService.findMessagesByBoard(
      boardId,
      args
    );
    return messages.map(m => this.mapMessage(m as MessageWithEdits));
  }

  @Query(() => BoardMessageDto, { name: 'boardMessage', nullable: true })
  async findMessage(
    @Args('id', { type: () => Int }) id: number
  ): Promise<BoardMessageDto | null> {
    const message = await this.boardsService.findMessageById(id);
    return message ? this.mapMessage(message as MessageWithEdits) : null;
  }

  @Query(() => Int, { name: 'boardMessagesCount' })
  async countMessages(
    @Args('boardId', { type: () => Int, nullable: true }) boardId?: number
  ): Promise<number> {
    return this.boardsService.countMessages(boardId);
  }

  @Mutation(() => BoardMessageDto)
  @UseGuards(JwtAuthGuard)
  async createBoardMessage(
    @Args('data') data: CreateBoardMessageInput,
    @CurrentUser() user: Users
  ): Promise<BoardMessageDto> {
    // Never trust client-supplied identity: poster must be the caller's own
    // display name or one of their characters, and the level is derived server-side.
    const identity = await this.boardsService.getPosterIdentity(user);
    const poster = identity.names.find(
      n => n.toLowerCase() === data.poster.toLowerCase()
    );
    if (!poster) {
      throw new ForbiddenException('You can only post as yourself');
    }
    const createData: Prisma.BoardMessageCreateInput = {
      board: { connect: { id: data.boardId } },
      poster,
      posterLevel: identity.level,
      postedAt: new Date(),
      subject: data.subject,
      content: data.content,
      sticky: data.sticky ?? false,
    };
    const message = await this.boardsService.createMessage(createData);
    return this.mapMessage(message as MessageWithEdits);
  }

  @Mutation(() => BoardMessageDto)
  @UseGuards(JwtAuthGuard)
  async updateBoardMessage(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateBoardMessageInput,
    @CurrentUser() user: Users,
    @Args('editor', {
      type: () => String,
      nullable: true,
      deprecationReason: 'Ignored: the editor is always the authenticated user',
    })
    _editor?: string
  ): Promise<BoardMessageDto> {
    void _editor; // kept for schema compatibility; client-supplied editor is never trusted
    await this.assertAuthorOrStaff(id, user);
    const updateData: Prisma.BoardMessageUpdateInput = {};
    if (data.subject !== undefined) updateData.subject = data.subject;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.sticky !== undefined) updateData.sticky = data.sticky;

    const message = await this.boardsService.updateMessage(
      id,
      updateData,
      user.displayName
    );
    return this.mapMessage(message as MessageWithEdits);
  }

  @Mutation(() => BoardMessageDto)
  @UseGuards(JwtAuthGuard)
  async deleteBoardMessage(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: Users
  ): Promise<BoardMessageDto> {
    await this.assertAuthorOrStaff(id, user);
    const message = await this.boardsService.deleteMessage(id);
    return this.mapMessage(message as MessageWithEdits);
  }

  private mapMessage(message: MessageWithEdits): BoardMessageDto {
    return {
      id: message.id,
      boardId: message.boardId,
      poster: message.poster,
      posterLevel: message.posterLevel,
      postedAt: message.postedAt,
      subject: message.subject,
      content: message.content,
      sticky: message.sticky,
      edits: message.edits ? (message.edits as BoardMessageEditDto[]) : null,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  }
}
