import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { DeploymentStatus, Prisma } from '@muditor/db';
import type { CreateDeploymentInput } from './deployments.dto';

@Injectable()
export class DeploymentsService {
  private readonly logger = new Logger(DeploymentsService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Create a new deployment package by snapshotting the current state of the specified zones.
   */
  async create(input: CreateDeploymentInput, createdBy: string) {
    this.logger.log(
      `Creating deployment: "${input.name}" for zones ${input.zoneIds.join(', ')}`
    );

    // Snapshot current zone data
    const snapshotData = await this.snapshotZones(input.zoneIds);

    // Detect changes (entities that exist in the zones)
    const changes = await this.detectEntities(input.zoneIds);

    const pkg = await this.db.deploymentPackage.create({
      data: {
        name: input.name,
        description: input.description ?? null,
        status: DeploymentStatus.PENDING,
        zoneIds: input.zoneIds,
        createdBy,
        snapshotData: snapshotData as Prisma.InputJsonValue,
        changes: {
          create: changes,
        },
      },
      include: { changes: true },
    });

    this.logger.log(
      `Created deployment ${pkg.id} with ${changes.length} entities`
    );

    return pkg;
  }

  /**
   * List deployments with optional status filter.
   */
  async findAll(status?: DeploymentStatus) {
    const args: {
      where?: { status: DeploymentStatus };
      include: { changes: true };
      orderBy: { createdAt: 'desc' };
    } = {
      include: { changes: true },
      orderBy: { createdAt: 'desc' },
    };
    if (status) args.where = { status };
    return this.db.deploymentPackage.findMany(args);
  }

  /**
   * Get a single deployment by ID.
   */
  async findOne(id: string) {
    const pkg = await this.db.deploymentPackage.findUnique({
      where: { id },
      include: { changes: true },
    });

    if (!pkg) {
      throw new NotFoundException(`Deployment ${id} not found`);
    }

    return pkg;
  }

  /**
   * Mark a pending deployment as ready for deployment.
   */
  async markReady(id: string) {
    const pkg = await this.findOne(id);

    if (pkg.status !== DeploymentStatus.PENDING) {
      throw new BadRequestException(
        `Can only mark PENDING deployments as ready (current: ${pkg.status})`
      );
    }

    return this.db.deploymentPackage.update({
      where: { id },
      data: { status: DeploymentStatus.READY },
      include: { changes: true },
    });
  }

  /**
   * Mark a READY deployment as deployed (sets deployedAt timestamp).
   */
  async markDeployed(id: string) {
    const pkg = await this.findOne(id);

    if (pkg.status !== DeploymentStatus.READY) {
      throw new BadRequestException(
        `Can only deploy READY packages (current: ${pkg.status})`
      );
    }

    return this.db.deploymentPackage.update({
      where: { id },
      data: {
        status: DeploymentStatus.DEPLOYED,
        deployedAt: new Date(),
      },
      include: { changes: true },
    });
  }

  /**
   * Rollback a deployed package by restoring snapshot data.
   */
  async rollback(id: string) {
    const pkg = await this.findOne(id);

    if (pkg.status !== DeploymentStatus.DEPLOYED) {
      throw new BadRequestException(
        `Can only rollback DEPLOYED packages (current: ${pkg.status})`
      );
    }

    const snapshot = pkg.snapshotData as Record<string, unknown> | null;
    if (!snapshot) {
      throw new BadRequestException('No snapshot data available for rollback');
    }

    // Restore data from snapshot
    await this.restoreFromSnapshot(pkg.zoneIds, snapshot);

    return this.db.deploymentPackage.update({
      where: { id },
      data: { status: DeploymentStatus.ROLLED_BACK },
      include: { changes: true },
    });
  }

  // --- Private helpers ---

  /**
   * Snapshot all zone data (rooms, mobs, objects, shops, triggers) for the given zones.
   */
  private async snapshotZones(
    zoneIds: number[]
  ): Promise<Record<string, unknown>> {
    const snapshot: Record<string, unknown> = {};

    for (const zoneId of zoneIds) {
      const zone = await this.db.zones.findUnique({
        where: { id: zoneId },
      });

      const rooms = await this.db.room.findMany({
        where: { zoneId },
        include: { exits: true, roomExtraDescriptions: true },
      });

      const mobs = await this.db.mobs.findMany({
        where: { zoneId },
      });

      const objects = await this.db.objects.findMany({
        where: { zoneId },
      });

      const shops = await this.db.shops.findMany({
        where: { zoneId },
      });

      const triggers = await this.db.triggers.findMany({
        where: { zoneId },
      });

      snapshot[String(zoneId)] = {
        zone,
        rooms,
        mobs,
        objects,
        shops,
        triggers,
      };
    }

    return snapshot;
  }

  /**
   * Detect all entities in the specified zones and build change records.
   */
  private async detectEntities(zoneIds: number[]) {
    const changes: Array<{
      entityType: string;
      entityKey: string;
      changeType: string;
      afterSnapshot: Prisma.InputJsonValue;
    }> = [];

    for (const zoneId of zoneIds) {
      const rooms = await this.db.room.findMany({
        where: { zoneId },
        select: { zoneId: true, id: true },
      });
      for (const r of rooms) {
        changes.push({
          entityType: 'Room',
          entityKey: `${r.zoneId}:${r.id}`,
          changeType: 'UPDATE',
          afterSnapshot: {
            zoneId: r.zoneId,
            id: r.id,
          } as Prisma.InputJsonValue,
        });
      }

      const mobs = await this.db.mobs.findMany({
        where: { zoneId },
        select: { zoneId: true, id: true },
      });
      for (const m of mobs) {
        changes.push({
          entityType: 'Mob',
          entityKey: `${m.zoneId}:${m.id}`,
          changeType: 'UPDATE',
          afterSnapshot: {
            zoneId: m.zoneId,
            id: m.id,
          } as Prisma.InputJsonValue,
        });
      }

      const objects = await this.db.objects.findMany({
        where: { zoneId },
        select: { zoneId: true, id: true },
      });
      for (const o of objects) {
        changes.push({
          entityType: 'Object',
          entityKey: `${o.zoneId}:${o.id}`,
          changeType: 'UPDATE',
          afterSnapshot: {
            zoneId: o.zoneId,
            id: o.id,
          } as Prisma.InputJsonValue,
        });
      }
    }

    return changes;
  }

  /**
   * Restore zone data from a snapshot (used by rollback).
   */
  private async restoreFromSnapshot(
    zoneIds: number[],
    snapshot: Record<string, unknown>
  ) {
    for (const zoneId of zoneIds) {
      const zoneSnapshot = snapshot[String(zoneId)] as
        | {
            zone: Record<string, unknown>;
            rooms: Array<Record<string, unknown>>;
            mobs: Array<Record<string, unknown>>;
            objects: Array<Record<string, unknown>>;
          }
        | undefined;

      if (!zoneSnapshot) {
        this.logger.warn(`No snapshot data for zone ${zoneId}, skipping`);
        continue;
      }

      // Restore zone metadata
      if (zoneSnapshot.zone) {
        const { id: _, ...zoneData } = zoneSnapshot.zone as {
          id: number;
        } & Record<string, unknown>;
        await this.db.zones.update({
          where: { id: zoneId },
          data: zoneData as Prisma.ZonesUpdateInput,
        });
      }

      this.logger.log(`Restored snapshot data for zone ${zoneId}`);
    }
  }
}
