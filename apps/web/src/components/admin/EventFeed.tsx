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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useAdminAlerts,
  useChatMessages,
  usePlayerActivity,
  useWorldEvents,
  type GameEvent,
} from '@/hooks/use-game-admin';
import {
  Activity,
  AlertTriangle,
  Bell,
  MessageCircle,
  Pause,
  Play,
  RefreshCw,
  Trash2,
  UserCheck,
  UserMinus,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface EventFeedProps {
  maxEvents?: number;
}

// Extended event type with unique ID for React keys
interface EventWithId extends GameEvent {
  id: string;
}

type EventCategory = 'chat' | 'player' | 'admin' | 'all';

const EVENT_TYPE_CONFIG: Record<
  string,
  { icon: React.ElementType; color: string; category: EventCategory }
> = {
  PLAYER_LOGIN: {
    icon: UserCheck,
    color: 'text-green-500',
    category: 'player',
  },
  PLAYER_LOGOUT: {
    icon: UserMinus,
    color: 'text-gray-500',
    category: 'player',
  },
  PLAYER_DEATH: { icon: Activity, color: 'text-red-500', category: 'player' },
  PLAYER_LEVEL_UP: {
    icon: Activity,
    color: 'text-yellow-500',
    category: 'player',
  },
  CHAT_GOSSIP: {
    icon: MessageCircle,
    color: 'text-purple-500',
    category: 'chat',
  },
  CHAT_SHOUT: {
    icon: MessageCircle,
    color: 'text-orange-500',
    category: 'chat',
  },
  CHAT_OOC: { icon: MessageCircle, color: 'text-blue-500', category: 'chat' },
  CHAT_CLAN: { icon: MessageCircle, color: 'text-cyan-500', category: 'chat' },
  ADMIN_CRASH: {
    icon: AlertTriangle,
    color: 'text-red-600',
    category: 'admin',
  },
  ADMIN_ZONE_RESET: {
    icon: RefreshCw,
    color: 'text-yellow-600',
    category: 'admin',
  },
  ADMIN_WARNING: {
    icon: AlertTriangle,
    color: 'text-yellow-500',
    category: 'admin',
  },
  ADMIN_SHUTDOWN: {
    icon: AlertTriangle,
    color: 'text-red-700',
    category: 'admin',
  },
};

function getEventConfig(type: string) {
  return (
    EVENT_TYPE_CONFIG[type] || {
      icon: Bell,
      color: 'text-gray-400',
      category: 'all',
    }
  );
}

export function EventFeed({ maxEvents = 100 }: EventFeedProps) {
  const [events, setEvents] = useState<EventWithId[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<EventCategory>('all');
  const [showChat, setShowChat] = useState(true);
  const [showPlayer, setShowPlayer] = useState(true);
  const [showAdmin, setShowAdmin] = useState(true);
  const [showWorld, setShowWorld] = useState(true);

  const feedEndRef = useRef<HTMLDivElement>(null);

  // Subscriptions
  const { message: chatMessage } = useChatMessages();
  const { activity: playerActivity } = usePlayerActivity();
  const { alert: adminAlert } = useAdminAlerts();
  const { event: worldEvent } = useWorldEvents();

  const addEvent = useCallback(
    (event: GameEvent | undefined) => {
      if (!event || isPaused) return;

      // Generate a unique ID for the event
      const eventWithId: EventWithId = {
        ...event,
        id: `${event.type}-${event.timestamp}-${Math.random().toString(36).substring(7)}`,
      };

      setEvents(prev => {
        // Check for duplicates based on timestamp and type
        const exists = prev.some(
          e =>
            e.type === event.type &&
            e.timestamp === event.timestamp &&
            e.message === event.message
        );
        if (exists) return prev;

        const newEvents = [eventWithId, ...prev];
        return newEvents.slice(0, maxEvents);
      });
    },
    [isPaused, maxEvents]
  );

  // Handle incoming events from subscriptions
  useEffect(() => {
    if (chatMessage && showChat) {
      addEvent(chatMessage);
    }
  }, [chatMessage, showChat, addEvent]);

  useEffect(() => {
    if (playerActivity && showPlayer) {
      addEvent(playerActivity);
    }
  }, [playerActivity, showPlayer, addEvent]);

  useEffect(() => {
    if (adminAlert && showAdmin) {
      addEvent(adminAlert);
    }
  }, [adminAlert, showAdmin, addEvent]);

  useEffect(() => {
    if (worldEvent && showWorld) {
      addEvent(worldEvent);
    }
  }, [worldEvent, showWorld, addEvent]);

  const clearEvents = () => {
    setEvents([]);
  };

  const filteredEvents = events.filter(event => {
    const config = getEventConfig(event.type);

    if (categoryFilter !== 'all' && config.category !== categoryFilter) {
      return false;
    }

    if (!showChat && config.category === 'chat') return false;
    if (!showPlayer && config.category === 'player') return false;
    if (!showAdmin && config.category === 'admin') return false;
    if (!showWorld && event.type.startsWith('ZONE_')) return false;

    return true;
  });

  return (
    <Card className='flex flex-col h-full'>
      <CardHeader className='flex-shrink-0'>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <Activity className='h-5 w-5' />
              Event Feed
              <Badge variant='secondary' className='text-xs'>
                {filteredEvents.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              Real-time events from FieryMUD server
            </CardDescription>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? (
                <Play className='h-4 w-4' />
              ) : (
                <Pause className='h-4 w-4' />
              )}
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={clearEvents}
              disabled={events.length === 0}
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className='flex flex-wrap items-center gap-4 pt-4 border-t mt-4'>
          <div className='flex items-center gap-2'>
            <Label className='text-sm text-muted-foreground'>Category:</Label>
            <Select
              value={categoryFilter}
              onValueChange={v => setCategoryFilter(v as EventCategory)}
            >
              <SelectTrigger className='w-28 h-8'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All</SelectItem>
                <SelectItem value='chat'>Chat</SelectItem>
                <SelectItem value='player'>Player</SelectItem>
                <SelectItem value='admin'>Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <Checkbox
                id='show-chat'
                checked={showChat}
                onCheckedChange={checked => setShowChat(!!checked)}
              />
              <Label htmlFor='show-chat' className='text-sm cursor-pointer'>
                Chat
              </Label>
            </div>
            <div className='flex items-center gap-2'>
              <Checkbox
                id='show-player'
                checked={showPlayer}
                onCheckedChange={checked => setShowPlayer(!!checked)}
              />
              <Label htmlFor='show-player' className='text-sm cursor-pointer'>
                Player
              </Label>
            </div>
            <div className='flex items-center gap-2'>
              <Checkbox
                id='show-admin'
                checked={showAdmin}
                onCheckedChange={checked => setShowAdmin(!!checked)}
              />
              <Label htmlFor='show-admin' className='text-sm cursor-pointer'>
                Admin
              </Label>
            </div>
            <div className='flex items-center gap-2'>
              <Checkbox
                id='show-world'
                checked={showWorld}
                onCheckedChange={checked => setShowWorld(!!checked)}
              />
              <Label htmlFor='show-world' className='text-sm cursor-pointer'>
                World
              </Label>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className='flex-1 overflow-hidden'>
        {isPaused && (
          <div className='bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2 mb-4 flex items-center justify-center gap-2'>
            <Pause className='h-4 w-4 text-yellow-500' />
            <span className='text-sm text-yellow-600'>Feed paused</span>
          </div>
        )}

        {filteredEvents.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-full text-muted-foreground'>
            <Activity className='h-12 w-12 mb-4 opacity-50' />
            <p className='text-sm'>No events yet</p>
            <p className='text-xs'>Events will appear here in real-time</p>
          </div>
        ) : (
          <div className='space-y-2 h-full overflow-y-auto pr-2'>
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
            <div ref={feedEndRef} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface EventCardProps {
  event: EventWithId;
}

function EventCard({ event }: EventCardProps) {
  const config = getEventConfig(event.type);
  const Icon = config.icon;
  const timestamp = new Date(event.timestamp);

  return (
    <div className='flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors'>
      <div className={`mt-0.5 ${config.color}`}>
        <Icon className='h-4 w-4' />
      </div>
      <div className='flex-1 min-w-0'>
        <div className='flex items-center justify-between gap-2'>
          <div className='flex items-center gap-2'>
            <Badge variant='outline' className='text-xs'>
              {event.type.replace('_', ' ')}
            </Badge>
            {event.playerName && (
              <span className='font-medium text-sm'>{event.playerName}</span>
            )}
          </div>
          <span className='text-xs text-muted-foreground flex-shrink-0'>
            {timestamp.toLocaleTimeString()}
          </span>
        </div>
        {event.message && (
          <p className='text-sm mt-1 text-muted-foreground'>{event.message}</p>
        )}
        {event.zoneId !== undefined && (
          <div className='mt-1'>
            <Badge variant='secondary' className='text-xs font-mono'>
              Zone #{event.zoneId}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
