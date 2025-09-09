'use client';

import { useEnvironment } from '@/contexts/environment-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Database } from 'lucide-react';

export function EnvironmentSelector() {
  const { currentEnvironment, setEnvironment, environments } = useEnvironment();

  const currentEnvConfig = environments.find(
    env => env.value === currentEnvironment
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='sm' className='h-8'>
          <Database className='mr-2 h-3 w-3' />
          <Badge className={`mr-2 ${currentEnvConfig?.color}`}>
            {currentEnvConfig?.label}
          </Badge>
          <ChevronDown className='h-3 w-3' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>Switch Environment</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {environments.map(env => (
          <DropdownMenuItem
            key={env.value}
            onClick={() => setEnvironment(env.value)}
            className={currentEnvironment === env.value ? 'bg-gray-100' : ''}
          >
            <Badge className={`mr-2 ${env.color}`}>{env.label}</Badge>
            {currentEnvironment === env.value && (
              <span className='ml-auto text-xs text-gray-500'>Current</span>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <div className='px-2 py-1 text-xs text-gray-500'>
          Environment affects database and API connections
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
