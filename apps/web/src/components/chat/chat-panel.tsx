'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ChatFilter, ChatMessage } from '@/hooks/use-chat-panel';
import { Send, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ChatChannel {
  value: string;
  label: string;
}

interface ChatCharacter {
  name: string;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  allMessageCount: number;
  activeFilter: ChatFilter;
  onFilterChange: (filter: ChatFilter) => void;
  selectedCharacter: string;
  onCharacterChange: (name: string) => void;
  selectedChannel: string;
  onChannelChange: (channel: string) => void;
  channels: ChatChannel[];
  characters: ChatCharacter[];
  sending: boolean;
  onSendMessage: (text: string) => Promise<void>;
  onClear: () => void;
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  CHAT_GOSSIP: 'text-purple-400',
  CHAT_SHOUT: 'text-orange-400',
  CHAT_OOC: 'text-blue-400',
  CHAT_CLAN: 'text-cyan-400',
  PLAYER_LOGIN: 'text-green-400',
  PLAYER_LOGOUT: 'text-gray-500',
  PLAYER_DEATH: 'text-red-400',
  PLAYER_LEVEL_UP: 'text-yellow-400',
  ADMIN_ZONE_RESET: 'text-yellow-600',
  ADMIN_CRASH: 'text-red-600',
  ADMIN_WARNING: 'text-yellow-500',
  ADMIN_SHUTDOWN: 'text-red-700',
};

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    CHAT_GOSSIP: 'gossip',
    CHAT_SHOUT: 'shout',
    CHAT_OOC: 'ooc',
    CHAT_CLAN: 'clan',
    PLAYER_LOGIN: 'login',
    PLAYER_LOGOUT: 'logout',
    PLAYER_DEATH: 'death',
    PLAYER_LEVEL_UP: 'level',
    ADMIN_ZONE_RESET: 'reset',
    ADMIN_CRASH: 'crash',
    ADMIN_WARNING: 'warning',
    ADMIN_SHUTDOWN: 'shutdown',
  };
  return labels[type] ?? type.toLowerCase().replace(/_/g, ' ');
}

function MessageRow({ msg }: { msg: ChatMessage }) {
  const time = new Date(msg.timestamp);
  const hh = time.getHours().toString().padStart(2, '0');
  const mm = time.getMinutes().toString().padStart(2, '0');
  const color = EVENT_TYPE_COLORS[msg.type] ?? 'text-gray-400';
  const label = getTypeLabel(msg.type);

  return (
    <div className='px-3 py-1 text-sm hover:bg-muted/50 leading-relaxed'>
      <span className='text-muted-foreground text-xs font-mono'>
        [{hh}:{mm}]
      </span>{' '}
      <span className={`text-xs font-medium ${color}`}>[{label}]</span>{' '}
      {msg.playerName && (
        <span className='font-medium'>{msg.playerName}: </span>
      )}
      <span className='text-muted-foreground'>{msg.message}</span>
    </div>
  );
}

export function ChatPanel({
  messages,
  allMessageCount,
  activeFilter,
  onFilterChange,
  selectedCharacter,
  onCharacterChange,
  selectedChannel,
  onChannelChange,
  channels,
  characters,
  sending,
  onSendMessage,
  onClear,
}: ChatPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);

  // Auto-scroll to bottom when new messages arrive (unless user scrolled up)
  useEffect(() => {
    if (!userScrolledUpRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    userScrolledUpRef.current = scrollHeight - scrollTop - clientHeight > 40;
  }, []);

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || sending) return;
    const text = inputValue;
    setInputValue('');
    try {
      await onSendMessage(text);
    } catch {
      setInputValue(text);
    }
  }, [inputValue, sending, onSendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className='fixed bottom-24 right-6 z-50 w-96 h-[32rem] bg-background border rounded-lg shadow-xl flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between px-4 py-3 border-b flex-shrink-0'>
        <div className='flex items-center gap-2'>
          <h3 className='font-semibold text-sm'>Game Chat</h3>
          <Badge variant='secondary' className='text-xs'>
            {allMessageCount}
          </Badge>
        </div>
        <Button
          variant='ghost'
          size='sm'
          onClick={onClear}
          disabled={allMessageCount === 0}
          className='h-7 w-7 p-0'
        >
          <Trash2 className='h-3.5 w-3.5' />
        </Button>
      </div>

      {/* Filter tabs */}
      <div className='px-3 py-2 border-b flex-shrink-0'>
        <Tabs
          value={activeFilter}
          onValueChange={v => onFilterChange(v as ChatFilter)}
        >
          <TabsList className='w-full h-8'>
            <TabsTrigger value='all' className='text-xs flex-1'>
              All
            </TabsTrigger>
            <TabsTrigger value='chat' className='text-xs flex-1'>
              Chat
            </TabsTrigger>
            <TabsTrigger value='players' className='text-xs flex-1'>
              Players
            </TabsTrigger>
            <TabsTrigger value='world' className='text-xs flex-1'>
              World
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Message list */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className='flex-1 overflow-y-auto'
      >
        {messages.length === 0 ? (
          <div className='flex items-center justify-center h-full text-muted-foreground text-sm'>
            No messages yet
          </div>
        ) : (
          <>
            {messages.map(msg => (
              <MessageRow key={msg.id} msg={msg} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className='border-t p-3 flex-shrink-0 space-y-2'>
        <div className='flex gap-2'>
          <Select value={selectedCharacter} onValueChange={onCharacterChange}>
            <SelectTrigger className='w-[45%] h-8 text-xs'>
              <SelectValue placeholder='Character' />
            </SelectTrigger>
            <SelectContent>
              {characters.map(c => (
                <SelectItem key={c.name} value={c.name} className='text-xs'>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedChannel} onValueChange={onChannelChange}>
            <SelectTrigger className='w-[35%] h-8 text-xs'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {channels.map(ch => (
                <SelectItem key={ch.value} value={ch.value} className='text-xs'>
                  {ch.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='flex gap-2'>
          <Input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedCharacter ? 'Type a message...' : 'Select a character'
            }
            disabled={!selectedCharacter || sending}
            className='h-8 text-sm'
          />
          <Button
            size='sm'
            onClick={handleSend}
            disabled={!selectedCharacter || !inputValue.trim() || sending}
            className='h-8 w-8 p-0'
          >
            <Send className='h-3.5 w-3.5' />
          </Button>
        </div>
      </div>
    </div>
  );
}
