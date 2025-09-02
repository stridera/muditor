import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll() {
    return this.databaseService.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.databaseService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.databaseService.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string) {
    return this.databaseService.user.findUnique({
      where: { username },
    });
  }

  async updateRole(id: string, role: UserRole, godLevel?: number) {
    const user = await this.findOne(id);
    
    const updateData: any = { role };
    if (godLevel !== undefined) {
      updateData.godLevel = godLevel;
    }

    return this.databaseService.user.update({
      where: { id },
      data: updateData,
    });
  }

  async getUsersWithCharacters() {
    return this.databaseService.user.findMany({
      include: {
        characters: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}