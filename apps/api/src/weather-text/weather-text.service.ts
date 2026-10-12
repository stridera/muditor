import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import type {
  SetWeatherTextInput,
  WeatherTextKeyInput,
} from './weather-text.input';

@Injectable()
export class WeatherTextService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    return this.db.weatherText.findMany({
      orderBy: [{ climate: 'asc' }, { daypart: 'asc' }],
    });
  }

  async set(data: SetWeatherTextInput) {
    const text = data.text.trim();
    if (text === '') {
      throw new BadRequestException(
        'Weather text must not be empty; delete the row to use the built-in line'
      );
    }
    return this.db.weatherText.upsert({
      where: {
        climate_daypart: { climate: data.climate, daypart: data.daypart },
      },
      create: { climate: data.climate, daypart: data.daypart, text },
      update: { text },
    });
  }

  /** Remove a row so the game falls back to its built-in line for that key. */
  async remove(key: WeatherTextKeyInput) {
    const where = {
      climate_daypart: { climate: key.climate, daypart: key.daypart },
    };
    const existing = await this.db.weatherText.findUnique({ where });
    if (!existing) {
      throw new NotFoundException(
        `No weather text for ${key.climate}/${key.daypart}`
      );
    }
    await this.db.weatherText.delete({ where });
    return true;
  }
}
