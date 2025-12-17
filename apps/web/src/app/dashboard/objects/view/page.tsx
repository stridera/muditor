'use client';

import { PermissionGuard } from '@/components/auth/permission-guard';
import { ColoredTextInline } from '@/components/ColoredTextViewer';
import { Button } from '@/components/ui/button';
import {
  GetObjectDocument,
  type GetObjectQuery,
  type GetObjectQueryVariables,
} from '@/generated/graphql';
import { useQuery } from '@apollo/client/react';
import { Edit, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function ObjectViewPage() {
  return (
    <PermissionGuard requireImmortal={true}>
      <ObjectViewContent />
    </PermissionGuard>
  );
}

function ObjectViewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const zoneParam = searchParams.get('zone');
  const idParam = searchParams.get('id');

  const zoneId = zoneParam ? parseInt(zoneParam) : null;
  const objectId = idParam ? parseInt(idParam) : null;

  // Redirect to list if missing parameters
  useEffect(() => {
    if (zoneId === null || objectId === null) {
      router.push('/dashboard/objects');
    }
  }, [zoneId, objectId, router]);

  const { loading, error, data } = useQuery<
    GetObjectQuery,
    GetObjectQueryVariables
  >(GetObjectDocument, {
    variables: { id: objectId!, zoneId: zoneId! },
    skip: zoneId === null || objectId === null,
  });

  if (loading) {
    return (
      <div className='container mx-auto p-6'>
        <div className='text-center py-12'>Loading object details...</div>
      </div>
    );
  }

  if (error || !data?.object) {
    return (
      <div className='container mx-auto p-6'>
        <div className='text-center py-12 text-red-600'>
          Error loading object: {error?.message || 'Object not found'}
        </div>
      </div>
    );
  }

  const obj = data.object;

  return (
    <div className='container mx-auto p-6 max-w-4xl'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-4'>
          <Link href={`/dashboard/objects?zone=${zoneId}`}>
            <Button variant='outline' size='sm'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back to List
            </Button>
          </Link>
          <h1 className='text-3xl font-bold'>
            Object #{obj.id} - <ColoredTextInline markup={obj.name} />
          </h1>
        </div>
        <Link href={`/dashboard/objects/editor?zone=${zoneId}&id=${objectId}`}>
          <Button>
            <Edit className='w-4 h-4 mr-2' />
            Edit
          </Button>
        </Link>
      </div>

      {/* Object Details Card */}
      <div className='bg-card border rounded-lg p-6 space-y-6'>
        {/* Basic Info */}
        <section>
          <h2 className='text-xl font-semibold mb-4'>Basic Information</h2>
          <dl className='grid grid-cols-2 gap-4'>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Zone
              </dt>
              <dd className='text-base'>{obj.zoneId}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>ID</dt>
              <dd className='text-base'>{obj.id}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Type
              </dt>
              <dd className='text-base'>{obj.type}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Level
              </dt>
              <dd className='text-base'>{obj.level}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Weight
              </dt>
              <dd className='text-base'>{obj.weight}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Cost
              </dt>
              <dd className='text-base'>{obj.cost}</dd>
            </div>
          </dl>
        </section>

        {/* Keywords */}
        <section>
          <h2 className='text-xl font-semibold mb-2'>Keywords</h2>
          <div className='flex flex-wrap gap-2'>
            {obj.keywords.map((kw, i) => (
              <span
                key={i}
                className='px-2 py-1 bg-secondary text-secondary-foreground rounded text-sm'
              >
                {kw}
              </span>
            ))}
          </div>
        </section>

        {/* Descriptions */}
        <section>
          <h2 className='text-xl font-semibold mb-4'>Descriptions</h2>
          <div className='space-y-4'>
            <div>
              <h3 className='text-sm font-medium text-muted-foreground mb-2'>
                Room Description
              </h3>
              <p className='bg-muted p-3 rounded'>
                <ColoredTextInline markup={obj.roomDescription} />
              </p>
            </div>
            <div>
              <h3 className='text-sm font-medium text-muted-foreground mb-2'>
                Examine Description
              </h3>
              <p className='bg-muted p-3 rounded'>
                <ColoredTextInline markup={obj.examineDescription} />
              </p>
            </div>
            {obj.actionDescription && (
              <div>
                <h3 className='text-sm font-medium text-muted-foreground mb-2'>
                  Action Description
                </h3>
                <p className='bg-muted p-3 rounded'>
                  <ColoredTextInline markup={obj.actionDescription} />
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Properties */}
        <section>
          <h2 className='text-xl font-semibold mb-4'>Properties</h2>
          <dl className='grid grid-cols-2 gap-4'>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Timer
              </dt>
              <dd className='text-base'>{obj.timer}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Decompose Timer
              </dt>
              <dd className='text-base'>{obj.decomposeTimer}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Concealment
              </dt>
              <dd className='text-base'>{obj.concealment}</dd>
            </div>
          </dl>
        </section>

        {/* Flags */}
        {obj.flags && obj.flags.length > 0 && (
          <section>
            <h2 className='text-xl font-semibold mb-2'>Object Flags</h2>
            <div className='flex flex-wrap gap-2'>
              {obj.flags.map((flag, i) => (
                <span
                  key={i}
                  className='px-2 py-1 bg-accent text-accent-foreground rounded text-sm'
                >
                  {flag}
                </span>
              ))}
            </div>
          </section>
        )}

        {obj.effectFlags && obj.effectFlags.length > 0 && (
          <section>
            <h2 className='text-xl font-semibold mb-2'>Effect Flags</h2>
            <div className='flex flex-wrap gap-2'>
              {obj.effectFlags.map((flag, i) => (
                <span
                  key={i}
                  className='px-2 py-1 bg-primary/10 text-primary rounded text-sm border border-primary/20'
                >
                  {flag}
                </span>
              ))}
            </div>
          </section>
        )}

        {obj.wearFlags && obj.wearFlags.length > 0 && (
          <section>
            <h2 className='text-xl font-semibold mb-2'>Wear Flags</h2>
            <div className='flex flex-wrap gap-2'>
              {obj.wearFlags.map((flag, i) => (
                <span
                  key={i}
                  className='px-2 py-1 bg-muted text-muted-foreground rounded text-sm border border-border'
                >
                  {flag}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Type-Specific Values */}
        {obj.values && Object.keys(obj.values).length > 0 && (
          <section>
            <h2 className='text-xl font-semibold mb-4'>Type-Specific Values</h2>
            <dl className='grid grid-cols-2 gap-4'>
              {Object.entries(obj.values).map(([key, value]) => (
                <div key={key}>
                  <dt className='text-sm font-medium text-muted-foreground'>
                    {key}
                  </dt>
                  <dd className='text-base'>
                    {typeof value === 'object' && value !== null
                      ? JSON.stringify(value, null, 2)
                      : String(value)}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* Timestamps */}
        <section>
          <h2 className='text-xl font-semibold mb-4'>Metadata</h2>
          <dl className='grid grid-cols-2 gap-4'>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Created
              </dt>
              <dd className='text-base text-sm'>
                {new Date(obj.createdAt).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Last Updated
              </dt>
              <dd className='text-base text-sm'>
                {new Date(obj.updatedAt).toLocaleString()}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
