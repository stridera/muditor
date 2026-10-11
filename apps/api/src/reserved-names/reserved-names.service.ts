import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import type { CreateReservedNameInput } from './reserved-name.input';

@Injectable()
export class ReservedNamesService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    return this.db.reservedNames.findMany({
      orderBy: [{ name: 'asc' }],
    });
  }

  /** Names are stored lowercase, so uniqueness is case-insensitive. */
  async create(data: CreateReservedNameInput) {
    const name = data.name.trim().toLowerCase();
    const existing = await this.db.reservedNames.findUnique({
      where: { name },
    });
    if (existing) {
      throw this.alreadyReserved(name);
    }
    try {
      return await this.db.reservedNames.create({
        data: { name, reason: data.reason?.trim() || null },
      });
    } catch (e) {
      // P2002: unique constraint violated (a concurrent create of the same name).
      if ((e as { code?: string } | null)?.code === 'P2002') {
        throw this.alreadyReserved(name);
      }
      throw e;
    }
  }

  async remove(id: number) {
    const row = await this.db.reservedNames.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Reserved name with ID ${id} not found`);
    }
    return this.db.reservedNames.delete({ where: { id } });
  }

  private alreadyReserved(name: string) {
    return new BadRequestException(`"${name}" is already reserved`);
  }
}
