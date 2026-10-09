import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@muditor/db';
import { DatabaseService } from '../database/database.service';
import type {
  CreateStatusFlagValueInput,
  UpdateStatusFlagValueInput,
} from './status-flag-value.input';

@Injectable()
export class StatusFlagValuesService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    return this.db.statusFlagValue.findMany({ orderBy: { flag: 'asc' } });
  }

  async findOne(flag: string) {
    const row = await this.db.statusFlagValue.findUnique({ where: { flag } });
    if (!row) {
      throw new NotFoundException(`Status flag value "${flag}" not found`);
    }
    return row;
  }

  async create(data: CreateStatusFlagValueInput) {
    const existing = await this.db.statusFlagValue.findUnique({
      where: { flag: data.flag },
    });
    if (existing) {
      throw new BadRequestException(
        `Status flag value "${data.flag}" already exists`
      );
    }
    try {
      return await this.db.statusFlagValue.create({
        data: { flag: data.flag, aiValue: data.aiValue },
      });
    } catch (e) {
      throw this.mapUniqueViolation(e, data.flag);
    }
  }

  async update(flag: string, data: UpdateStatusFlagValueInput) {
    await this.findOne(flag);
    return this.db.statusFlagValue.update({
      where: { flag },
      data: { aiValue: data.aiValue },
    });
  }

  async remove(flag: string) {
    await this.findOne(flag);
    return this.db.statusFlagValue.delete({ where: { flag } });
  }

  private mapUniqueViolation(e: unknown, flag: string): unknown {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === 'P2002'
    ) {
      return new BadRequestException(
        `Status flag value "${flag}" already exists`
      );
    }
    return e;
  }
}
