import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@muditor/db';
import { DatabaseService } from '../database/database.service';
import type {
  CreateSystemMessageInput,
  UpdateSystemMessageInput,
} from './system-message.input';

/** Drop blank variants (markup and inner spacing are kept); one must remain. */
function normalizeMessages(messages: string[]): string[] {
  const cleaned = messages.filter(m => m.trim() !== '');
  if (cleaned.length === 0) {
    throw new BadRequestException('At least one non-blank message is required');
  }
  return cleaned;
}

@Injectable()
export class SystemMessagesService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    return this.db.systemMessage.findMany({
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });
  }

  async findOne(id: number) {
    const row = await this.db.systemMessage.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException(`System message with ID ${id} not found`);
    }
    return row;
  }

  async create(data: CreateSystemMessageInput) {
    const messages = normalizeMessages(data.messages);
    const existing = await this.db.systemMessage.findUnique({
      where: { key: data.key },
    });
    if (existing) {
      throw new BadRequestException(
        `System message "${data.key}" already exists`
      );
    }
    try {
      return await this.db.systemMessage.create({
        data: { key: data.key, category: data.category, messages },
      });
    } catch (e) {
      throw this.mapUniqueViolation(e, data.key);
    }
  }

  async update(id: number, data: UpdateSystemMessageInput) {
    await this.findOne(id);

    const patch: Prisma.SystemMessageUpdateInput = {};
    if (data.category != null) patch.category = data.category;
    if (data.messages != null)
      patch.messages = normalizeMessages(data.messages);

    return this.db.systemMessage.update({ where: { id }, data: patch });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.db.systemMessage.delete({ where: { id } });
  }

  private mapUniqueViolation(e: unknown, key: string): unknown {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === 'P2002'
    ) {
      return new BadRequestException(`System message "${key}" already exists`);
    }
    return e;
  }
}
