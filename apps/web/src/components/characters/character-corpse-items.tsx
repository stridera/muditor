'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ColoredText } from '@/lib/color-codes';
import { Skull } from 'lucide-react';
import type { CorpseItemGroup } from './character-items';

interface CorpseItem {
  id: number | string;
  condition: number;
  charges: number;
  objects: { name: string };
}

/**
 * Read-only list of what lies in a character's corpse. These rows are not
 * the character's inventory: the game moves them back when the corpse is
 * looted, so they are shown here but never edited from the inventory view.
 */
export function CharacterCorpseItems({
  group,
}: {
  group: CorpseItemGroup<CorpseItem>;
}) {
  const room =
    group.roomZoneId != null && group.roomId != null
      ? `room ${group.roomZoneId}:${group.roomId}`
      : 'unknown room';
  return (
    <Card data-testid={`corpse-items-${group.corpseId}`}>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Skull className='h-5 w-5' />
          On corpse ({room}) - {group.items.length} items
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          {group.items.map(item => (
            <div
              key={item.id}
              className='flex items-center justify-between p-2 border rounded'
            >
              <div className='flex-1'>
                <div className='font-medium'>
                  <ColoredText text={item.objects.name} />
                </div>
                <div className='text-sm text-muted-foreground'>
                  Condition: {item.condition}%
                </div>
              </div>
              {item.charges > 0 && (
                <Badge variant='secondary'>{item.charges} charges</Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
