import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole, type BoardMessage, type Users } from '@muditor/db';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
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
import {
  BoardPrivilege,
  canReadBoard,
  hasBoardPrivilege,
  type BoardViewer,
} from './board-access.util';
import { BoardsService } from './boards.service';
import { clampSkip, clampTake } from '../common/pagination';

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

interface MessageBoard {
  privileges: unknown;
  locked?: boolean;
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

/**
 * The caller as board rules see them: role plus linked character levels (level
 * rules 2-99 need a character in range). Staff skip the lookup, they outrank
 * every player-level rule.
 */
async function boardViewer(
  boards: BoardsService,
  user: Users | null
): Promise<BoardViewer> {
  if (!user) return null;
  const characterLevels = isStaff(user.role)
    ? []
    : await boards.getCharacterLevels(user.id);
  return { role: user.role, characterLevels };
}

@Resolver(() => BoardDto)
export class BoardsResolver {
  constructor(private readonly boardsService: BoardsService) {}

  @Query(() => [BoardDto], {
    name: 'boards',
    description: 'Boards the caller may read (anonymous: public boards only)',
  })
  @UseGuards(OptionalJwtAuthGuard)
  async findAllBoards(
    @CurrentUser() user: Users | null,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('search', { type: () => String, nullable: true }) search?: string
  ): Promise<BoardDto[]> {
    const args: {
      skip?: number;
      take?: number;
      search?: string;
    } = {};
    if (search !== undefined) args.search = search;

    // Visibility is decided per board, so page after filtering (boards are few).
    const viewer = await boardViewer(this.boardsService, user);
    const boards = (await this.boardsService.findAllBoards(args)).filter(b =>
      canReadBoard(b.privileges, viewer)
    );
    const start = clampSkip(skip);
    const page = boards.slice(start, start + clampTake(take));
    return page.map((b: BoardWithCount) => this.mapBoard(b));
  }

  @Query(() => BoardDto, { name: 'board', nullable: true })
  @UseGuards(OptionalJwtAuthGuard)
  async findBoard(
    @CurrentUser() user: Users | null,
    @Args('id', { type: () => Int, nullable: true }) id?: number,
    @Args('alias', { type: () => String, nullable: true }) alias?: string
  ): Promise<BoardDto | null> {
    let board: Awaited<ReturnType<BoardsService['findBoardById']>> = null;
    if (id) {
      board = await this.boardsService.findBoardById(id);
    } else if (alias) {
      board = await this.boardsService.findBoardByAlias(alias);
    }
    if (
      !board ||
      !canReadBoard(
        board.privileges,
        await boardViewer(this.boardsService, user)
      )
    ) {
      return null;
    }
    return this.mapBoard(board as BoardWithCount);
  }

  @Query(() => Int, { name: 'boardsCount' })
  @UseGuards(OptionalJwtAuthGuard)
  async countBoards(@CurrentUser() user: Users | null): Promise<number> {
    if (isStaff(user?.role)) return this.boardsService.countBoards();
    const viewer = await boardViewer(this.boardsService, user);
    const boards = await this.boardsService.findAllBoards();
    return boards.filter(b => canReadBoard(b.privileges, viewer)).length;
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

  /**
   * Gate for editing or deleting a message; returns it with its board.
   *  - a locked board is closed to everyone below BUILDER (same as posting);
   *  - the author may always modify their own message;
   *  - anyone else must be IMMORTAL+ and hold the board's EditAny / RemoveAny
   *    privilege (IMPLEMENTOR bypasses the board rules).
   */
  private async assertMayModify(
    messageId: number,
    user: Users,
    kind: 'edit' | 'delete'
  ): Promise<{ message: BoardMessage; board: MessageBoard | undefined }> {
    const message = await this.boardsService.findMessageById(messageId);
    if (!message) {
      throw new NotFoundException(`Board message ${messageId} not found`);
    }
    const board = (message as { board?: MessageBoard }).board;
    if (board?.locked && !roleAtLeast(user.role, UserRole.BUILDER)) {
      throw new ForbiddenException('This board is locked');
    }
    const identity = await this.boardsService.getPosterIdentity(user);
    const isAuthor = identity.names.some(
      n => n.toLowerCase() === message.poster.toLowerCase()
    );
    if (isAuthor) return { message, board };
    if (!isStaff(user.role)) {
      throw new ForbiddenException(
        'Only the author or staff may modify this message'
      );
    }
    if (user.role !== UserRole.IMPLEMENTOR) {
      const priv =
        kind === 'edit' ? BoardPrivilege.EDIT_ANY : BoardPrivilege.REMOVE_ANY;
      const viewer = await boardViewer(this.boardsService, user);
      if (!hasBoardPrivilege(board?.privileges, priv, viewer)) {
        throw new ForbiddenException(
          `You may not ${kind} other people's messages on this board`
        );
      }
    }
    return { message, board };
  }

  /** Pinning or unpinning needs the board's write-sticky privilege (staff have it unless the board says otherwise). */
  private async assertMayChangeSticky(
    board: MessageBoard | undefined,
    user: Users
  ): Promise<void> {
    const viewer = await boardViewer(this.boardsService, user);
    if (
      !hasBoardPrivilege(board?.privileges, BoardPrivilege.WRITE_STICKY, viewer)
    ) {
      throw new ForbiddenException('You may not change sticky messages here');
    }
  }

  /** Throws unless the caller may read the board. Missing boards read as empty. */
  private async assertCanReadBoard(
    boardId: number,
    user: Users | null
  ): Promise<boolean> {
    const board = await this.boardsService.findBoardPrivileges(boardId);
    if (!board) return false;
    if (
      !canReadBoard(
        board.privileges,
        await boardViewer(this.boardsService, user)
      )
    ) {
      throw new ForbiddenException('You do not have access to this board');
    }
    return true;
  }

  @Query(() => [BoardMessageDto], { name: 'boardMessages' })
  @UseGuards(OptionalJwtAuthGuard)
  async findMessages(
    @CurrentUser() user: Users | null,
    @Args('boardId', { type: () => Int }) boardId: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number
  ): Promise<BoardMessageDto[]> {
    if (!(await this.assertCanReadBoard(boardId, user))) return [];
    const args: { skip?: number; take?: number } = {};
    if (skip !== undefined) args.skip = clampSkip(skip);
    args.take = clampTake(take);

    const messages = await this.boardsService.findMessagesByBoard(
      boardId,
      args
    );
    return messages.map(m => this.mapMessage(m as MessageWithEdits));
  }

  @Query(() => BoardMessageDto, { name: 'boardMessage', nullable: true })
  @UseGuards(OptionalJwtAuthGuard)
  async findMessage(
    @CurrentUser() user: Users | null,
    @Args('id', { type: () => Int }) id: number
  ): Promise<BoardMessageDto | null> {
    const message = await this.boardsService.findMessageById(id);
    if (
      message &&
      !canReadBoard(
        (message as { board?: { privileges: unknown } }).board?.privileges,
        await boardViewer(this.boardsService, user)
      )
    ) {
      return null;
    }
    return message ? this.mapMessage(message as MessageWithEdits) : null;
  }

  @Query(() => Int, { name: 'boardMessagesCount' })
  @UseGuards(OptionalJwtAuthGuard)
  async countMessages(
    @CurrentUser() user: Users | null,
    @Args('boardId', { type: () => Int, nullable: true }) boardId?: number
  ): Promise<number> {
    if (boardId !== undefined && boardId !== null) {
      if (!(await this.assertCanReadBoard(boardId, user))) return 0;
      return this.boardsService.countMessages(boardId);
    }
    if (isStaff(user?.role)) return this.boardsService.countMessages();
    const viewer = await boardViewer(this.boardsService, user);
    const boards = await this.boardsService.findAllBoards();
    return boards
      .filter(b => canReadBoard(b.privileges, viewer))
      .reduce(
        (sum, b) => sum + ((b as BoardWithCount)._count?.messages ?? 0),
        0
      );
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
    // Write / sticky privileges come from the board's rules, like READ does.
    const board = await this.boardsService.findBoardPrivileges(data.boardId);
    if (!board) {
      throw new NotFoundException(`Board ${data.boardId} not found`);
    }
    if (board.locked && !roleAtLeast(user.role, UserRole.BUILDER)) {
      throw new ForbiddenException('This board is locked');
    }
    const viewer = await boardViewer(this.boardsService, user);
    if (
      !hasBoardPrivilege(board.privileges, BoardPrivilege.WRITE_NEW, viewer)
    ) {
      throw new ForbiddenException('You may not post on this board');
    }
    if (
      data.sticky &&
      !hasBoardPrivilege(board.privileges, BoardPrivilege.WRITE_STICKY, viewer)
    ) {
      throw new ForbiddenException('You may not post sticky messages here');
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
    const { message: current, board } = await this.assertMayModify(
      id,
      user,
      'edit'
    );
    // Either direction counts: an author must not unpin a staff-pinned post.
    if (data.sticky !== undefined && data.sticky !== current.sticky) {
      await this.assertMayChangeSticky(board, user);
    }
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
    await this.assertMayModify(id, user, 'delete');
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
