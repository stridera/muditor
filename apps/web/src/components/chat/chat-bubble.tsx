'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';

interface ChatBubbleProps {
  isExpanded: boolean;
  unreadCount: number;
  onToggle: () => void;
}

export function ChatBubble({
  isExpanded,
  unreadCount,
  onToggle,
}: ChatBubbleProps) {
  return (
    <Button
      onClick={onToggle}
      size='icon'
      className='fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg'
    >
      {isExpanded ? (
        <X className='h-6 w-6' />
      ) : (
        <MessageCircle className='h-6 w-6' />
      )}
      {!isExpanded && unreadCount > 0 && (
        <Badge
          variant='destructive'
          className='absolute -top-1 -right-1 h-5 min-w-5 px-1 text-xs'
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
}
