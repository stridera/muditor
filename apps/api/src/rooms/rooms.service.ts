import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RoomDto, CreateRoomInput, UpdateRoomInput, CreateRoomExitInput } from './room.dto';

@Injectable()
export class RoomsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(params?: { skip?: number; take?: number; zoneId?: number }): Promise<RoomDto[]> {
    const { skip, take, zoneId } = params || {};
    
    const rooms = await this.db.room.findMany({
      where: zoneId ? { zoneId } : undefined,
      skip,
      take,
      include: {
        exits: true,
        extraDescs: true,
      },
      orderBy: { id: 'asc' },
    });

    return rooms;
  }

  async findOne(id: number): Promise<RoomDto | null> {
    const room = await this.db.room.findUnique({
      where: { id },
      include: {
        exits: true,
        extraDescs: true,
      },
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }

    return room;
  }

  async findByZone(zoneId: number): Promise<RoomDto[]> {
    const rooms = await this.db.room.findMany({
      where: { zoneId },
      include: {
        exits: true,
        extraDescs: true,
      },
      orderBy: { id: 'asc' },
    });

    return rooms;
  }

  async count(zoneId?: number): Promise<number> {
    return this.db.room.count({
      where: zoneId ? { zoneId } : undefined,
    });
  }

  async create(data: CreateRoomInput): Promise<RoomDto> {
    const room = await this.db.room.create({
      data: {
        id: data.id,
        name: data.name,
        description: data.description,
        sector: data.sector || 'STRUCTURE',
        flags: data.flags || [],
        zoneId: data.zoneId,
      },
      include: {
        exits: true,
        extraDescs: true,
      },
    });

    return room;
  }

  async update(id: number, data: UpdateRoomInput): Promise<RoomDto> {
    const room = await this.db.room.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        sector: data.sector,
        flags: data.flags,
      },
      include: {
        exits: true,
        extraDescs: true,
      },
    });

    return room;
  }

  async delete(id: number): Promise<RoomDto> {
    const room = await this.db.room.delete({
      where: { id },
      include: {
        exits: true,
        extraDescs: true,
      },
    });

    return room;
  }

  async createExit(data: CreateRoomExitInput): Promise<any> {
    const exit = await this.db.roomExit.create({
      data: {
        direction: data.direction,
        description: data.description,
        keyword: data.keyword,
        key: data.key,
        destination: data.destination,
        roomId: data.roomId,
      },
    });

    return exit;
  }

  async deleteExit(exitId: string): Promise<any> {
    const exit = await this.db.roomExit.delete({
      where: { id: exitId },
    });

    return exit;
  }
}