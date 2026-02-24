'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  useGameAdminMutations,
  useOnlinePlayers,
  type OnlinePlayer,
} from '@/hooks/use-game-admin';
import {
  Ban,
  Crown,
  RefreshCw,
  Shield,
  Skull,
  UserMinus,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useState } from 'react';

interface PlayerListProps {
  onPlayerSelect?: (playerName: string) => void;
}

// god_level mapping: 0=mortal, 1=Immortal, 2=Builder, 3=Coder, 4=God, 5=Implementor
function getGodLevelBadge(godLevel: number) {
  if (godLevel >= 5)
    return {
      icon: Crown,
      label: 'Implementor',
      variant: 'destructive' as const,
    };
  if (godLevel >= 4)
    return { icon: Shield, label: 'God', variant: 'default' as const };
  if (godLevel >= 3)
    return { icon: Shield, label: 'Coder', variant: 'secondary' as const };
  if (godLevel >= 2)
    return { icon: Shield, label: 'Builder', variant: 'outline' as const };
  if (godLevel >= 1)
    return { icon: Shield, label: 'Immortal', variant: 'outline' as const };
  return null;
}

export function PlayerList({ onPlayerSelect }: PlayerListProps) {
  const { players, loading, error, refetch } = useOnlinePlayers();
  const { kickPlayer, kickLoading, banPlayer, banLoading } =
    useGameAdminMutations();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [kickDialog, setKickDialog] = useState<{
    open: boolean;
    player: OnlinePlayer | null;
  }>({ open: false, player: null });
  const [kickReason, setKickReason] = useState('');
  const [banDialog, setBanDialog] = useState<{
    open: boolean;
    player: OnlinePlayer | null;
  }>({ open: false, player: null });
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState('permanent');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleKick = async () => {
    if (!kickDialog.player) return;

    try {
      const result = await kickPlayer(kickDialog.player.name, kickReason);
      if (result.success) {
        setKickDialog({ open: false, player: null });
        setKickReason('');
        await refetch();
      } else {
        console.error('Kick failed:', result.message);
      }
    } catch (error) {
      console.error('Failed to kick player:', error);
    }
  };

  const handleBan = async () => {
    if (!banDialog.player || !banReason) return;

    let expiresAt: string | undefined;
    if (banDuration !== 'permanent') {
      const now = new Date();
      const hours = parseInt(banDuration, 10);
      now.setHours(now.getHours() + hours);
      expiresAt = now.toISOString();
    }

    try {
      const result = await banPlayer(
        banDialog.player.name,
        banReason,
        expiresAt
      );
      if (result.success) {
        setBanDialog({ open: false, player: null });
        setBanReason('');
        setBanDuration('permanent');
        await refetch();
      } else {
        console.error('Ban failed:', result.message);
      }
    } catch (error) {
      console.error('Failed to ban player:', error);
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Users className='h-5 w-5' />
            Online Players
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-red-600 text-sm'>
            Error loading players: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  const mortals = players.filter(p => p.godLevel < 1);
  const immortals = players.filter(p => p.godLevel >= 1);

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <Users className='h-5 w-5' />
                Online Players
                <Badge variant='secondary' className='text-xs'>
                  {players.length}
                </Badge>
              </CardTitle>
              <CardDescription>
                Players currently connected to FieryMUD
              </CardDescription>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading && players.length === 0 ? (
            <div className='flex items-center justify-center p-8'>
              <div className='text-muted-foreground'>Loading players...</div>
            </div>
          ) : players.length === 0 ? (
            <div className='text-center py-8'>
              <div className='text-muted-foreground mb-2'>
                No players online
              </div>
              <div className='text-sm text-gray-500'>
                The game server has no active connections.
              </div>
            </div>
          ) : (
            <div className='space-y-4'>
              {immortals.length > 0 && (
                <div>
                  <h4 className='text-sm font-medium mb-2 flex items-center gap-2'>
                    <Crown className='h-4 w-4 text-yellow-500' />
                    Immortals ({immortals.length})
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Class/Race</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Rank</TableHead>
                        <TableHead className='text-right'>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {immortals.map(player => (
                        <PlayerRow
                          key={player.name}
                          player={player}
                          onSelect={onPlayerSelect}
                          onKick={() => setKickDialog({ open: true, player })}
                          onBan={() => setBanDialog({ open: true, player })}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {mortals.length > 0 && (
                <div>
                  <h4 className='text-sm font-medium mb-2 flex items-center gap-2'>
                    <Skull className='h-4 w-4 text-gray-500' />
                    Mortals ({mortals.length})
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Class/Race</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead className='text-right'>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mortals.map(player => (
                        <PlayerRow
                          key={player.name}
                          player={player}
                          onSelect={onPlayerSelect}
                          onKick={() => setKickDialog({ open: true, player })}
                          onBan={() => setBanDialog({ open: true, player })}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kick Confirmation Dialog */}
      <Dialog
        open={kickDialog.open}
        onOpenChange={open =>
          setKickDialog({ open, player: open ? kickDialog.player : null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kick Player</DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect {kickDialog.player?.name} from
              the game?
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <Label htmlFor='kick-reason'>Reason (optional)</Label>
              <Input
                id='kick-reason'
                placeholder='Enter reason for kick...'
                value={kickReason}
                onChange={e => setKickReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setKickDialog({ open: false, player: null })}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={handleKick}
              disabled={kickLoading}
            >
              {kickLoading ? 'Kicking...' : 'Kick Player'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban Confirmation Dialog */}
      <Dialog
        open={banDialog.open}
        onOpenChange={open =>
          setBanDialog({ open, player: open ? banDialog.player : null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban Player</DialogTitle>
            <DialogDescription>
              Ban {banDialog.player?.name} from the game. This will also kick
              them if they are currently online.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <Label htmlFor='ban-reason'>Reason (required)</Label>
              <Input
                id='ban-reason'
                placeholder='Enter reason for ban...'
                value={banReason}
                onChange={e => setBanReason(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor='ban-duration'>Duration</Label>
              <select
                id='ban-duration'
                className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                value={banDuration}
                onChange={e => setBanDuration(e.target.value)}
              >
                <option value='1'>1 hour</option>
                <option value='24'>24 hours</option>
                <option value='168'>1 week</option>
                <option value='720'>30 days</option>
                <option value='permanent'>Permanent</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setBanDialog({ open: false, player: null })}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={handleBan}
              disabled={banLoading || !banReason}
            >
              {banLoading ? 'Banning...' : 'Ban Player'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

interface PlayerRowProps {
  player: OnlinePlayer;
  onSelect?: ((playerName: string) => void) | undefined;
  onKick: () => void;
  onBan: () => void;
}

function PlayerRow({ player, onSelect, onKick, onBan }: PlayerRowProps) {
  const godBadge = getGodLevelBadge(player.godLevel);

  return (
    <TableRow
      className='cursor-pointer hover:bg-muted/50'
      onClick={() => onSelect?.(player.name)}
    >
      <TableCell>
        <Tooltip>
          <TooltipTrigger>
            {player.isLinkdead ? (
              <WifiOff className='h-4 w-4 text-yellow-500' />
            ) : (
              <Wifi className='h-4 w-4 text-green-500' />
            )}
          </TooltipTrigger>
          <TooltipContent>
            {player.isLinkdead ? 'Link-dead' : 'Connected'}
          </TooltipContent>
        </Tooltip>
      </TableCell>
      <TableCell className='font-medium'>{player.name}</TableCell>
      <TableCell>{player.level}</TableCell>
      <TableCell>
        <span className='text-muted-foreground'>
          {player.class} / {player.race}
        </span>
      </TableCell>
      <TableCell>
        <Badge variant='outline' className='font-mono'>
          {player.roomZoneId}:{player.roomId}
        </Badge>
      </TableCell>
      {godBadge && (
        <TableCell>
          <Badge variant={godBadge.variant}>
            <godBadge.icon className='h-3 w-3 mr-1' />
            {godBadge.label}
          </Badge>
        </TableCell>
      )}
      <TableCell className='text-right'>
        <div className='flex items-center justify-end gap-1'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                onClick={e => {
                  e.stopPropagation();
                  onKick();
                }}
              >
                <UserMinus className='h-4 w-4 text-red-500' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Kick Player</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                onClick={e => {
                  e.stopPropagation();
                  onBan();
                }}
              >
                <Ban className='h-4 w-4 text-red-700' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ban Player</TooltipContent>
          </Tooltip>
        </div>
      </TableCell>
    </TableRow>
  );
}
