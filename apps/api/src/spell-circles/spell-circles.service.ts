import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  MAX_RECOVER_SECS,
  MAX_SPELL_CIRCLE,
  MIN_SPELL_CIRCLE,
} from './spell-circle.input';

@Injectable()
export class SpellCirclesService {
  constructor(private readonly db: DatabaseService) {}

  /** Circles 1-14; circles without a row (or with a NULL time) are listed with null. */
  async findAll() {
    const rows = await this.db.spellCircle.findMany();
    const byCircle = new Map(rows.map(r => [r.circle, r.recoverSecs]));
    const circles: { circle: number; recoverSecs: number | null }[] = [];
    for (let circle = MIN_SPELL_CIRCLE; circle <= MAX_SPELL_CIRCLE; circle++) {
      circles.push({ circle, recoverSecs: byCircle.get(circle) ?? null });
    }
    return circles;
  }

  /** null clears the value so the game uses its built-in time for the circle. */
  async setRecoverSecs(circle: number, recoverSecs: number | null) {
    if (
      !Number.isInteger(circle) ||
      circle < MIN_SPELL_CIRCLE ||
      circle > MAX_SPELL_CIRCLE
    ) {
      throw new BadRequestException(
        `Spell circle must be ${MIN_SPELL_CIRCLE}-${MAX_SPELL_CIRCLE}`
      );
    }
    if (
      recoverSecs !== null &&
      (!Number.isInteger(recoverSecs) ||
        recoverSecs < 0 ||
        recoverSecs > MAX_RECOVER_SECS)
    ) {
      throw new BadRequestException(
        `Recover time must be a whole number of seconds, 0-${MAX_RECOVER_SECS}`
      );
    }
    return this.db.spellCircle.upsert({
      where: { circle },
      create: { circle, recoverSecs },
      update: { recoverSecs },
    });
  }
}
