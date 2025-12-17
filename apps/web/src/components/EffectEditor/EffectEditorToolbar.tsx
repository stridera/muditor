'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Blocks, Code, Save, CheckCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormulaHelpDialog } from './FormulaHelpDialog';

export interface ZoneOption {
  id: number;
  name: string;
}

export interface EffectEditorToolbarProps {
  viewMode: 'blocks' | 'json';
  onViewModeChange: (mode: 'blocks' | 'json') => void;
  onSave?: (() => void) | undefined;
  onValidate?: (() => boolean) | undefined;
  readOnly?: boolean | undefined;
  effectCount: number;
  /** Available zones for filtering mobs/objects */
  zones?: ZoneOption[];
  /** Currently selected zone ID */
  selectedZoneId?: number | null;
  /** Called when zone selection changes */
  onZoneChange?: (zoneId: number | null) => void;
}

export function EffectEditorToolbar({
  viewMode,
  onViewModeChange,
  onSave,
  onValidate,
  readOnly = false,
  effectCount,
  zones = [],
  selectedZoneId,
  onZoneChange,
}: EffectEditorToolbarProps) {
  const handleValidate = () => {
    if (onValidate) {
      const isValid = onValidate();
      console.log('Validation result:', isValid);
    }
  };

  return (
    <div className='flex items-center gap-2'>
      {/* Zone filter */}
      {zones.length > 0 && onZoneChange && (
        <Select
          value={selectedZoneId?.toString() ?? 'all'}
          onValueChange={value =>
            onZoneChange(value === 'all' ? null : Number(value))
          }
        >
          <SelectTrigger className='w-[180px] h-8 text-sm'>
            <SelectValue placeholder='Filter by zone' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Zones</SelectItem>
            {zones.map(zone => (
              <SelectItem key={zone.id} value={zone.id.toString()}>
                {zone.name} ({zone.id})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* View mode toggle */}
      <div className='flex border rounded-md'>
        <Button
          variant='ghost'
          size='sm'
          className={cn(
            'gap-1 rounded-r-none',
            viewMode === 'blocks' && 'bg-muted'
          )}
          onClick={() => onViewModeChange('blocks')}
        >
          <Blocks className='h-4 w-4' />
          <span className='hidden sm:inline'>Blocks</span>
        </Button>
        <Button
          variant='ghost'
          size='sm'
          className={cn(
            'gap-1 rounded-l-none border-l',
            viewMode === 'json' && 'bg-muted'
          )}
          onClick={() => onViewModeChange('json')}
        >
          <Code className='h-4 w-4' />
          <span className='hidden sm:inline'>JSON</span>
        </Button>
      </div>

      {effectCount > 0 && (
        <Badge variant='secondary' className='hidden sm:flex'>
          {effectCount} effect{effectCount !== 1 ? 's' : ''}
        </Badge>
      )}

      {/* Formula help dialog */}
      <FormulaHelpDialog
        trigger={
          <Button variant='ghost' size='sm' className='gap-1'>
            <HelpCircle className='h-4 w-4' />
            <span className='hidden sm:inline'>Help</span>
          </Button>
        }
      />

      {!readOnly && (
        <>
          <Button
            variant='outline'
            size='sm'
            onClick={handleValidate}
            className='gap-1'
          >
            <CheckCircle className='h-4 w-4' />
            <span className='hidden sm:inline'>Validate</span>
          </Button>

          {onSave && (
            <Button
              variant='default'
              size='sm'
              onClick={onSave}
              className='gap-1'
            >
              <Save className='h-4 w-4' />
              <span className='hidden sm:inline'>Save</span>
            </Button>
          )}
        </>
      )}
    </div>
  );
}

export default EffectEditorToolbar;
