'use client';

import { useChatPanel } from '@/hooks/use-chat-panel';
import { usePathname } from 'next/navigation';
import { ChatBubble } from './chat-bubble';
import { ChatPanel } from './chat-panel';

// The visual editor's save buttons sit in the bottom-right corner where the
// floating bubble would otherwise cover them.
const HIDDEN_ON_PREFIXES = ['/dashboard/zones/editor'];

export function ChatContainer() {
  const pathname = usePathname();
  const {
    messages,
    allMessageCount,
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
  } = useChatPanel();

  if (HIDDEN_ON_PREFIXES.some(prefix => pathname?.startsWith(prefix))) {
    return null;
  }

  return (
    <>
      {isExpanded && (
        <ChatPanel
          messages={messages}
          allMessageCount={allMessageCount}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          selectedCharacter={selectedCharacter}
          onCharacterChange={setSelectedCharacter}
          selectedChannel={selectedChannel}
          onChannelChange={setSelectedChannel}
          channels={channels}
          characters={characters}
          sending={sending}
          onSendMessage={sendMessage}
          onClear={clearMessages}
        />
      )}
      <ChatBubble
        isExpanded={isExpanded}
        unreadCount={unreadCount}
        onToggle={toggleExpanded}
      />
    </>
  );
}
