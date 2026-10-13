import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import {
  CreateMobResetInput,
  ResetContentInput,
  UpdateMobResetInput,
  UpdateResetContentInput,
} from '../mobs/mob-reset.dto';
import {
  CreateObjectResetInput,
  UpdateObjectResetInput,
} from '../object-resets/object-reset.dto';
import { RoomExtraDescriptionInput } from '../rooms/room.dto';

/** The exact pipe main.ts installs: unknown or undecorated fields are rejected. */
const pipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
});

const run = (metatype: new () => object, value: unknown) =>
  pipe.transform(value, { type: 'body', metatype });

describe('reset inputs under the global validation pipe', () => {
  it('createMobReset accepts a full payload with gear (was rejected: no validators)', async () => {
    const out = (await run(CreateMobResetInput, {
      zoneId: 30,
      mobZoneId: 30,
      mobId: 4,
      roomZoneId: 30,
      roomId: 10,
      maxInstances: 2,
      probability: 0.5,
      comment: 'guards the door',
      equipment: [
        {
          objectZoneId: 30,
          objectId: 7,
          wearLocation: 'WIELD',
          maxInstances: 1,
          probability: 1,
        },
      ],
    })) as CreateMobResetInput;
    expect(out.equipment?.[0]).toMatchObject({ wearLocation: 'WIELD' });
    expect(out.maxInstances).toBe(2);
  });

  it('createMobReset fills defaults and rejects bad values', async () => {
    const out = (await run(CreateMobResetInput, {
      zoneId: 30,
      mobZoneId: 30,
      mobId: 4,
      roomZoneId: 30,
      roomId: 10,
    })) as CreateMobResetInput;
    expect(out.maxInstances).toBe(1);
    expect(out.probability).toBe(1);

    for (const bad of [
      { maxInstances: 0 },
      { probability: 1.5 },
      { probability: -0.1 },
      { mobId: 1.5 },
      { equipment: [{ objectZoneId: 1, objectId: 1, wearLocation: 'KNEES' }] },
      { equipment: [{ objectZoneId: 1, objectId: 1, wearLocation: '' }] },
      // Object wear flags are not mob gear slots: the game would just carry it.
      {
        equipment: [{ objectZoneId: 1, objectId: 1, wearLocation: 'MAINHAND' }],
      },
      { surprise: true },
    ]) {
      await expect(
        run(CreateMobResetInput, {
          zoneId: 30,
          mobZoneId: 30,
          mobId: 4,
          roomZoneId: 30,
          roomId: 10,
          ...bad,
        })
      ).rejects.toBeDefined();
    }
  });

  it('updateMobReset takes partial edits and nested equipment edits', async () => {
    await expect(
      run(UpdateMobResetInput, {
        maxInstances: 3,
        equipment: [{ id: '5', probability: 0.25, wearLocation: 'HEAD' }],
      })
    ).resolves.toBeDefined();
    await expect(
      run(UpdateMobResetInput, { probability: 2 })
    ).rejects.toBeDefined();
  });

  it('createObjectReset needs both zones and rejects extras', async () => {
    const ok = {
      zoneId: 30,
      objectZoneId: 30,
      objectId: 2,
      roomZoneId: 30,
      roomId: 1,
      maxInstances: 2,
      probability: 1,
      comment: 'on the altar',
    };
    await expect(run(CreateObjectResetInput, ok)).resolves.toBeDefined();
    await expect(
      run(CreateObjectResetInput, { ...ok, max: 2 })
    ).rejects.toBeDefined();
    await expect(
      run(CreateObjectResetInput, { ...ok, maxInstances: 0 })
    ).rejects.toBeDefined();
    const { roomZoneId: _omit, ...missing } = ok;
    await expect(run(CreateObjectResetInput, missing)).rejects.toBeDefined();
  });

  it('updateObjectReset can move the reset and edit its limits', async () => {
    await expect(
      run(UpdateObjectResetInput, {
        roomZoneId: 30,
        roomId: 4,
        maxInstances: 2,
      })
    ).resolves.toBeDefined();
    await expect(
      run(UpdateObjectResetInput, { probability: 3 })
    ).rejects.toBeDefined();
  });

  it('container contents validate quantity, cap and parent', async () => {
    await expect(
      run(ResetContentInput, {
        objectZoneId: 30,
        objectId: 9,
        quantity: 2,
        maxInstances: 5,
        parentContentId: 3,
        comment: 'inside the pouch',
      })
    ).resolves.toBeDefined();
    for (const bad of [
      { quantity: 0 },
      { maxInstances: 0 },
      { parentContentId: 0 },
    ]) {
      await expect(
        run(ResetContentInput, { objectZoneId: 30, objectId: 9, ...bad })
      ).rejects.toBeDefined();
    }
    await expect(
      run(UpdateResetContentInput, { quantity: 4 })
    ).resolves.toBeDefined();
    await expect(
      run(UpdateResetContentInput, { quantity: -1 })
    ).rejects.toBeDefined();
  });

  it('room extra descriptions need keywords and text', async () => {
    await expect(
      run(RoomExtraDescriptionInput, {
        keywords: ['mural'],
        description: 'A faded mural.',
      })
    ).resolves.toBeDefined();
    await expect(
      run(RoomExtraDescriptionInput, { keywords: [], description: 'x' })
    ).rejects.toBeDefined();
  });
});
