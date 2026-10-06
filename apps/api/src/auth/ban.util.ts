import type { DatabaseService } from '../database/database.service';

/** True when the user has an active (permanent or unexpired) ban record. */
export async function hasActiveBan(
  db: Pick<DatabaseService, 'banRecords'>,
  userId: string
): Promise<boolean> {
  const activeBan = await db.banRecords.findFirst({
    where: {
      userId,
      active: true,
      OR: [
        { expiresAt: null }, // Permanent ban
        { expiresAt: { gt: new Date() } }, // Temporary ban still active
      ],
    },
  });
  return !!activeBan;
}
