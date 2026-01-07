import {
  Direction,
  ExitFlag,
  ExitState,
  RoomFlag,
  Sector,
} from '@prisma/client';
import { mapRoom } from '../room.mapper';
import { RoomMapperSource } from '../types';

describe('mapRoom', () => {
  const base = (): RoomMapperSource => ({
    id: 55,
    name: 'Hall',
    roomDescription: 'A long hallway',
    sector: Sector.STRUCTURE,
    flags: [RoomFlag.DARK],
    zoneId: 9,
    exits: [
      {
        id: 100,
        direction: Direction.NORTH,
        flags: [ExitFlag.IS_DOOR],
        defaultState: ExitState.CLOSED,
        hitPoints: null,
        roomZoneId: 9,
        roomId: 55,
        keywords: ['door'],
        description: 'A sturdy wooden door',
        key: null,
        toZoneId: null,
        toRoomId: null,
      },
      {
        id: 101,
        direction: Direction.SOUTH,
        flags: [],
        defaultState: ExitState.OPEN,
        hitPoints: null,
        roomZoneId: 9,
        roomId: 55,
        keywords: [],
        description: null,
        key: '777',
        toZoneId: 10,
        toRoomId: 77,
      },
    ],
    roomExtraDescriptions: [
      {
        id: 1,
        keywords: ['painting'],
        description: 'A faded painting.',
        roomZoneId: 9,
        roomId: 55,
      },
      { id: 2, keywords: ['rug'], description: '', roomZoneId: 9, roomId: 55 },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    layoutX: 3,
    layoutY: null,
    layoutZ: null,
    createdBy: null,
    updatedBy: 'tester',
  });

  it('maps exits including conditional optional fields', () => {
    const dto = mapRoom(base());
    expect(dto.exits).toHaveLength(2);
    const north = dto.exits.find(e => e.direction === Direction.NORTH)!;
    expect(north.description).toBe('A sturdy wooden door');
    expect(north).not.toHaveProperty('key');
    expect(north).not.toHaveProperty('toRoomId');
    const south = dto.exits.find(e => e.direction === Direction.SOUTH)!;
    expect(south.key).toBe('777');
    expect(south.toRoomId).toBe(77);
    expect(south.toZoneId).toBe(10);
  });

  it('maps extra descriptions with default empty string for null description', () => {
    const dto = mapRoom(base());
    const rug = dto.extraDescs.find(ed => ed.keywords.includes('rug'))!;
    expect(rug.description).toBe('');
  });

  it('includes layoutX but omits null/undefined layoutY/layoutZ', () => {
    const dto = mapRoom(base());
    expect(dto.layoutX).toBe(3);
    expect(dto).not.toHaveProperty('layoutY');
    expect(dto).not.toHaveProperty('layoutZ');
  });

  it('includes updatedBy but omits createdBy when null', () => {
    const dto = mapRoom(base());
    expect(dto.updatedBy).toBe('tester');
    expect(dto).not.toHaveProperty('createdBy');
  });
});
