'use client';

import { useChatPanel } from '@/hooks/use-chat-panel';
import { ChatBubble } from './chat-bubble';
import { ChatPanel } from './chat-panel';

export function ChatContainer() {
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
