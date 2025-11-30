'use client';

import { PermissionGuard } from '@/components/auth/permission-guard';
import { ClimateBadge } from '@/components/ui/climate-badge';
import { EditZoneModal } from '@/components/zones/edit-zone-modal';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface ZoneDetail {
  id: number;
  name: string;
  lifespan: number;
  climate: string;
  resetMode: string;
  hemisphere: string;
  _count: {
    rooms: number;
    mobs: number;
    objects: number;
    shops: number;
  };
}

export default function ZoneDetailPage() {
  return (
    <PermissionGuard requireImmortal={true}>
      <ZoneDetailContent />
    </PermissionGuard>
  );
}

function ZoneDetailContent() {
  const params = useParams();
  const zoneId = params.id as string;
  const [zone, setZone] = useState<ZoneDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchZone = useCallback(async () => {
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query GetZone($id: Int!) {
                zone(id: $id) {
                  id
                  name
                  lifespan
                  climate
                  resetMode
                  hemisphere
                  _count {
                    rooms
                    mobs
                    objects
                    shops
                  }
                }
              }
            `,
            variables: { id: parseInt(zoneId) },
          }),
        }
      );

      const data = await response.json();
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      if (!data.data.zone) {
        throw new Error('Zone not found');
      }

      setZone(data.data.zone);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch zone');
    } finally {
      setLoading(false);
    }
  }, [zoneId]);

  useEffect(() => {
    fetchZone();
  }, [fetchZone]);

  if (loading) {
    return (
      <div className='animate-pulse'>
        <div className='h-8 bg-gray-200 rounded w-1/3 mb-6'></div>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='h-4 bg-gray-200 rounded w-1/4 mb-4'></div>
            <div className='space-y-2'>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className='h-3 bg-gray-200 rounded'></div>
              ))}
            </div>
          </div>
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='h-4 bg-gray-200 rounded w-1/4 mb-4'></div>
            <div className='space-y-3'>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className='h-4 bg-gray-200 rounded'></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !zone) {
    return (
      <div className='bg-red-50 border border-red-200 rounded-md p-4'>
        <h3 className='text-red-800 font-medium'>Error loading zone</h3>
        <p className='text-red-600 text-sm mt-1'>{error || 'Zone not found'}</p>
        <Link
          href='/dashboard/zones'
          className='text-red-700 hover:text-red-900 text-sm underline mt-2 inline-block'
        >
          ← Back to zones
        </Link>
      </div>
    );
  }

  // Calculate zone health score (simple heuristic)
  const hasRooms = zone._count.rooms > 0;
  const hasMobs = zone._count.mobs > 0;
  const hasObjects = zone._count.objects > 0;
  const healthScore = [hasRooms, hasMobs, hasObjects].filter(Boolean).length;
  const healthStatus =
    healthScore === 3
      ? 'healthy'
      : healthScore >= 2
        ? 'moderate'
        : 'needs-attention';

  return (
    <div className='space-y-6'>
      {/* Zone Header with Health Status */}
      <div className='bg-card rounded-lg border p-6'>
        <div className='flex items-center justify-between'>
          <div className='flex-1'>
            <h1 className='text-3xl font-bold text-foreground'>{zone.name}</h1>
            <p className='text-muted-foreground mt-1'>Zone ID: {zone.id}</p>
          </div>
          <div className='flex items-center gap-3'>
            <span className='inline-flex items-center gap-1 rounded-md border border-border bg-muted text-muted-foreground px-3 py-1 text-sm'>
              <span
                className={`w-2 h-2 rounded-full ${healthStatus === 'healthy' ? 'bg-primary' : healthStatus === 'moderate' ? 'bg-secondary' : 'bg-destructive'}`}
              />
              {healthStatus === 'healthy'
                ? 'Healthy'
                : healthStatus === 'moderate'
                  ? 'Moderate'
                  : 'Needs Attention'}
            </span>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className='bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm'
            >
              ✏️ Edit Zone
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Grid - Now full width at top */}
      <div className='bg-card rounded-lg border p-6'>
        <h2 className='text-xl font-semibold text-foreground mb-4'>
          Zone Content
        </h2>
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
          <Link
            href={`/dashboard/rooms?zone=${zone.id}`}
            className='text-center p-6 bg-card border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer'
          >
            <div className='text-3xl font-bold text-foreground'>
              {zone._count.rooms}
            </div>
            <div className='text-sm text-muted-foreground mt-1'>Rooms</div>
          </Link>
          <Link
            href={`/dashboard/mobs?zone=${zone.id}`}
            className='text-center p-6 bg-card border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer'
          >
            <div className='text-3xl font-bold text-foreground'>
              {zone._count.mobs}
            </div>
            <div className='text-sm text-muted-foreground mt-1'>Mobs</div>
          </Link>
          <Link
            href={`/dashboard/objects?zone=${zone.id}`}
            className='text-center p-6 bg-card border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer'
          >
            <div className='text-3xl font-bold text-foreground'>
              {zone._count.objects}
            </div>
            <div className='text-sm text-muted-foreground mt-1'>Objects</div>
          </Link>
          <Link
            href={`/dashboard/shops?zone=${zone.id}`}
            className='text-center p-6 bg-card border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer'
          >
            <div className='text-3xl font-bold text-foreground'>
              {zone._count.shops}
            </div>
            <div className='text-sm text-muted-foreground mt-1'>Shops</div>
          </Link>
        </div>
      </div>

      {/* Zone Configuration */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='bg-card rounded-lg border p-6'>
          <h3 className='text-lg font-semibold text-foreground mb-4'>
            Reset Configuration
          </h3>
          <div className='space-y-3'>
            <div>
              <label className='block text-sm font-medium text-muted-foreground'>
                Lifespan
              </label>
              <p className='text-foreground font-semibold mt-1'>
                {zone.lifespan} minutes
              </p>
            </div>
            <div>
              <label className='block text-sm font-medium text-muted-foreground'>
                Reset Mode
              </label>
              <p className='text-foreground font-semibold mt-1'>
                {zone.resetMode}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-card rounded-lg border p-6'>
          <h3 className='text-lg font-semibold text-foreground mb-4'>
            Environment
          </h3>
          <div className='space-y-3'>
            <div>
              <label className='block text-sm font-medium text-muted-foreground'>
                Climate
              </label>
              <ClimateBadge climate={zone.climate} />
            </div>
            <div>
              <label className='block text-sm font-medium text-muted-foreground'>
                Hemisphere
              </label>
              <p className='text-foreground font-semibold mt-1'>
                {zone.hemisphere}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-card rounded-lg border p-6'>
          <h3 className='text-lg font-semibold text-foreground mb-4'>
            Quick Actions
          </h3>
          <div className='space-y-2'>
            <Link
              href={`/dashboard/zones/editor?zone=${zone.id}`}
              className='block w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-center'
            >
              Visual Editor
            </Link>
            <Link
              href={`/dashboard/rooms?zone=${zone.id}`}
              className='block w-full bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors text-center'
            >
              Browse Rooms
            </Link>
          </div>
        </div>
      </div>

      {/* Edit Zone Modal */}
      {zone && (
        <EditZoneModal
          zone={{
            id: zone.id,
            name: zone.name,
            lifespan: zone.lifespan,
            resetMode: zone.resetMode,
            hemisphere: zone.hemisphere,
            climate: zone.climate,
          }}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            fetchZone();
          }}
        />
      )}
    </div>
  );
}
