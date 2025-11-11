import { ObjectType } from '@prisma/client';
import { mapObject } from '../object.mapper';
import { ObjectMapperSource } from '../types';

function base(): ObjectMapperSource {
  // Use full shape expected from Prisma Objects including nullable fields.
  return {
    id: 10,
    type: ObjectType.NOTHING,
    keywords: ['a', 'b'],
    name: 'Obj',
    roomDescription: 'Room desc',
    examineDescription: 'Exam desc',
    actionDescription: null,
    flags: [],
    effectFlags: [],
    wearFlags: [],
    weight: 1,
    cost: 2,
    timer: 0,
    decomposeTimer: 0,
    level: 1,
    concealment: 0,
    values: {}, // empty object satisfies JsonValue for test purposes
    zoneId: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    createdBy: null,
    updatedBy: null,
  };
}

describe('mapObject', () => {
  it('omits actionDescription when null', () => {
    const dto = mapObject(base());
    expect(dto).not.toHaveProperty('actionDescription');
  });

  it('includes actionDescription when provided', () => {
    const src = { ...base(), actionDescription: 'Action!' };
    const dto = mapObject(src);
    expect(dto.actionDescription).toBe('Action!');
  });

  it('passes through enum type and values object', () => {
    const values = { x: 1, y: 'test' }; // object literal is JsonValue-like
    const src = { ...base(), values };
    const dto = mapObject(src);
    expect(dto.type).toBe(ObjectType.NOTHING);
    expect(dto.values).toEqual(values);
  });
});
