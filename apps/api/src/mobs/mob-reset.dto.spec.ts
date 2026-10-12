import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { WearFlag } from '@muditor/db';
import {
  CreateMobResetEquipmentInput,
  CreateMobResetInput,
  UpdateMobResetEquipmentInput,
  UpdateMobResetInput,
} from './mob-reset.dto';

// Same options as the global ValidationPipe in main.ts. Without class-validator
// decorators the whitelist rejected every field of these inputs.
const OPTIONS = { whitelist: true, forbidNonWhitelisted: true } as const;

describe('mob reset input validation', () => {
  it('accepts a full createMobReset payload including equipment', async () => {
    const dto = plainToInstance(CreateMobResetInput, {
      zoneId: 30,
      mobZoneId: 30,
      mobId: 5,
      roomZoneId: 30,
      roomId: 12,
      maxInstances: 2,
      probability: 0.5,
      comment: 'guard post',
      equipment: [
        {
          objectZoneId: 30,
          objectId: 9,
          wearLocation: WearFlag.HEAD,
          maxInstances: 1,
          probability: 1,
        },
      ],
    });
    expect(await validate(dto, OPTIONS)).toHaveLength(0);
  });

  it('accepts the minimal payload', async () => {
    const dto = plainToInstance(CreateMobResetInput, {
      zoneId: 30,
      mobZoneId: 30,
      mobId: 5,
      roomZoneId: 30,
      roomId: 12,
    });
    expect(await validate(dto, OPTIONS)).toHaveLength(0);
  });

  it('rejects unknown fields and bad values', async () => {
    const dto = plainToInstance(CreateMobResetInput, {
      zoneId: 30,
      mobZoneId: 30,
      mobId: 5,
      roomZoneId: 30,
      roomId: 12,
      probability: 2,
      bogus: true,
    });
    const errors = await validate(dto, OPTIONS);
    const props = errors.map(e => e.property).sort();
    expect(props).toEqual(['bogus', 'probability']);
  });

  it('validates nested equipment', async () => {
    const dto = plainToInstance(CreateMobResetInput, {
      zoneId: 30,
      mobZoneId: 30,
      mobId: 5,
      roomZoneId: 30,
      roomId: 12,
      equipment: [{ objectZoneId: 30, objectId: 'x' }],
    });
    const errors = await validate(dto, OPTIONS);
    expect(errors.map(e => e.property)).toContain('equipment');
  });

  it('accepts an equipment input with defaults', async () => {
    const dto = plainToInstance(CreateMobResetEquipmentInput, {
      objectZoneId: 30,
      objectId: 9,
    });
    expect(await validate(dto, OPTIONS)).toHaveLength(0);
  });

  it('accepts partial updates, with the GraphQL ID as a string', async () => {
    const update = plainToInstance(UpdateMobResetInput, {
      probability: 0.25,
      roomZoneId: 30,
      roomId: 3,
      equipment: [{ id: '4', probability: 0.5 }],
    });
    expect(await validate(update, OPTIONS)).toHaveLength(0);
    expect(update.equipment![0]).toBeInstanceOf(UpdateMobResetEquipmentInput);
    expect(update.equipment![0]!.id).toBe(4);
  });

  it('rejects fields the update input does not declare', async () => {
    const update = plainToInstance(UpdateMobResetInput, { mobId: 9 });
    const errors = await validate(update, OPTIONS);
    expect(errors.map(e => e.property)).toEqual(['mobId']);
  });
});
