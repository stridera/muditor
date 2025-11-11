import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { LoggingService } from '../common/logging/logging.service';
import { DatabaseService } from '../database/database.service';

export interface ValidationIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: 'integrity' | 'quality' | 'consistency';
  entity: 'zone' | 'room' | 'mob' | 'object' | 'shop';
  entityId: number;
  title: string;
  description: string;
  suggestion?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface ValidationReport {
  zoneId: number;
  zoneName: string;
  totalIssues: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  issues: ValidationIssue[];
  generatedAt: Date;
}

// Precise selection types leveraging Prisma.Args to ensure strong typing and future-safe refactors.
// These reflect the minimal data we need for each validation phase.
type ZoneRoomsForContent = Prisma.ZonesGetPayload<{
  select: {
    rooms: {
      select: { id: true; name: true; roomDescription: true };
    };
    mobs: { select: { id: true; roomDescription: true; keywords: true } };
    objects: { select: { id: true; roomDescription: true } };
  };
}>['rooms']; // array of rooms

type ZoneMobsForContent = Prisma.ZonesGetPayload<{
  select: {
    mobs: { select: { id: true; roomDescription: true; keywords: true } };
  };
}>['mobs'];

type ZoneObjectsForContent = Prisma.ZonesGetPayload<{
  select: { objects: { select: { id: true; roomDescription: true } } };
}>['objects'];

interface ContentZone {
  rooms: ZoneRoomsForContent;
  mobs: ZoneMobsForContent;
  objects: ZoneObjectsForContent;
}

type ZoneShopsForConsistency = Prisma.ZonesGetPayload<{
  select: { shops: { select: { id: true; keeperId: true } } };
}>['shops'];
type ZoneMobsForConsistency = Prisma.ZonesGetPayload<{
  select: { mobs: { select: { id: true } } };
}>['mobs'];
type ZoneRoomsForConsistency = Prisma.ZonesGetPayload<{
  select: { rooms: { select: { id: true } } };
}>['rooms'];

interface ConsistencyZone {
  shops: ZoneShopsForConsistency;
  mobs: ZoneMobsForConsistency;
  rooms: ZoneRoomsForConsistency;
}

@Injectable()
export class ValidationService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly logging: LoggingService
  ) {}

  async validateZone(zoneId: number): Promise<ValidationReport> {
    const zone = await this.prisma.zones.findUnique({
      where: { id: zoneId },
      include: {
        rooms: {
          include: {
            exits: true,
          },
        },
        mobs: true,
        objects: true,
        shops: true,
      },
    });

    if (!zone) {
      throw new Error(`Zone ${zoneId} not found`);
    }

    const issues: ValidationIssue[] = [];

    // Zone Integrity Checks (use raw rooms with exits from original include)
    issues.push(...(await this.checkZoneIntegrity(zone)));

    // Content Quality Checks (pass strongly typed slices directly)
    issues.push(
      ...(await this.checkContentQuality({
        rooms: zone.rooms.map(r => ({
          id: r.id,
          name: r.name,
          roomDescription: r.roomDescription,
        })),
        mobs: zone.mobs.map(m => ({
          id: m.id,
          roomDescription: m.roomDescription,
          keywords: m.keywords,
        })),
        objects: zone.objects.map(o => ({
          id: o.id,
          roomDescription: o.roomDescription,
        })),
      }))
    );

    // World Consistency Checks
    issues.push(
      ...(await this.checkWorldConsistency({
        shops: zone.shops.map(s => ({ id: s.id, keeperId: s.keeperId })),
        mobs: zone.mobs.map(m => ({ id: m.id })),
        rooms: zone.rooms.map(r => ({ id: r.id })),
      }))
    );

    const errorCount = issues.filter(i => i.type === 'error').length;
    const warningCount = issues.filter(i => i.type === 'warning').length;
    const infoCount = issues.filter(i => i.type === 'info').length;

    return {
      zoneId: zone.id,
      zoneName: zone.name,
      totalIssues: issues.length,
      errorCount,
      warningCount,
      infoCount,
      issues,
      generatedAt: new Date(),
    };
  }

  private async checkZoneIntegrity(zone: {
    id: number;
    name: string;
    rooms: Array<{
      id: number;
      name: string;
      description?: string | null;
      exits: Array<{
        direction: string;
        destination?: number | null;
      }>;
    }>;
  }): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    // Check for orphaned rooms (rooms without any exits leading to them)
    const roomsWithIncomingExits = new Set<number>();
    zone.rooms.forEach(room => {
      room.exits.forEach(exit => {
        if (exit.destination) {
          roomsWithIncomingExits.add(exit.destination);
        }
      });
    });

    // Find the starting room (lowest ID room in zone range)
    const startingRoom = zone.rooms.reduce((min, room) =>
      room.id < min.id ? room : min
    );

    for (const room of zone.rooms) {
      // Skip the starting room from orphaned check
      if (room.id !== startingRoom.id && !roomsWithIncomingExits.has(room.id)) {
        issues.push({
          id: `orphaned-room-${room.id}`,
          type: 'warning',
          category: 'integrity',
          entity: 'room',
          entityId: room.id,
          title: 'Orphaned Room',
          description: `Room ${room.id} "${room.name}" has no incoming exits and may be unreachable.`,
          suggestion:
            'Add an exit from another room leading to this room, or verify if this room is intentionally isolated.',
          severity: 'medium',
        });
      }

      // Check for one-way exits
      for (const exit of room.exits) {
        if (exit.destination) {
          const destinationRoom = zone.rooms.find(
            r => r.id === exit.destination
          );
          if (destinationRoom) {
            const reverseDirection = this.getReverseDirection(exit.direction);
            const reverseExit = destinationRoom.exits.find(
              e => e.direction === reverseDirection && e.destination === room.id
            );

            if (!reverseExit) {
              issues.push({
                id: `one-way-exit-${room.id}-${exit.direction}`,
                type: 'info',
                category: 'integrity',
                entity: 'room',
                entityId: room.id,
                title: 'One-way Exit',
                description: `Exit ${exit.direction} from room ${room.id} to ${exit.destination} has no return path.`,
                suggestion:
                  'Consider adding a return exit if bidirectional travel is intended.',
                severity: 'low',
              });
            }
          } else {
            // Exit leads to room outside this zone or non-existent room
            // TODO: Fix composite key lookup
            // const externalRoom = await this.prisma.room.findUnique({
            //   where: { zoneId_id: { zoneId, id } },
            // });
            // if (!externalRoom) {
            //   issues.push({
            //     id: `broken-exit-${room.id}-${exit.direction}`,
            //     type: 'error',
            //     category: 'integrity',
            //     entity: 'room',
            //     entityId: room.id,
            //     title: 'Broken Exit',
            //     description: `Exit ${exit.direction} from room ${room.id} leads to non-existent room ${exit.destination}.`,
            //     suggestion:
            //       'Update the exit destination to a valid room ID or remove the exit.',
            //     severity: 'critical',
            //   });
            // }
          }
        }
      }
    }

    return issues;
  }

  // TODO: Refine typings for mobs/objects to actual Prisma model shape
  private async checkContentQuality(
    zone: ContentZone
  ): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    // Check room descriptions
    zone.rooms.forEach(room => {
      if (!room.roomDescription || room.roomDescription.trim().length < 10) {
        issues.push({
          id: `short-room-desc-${room.id}`,
          type: 'warning',
          category: 'quality',
          entity: 'room',
          entityId: room.id,
          title: 'Short Room Description',
          description: `Room ${room.id} "${room.name}" has a very short or missing description.`,
          suggestion:
            'Add a more detailed description to improve player experience.',
          severity: 'medium',
        });
      }

      if (!room.name || room.name.trim().length === 0) {
        issues.push({
          id: `missing-room-name-${room.id}`,
          type: 'error',
          category: 'quality',
          entity: 'room',
          entityId: room.id,
          title: 'Missing Room Name',
          description: `Room ${room.id} has no name.`,
          suggestion: 'Add a descriptive name for this room.',
          severity: 'high',
        });
      }
    });

    // Check mob descriptions
    zone.mobs.forEach(mob => {
      if (!mob.roomDescription || mob.roomDescription.trim().length < 10) {
        issues.push({
          id: `short-mob-desc-${mob.id}`,
          type: 'warning',
          category: 'quality',
          entity: 'mob',
          entityId: mob.id,
          title: 'Short Mob Description',
          description: `Mob ${mob.id} has a very short or missing description.`,
          suggestion:
            'Add a more detailed description to improve player immersion.',
          severity: 'medium',
        });
      }

      if (!mob.keywords || mob.keywords.length === 0) {
        issues.push({
          id: `missing-mob-keywords-${mob.id}`,
          type: 'error',
          category: 'quality',
          entity: 'mob',
          entityId: mob.id,
          title: 'Missing Mob Keywords',
          description: `Mob ${mob.id} has no keywords for player interaction.`,
          suggestion:
            'Add relevant keywords that players can use to interact with this mob.',
          severity: 'high',
        });
      }
    });

    // Check object descriptions
    zone.objects.forEach(obj => {
      if (!obj.roomDescription || obj.roomDescription.trim().length < 10) {
        issues.push({
          id: `short-object-desc-${obj.id}`,
          type: 'warning',
          category: 'quality',
          entity: 'object',
          entityId: obj.id,
          title: 'Short Object Description',
          description: `Object ${obj.id} has a very short or missing description.`,
          suggestion:
            'Add a more detailed description to improve player experience.',
          severity: 'medium',
        });
      }
    });

    return issues;
  }

  private async checkWorldConsistency(
    zone: ConsistencyZone
  ): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    // Check shop consistency
    for (const shop of zone.shops) {
      if (shop.keeperId) {
        const keeperMob = zone.mobs.find(m => m.id === shop.keeperId);
        if (!keeperMob) {
          // Check if keeper is in another zone
          // TODO: Fix composite key lookup
          // const externalKeeper = await this.prisma.mob.findUnique({
          //   where: { zoneId_id: { zoneId, id } },
          // });
          // if (!externalKeeper) {
          //   issues.push({
          //     id: `missing-shop-keeper-${shop.id}`,
          //     type: 'error',
          //     category: 'consistency',
          //     entity: 'shop',
          //     entityId: shop.id,
          //     title: 'Missing Shop Keeper',
          //     description: `Shop ${shop.id} references non-existent keeper mob ${shop.keeperMobId}.`,
          //     suggestion:
          //       'Create the keeper mob or update the shop to reference an existing mob.',
          //     severity: 'high',
          //   });
          // }
        }
      }

      // Room consistency check removed (shop model no longer includes room association directly)
    }

    return issues;
  }

  private getReverseDirection(direction: string): string {
    const directionMap: { [key: string]: string } = {
      NORTH: 'SOUTH',
      SOUTH: 'NORTH',
      EAST: 'WEST',
      WEST: 'EAST',
      UP: 'DOWN',
      DOWN: 'UP',
      NORTHEAST: 'SOUTHWEST',
      NORTHWEST: 'SOUTHEAST',
      SOUTHEAST: 'NORTHWEST',
      SOUTHWEST: 'NORTHEAST',
    };
    return directionMap[direction] || direction;
  }

  async validateAllZones(): Promise<ValidationReport[]> {
    const zones = await this.prisma.zones.findMany({
      select: { id: true },
    });

    const reports: ValidationReport[] = [];
    for (const zone of zones) {
      try {
        const report = await this.validateZone(zone.id);
        reports.push(report);
      } catch (error) {
        this.logging.logError(
          `Failed to validate zone ${zone.id}`,
          'ValidationService.validateAllZones',
          { zoneId: zone.id },
          error instanceof Error ? error.stack : undefined
        );
      }
    }

    return reports;
  }

  async getValidationSummary(): Promise<{
    totalZones: number;
    zonesWithIssues: number;
    totalIssues: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
  }> {
    const reports = await this.validateAllZones();

    return {
      totalZones: reports.length,
      zonesWithIssues: reports.filter(r => r.totalIssues > 0).length,
      totalIssues: reports.reduce((sum, r) => sum + r.totalIssues, 0),
      errorCount: reports.reduce((sum, r) => sum + r.errorCount, 0),
      warningCount: reports.reduce((sum, r) => sum + r.warningCount, 0),
      infoCount: reports.reduce((sum, r) => sum + r.infoCount, 0),
    };
  }
}
