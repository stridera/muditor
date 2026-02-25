'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useAuth } from '@/contexts/auth-context';
import {
  useChatMessages,
  usePlayerActivity,
  useWorldEvents,
  type GameEvent,
} from '@/hooks/use-game-admin';
import {
  SendGameChatDocument,
  GetMyCharactersDocument,
  type GetMyCharactersQuery,
} from '@/generated/graphql';

export type ChatFilter = 'all' | 'chat' | 'players' | 'world';

export interface ChatMessage extends GameEvent {
  id: string;
}

const MAX_MESSAGES = 500;

function getStoredValue<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setStoredValue(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage may be full or unavailable
  }
}

export function useChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(() =>
    getStoredValue('chat-expanded', false)
  );
  const [selectedCharacter, setSelectedCharacter] = useState<string>(() =>
    getStoredValue('chat-character', '')
  );
  const [selectedChannel, setSelectedChannel] = useState<string>(() =>
    getStoredValue('chat-channel', 'gossip')
  );
  const [activeFilter, setActiveFilter] = useState<ChatFilter>('all');

  const { user } = useAuth();
  const channels = useMemo(() => {
    const roleLevel: Record<string, number> = {
      PLAYER: 1,
      IMMORTAL: 2,
      BUILDER: 3,
      HEAD_BUILDER: 4,
      CODER: 5,
      GOD: 6,
    };
    const level = roleLevel[user?.role ?? ''] ?? 0;
    const chs = [{ value: 'gossip', label: 'gossip' }];
    if (level >= roleLevel.IMMORTAL) {
      chs.push({ value: 'wiznet', label: 'wiznet' });
    }
    return chs;
  }, [user?.role]);

  const isExpandedRef = useRef(isExpanded);
  isExpandedRef.current = isExpanded;

  // Persist preferences
  useEffect(() => {
    setStoredValue('chat-expanded', isExpanded);
  }, [isExpanded]);
  useEffect(() => {
    setStoredValue('chat-character', selectedCharacter);
  }, [selectedCharacter]);
  useEffect(() => {
    setStoredValue('chat-channel', selectedChannel);
  }, [selectedChannel]);

  // Fetch user's characters
  const { data: charactersData } = useQuery<GetMyCharactersQuery>(
    GetMyCharactersDocument
  );
  const characters = charactersData?.myCharacters ?? [];

  // Send chat mutation
  const [sendChatMutation, { loading: sending }] =
    useMutation(SendGameChatDocument);

  // Subscriptions
  const { message: chatMessage } = useChatMessages();
  const { activity: playerActivity } = usePlayerActivity();
  const { event: worldEvent } = useWorldEvents();

  const addMessage = useCallback((event: GameEvent | undefined) => {
    if (!event) return;

    const msg: ChatMessage = {
      ...event,
      id: `${event.type}-${event.timestamp}-${Math.random().toString(36).substring(7)}`,
    };

    setMessages(prev => {
      const exists = prev.some(
        m =>
          m.type === event.type &&
          m.timestamp === event.timestamp &&
          m.message === event.message
      );
      if (exists) return prev;

      const updated = [...prev, msg];
      return updated.length > MAX_MESSAGES
        ? updated.slice(updated.length - MAX_MESSAGES)
        : updated;
    });

    if (!isExpandedRef.current) {
      setUnreadCount(c => c + 1);
    }
  }, []);

  // Handle incoming events
  useEffect(() => {
    addMessage(chatMessage);
  }, [chatMessage, addMessage]);

  useEffect(() => {
    addMessage(playerActivity);
  }, [playerActivity, addMessage]);

  useEffect(() => {
    addMessage(worldEvent);
  }, [worldEvent, addMessage]);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => {
      const next = !prev;
      if (next) setUnreadCount(0);
      return next;
    });
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!selectedCharacter || !text.trim()) return;

      try {
        await sendChatMutation({
          variables: {
            characterName: selectedCharacter,
            channel: selectedChannel,
            message: text.trim(),
          },
        });
      } catch (error) {
        console.error('Failed to send chat message:', error);
        throw error;
      }
    },
    [selectedCharacter, selectedChannel, sendChatMutation]
  );

  // Filter messages based on active filter
  const filteredMessages = messages.filter(msg => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'chat') return msg.type.startsWith('CHAT_');
    if (activeFilter === 'players')
      return (
        msg.type === 'PLAYER_LOGIN' ||
        msg.type === 'PLAYER_LOGOUT' ||
        msg.type === 'PLAYER_DEATH' ||
        msg.type === 'PLAYER_LEVEL_UP'
      );
    if (activeFilter === 'world')
      return (
        msg.type.startsWith('ZONE_') ||
        msg.type.startsWith('ADMIN_ZONE_') ||
        msg.type === 'WORLD_EVENT'
      );
    return true;
  });

  return {
    messages: filteredMessages,
    allMessageCount: messages.length,
    unreadCount,
    isExpanded,
    selectedCharacter,
    setSelectedCharacter,
    selectedChannel,
    setSelectedChannel,
    activeFilter,
    setActiveFilter,
    channels,
    characters,
    sending,
    toggleExpanded,
    clearMessages,
    sendMessage,
  };
}
