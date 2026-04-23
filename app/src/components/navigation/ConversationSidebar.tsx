'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { useConversation } from '../../contexts/ConversationContext';
import { ConversationsList } from '../../interface/history';
import { getUserId } from '../../service/users/getUserId';
import NewConversationButton from '../buttons/NewConversationButton';
import IconButton from '../common/IconButton';
import ConversationList from '../layout/ConversationList';

interface ConversationSidebarProps {
  // Kept for API compatibility; rendering is owned by the parent drawer.
  isOpen: boolean;
  onToggle: () => void;
  onSelectConversation: (conversationId: number) => void;
  onNewConversation: () => void;
  currentConversationId: number | null;
}

export default function ConversationSidebar({
  onToggle,
  onSelectConversation,
  onNewConversation,
  currentConversationId,
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<ConversationsList[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const { refreshTrigger } = useConversation();

  useEffect(() => {
    const fetchConversations = async () => {
      if (!session) return;
      setIsLoading(true);
      try {
        const response = await fetch(`/api/conversations?auth_id=${getUserId(session)}`);
        if (response.ok) {
          const data = await response.json();
          setConversations(data);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [session, refreshTrigger]);

  return (
    <aside
      data-testid="conversation-sidebar"
      className="h-full w-full bg-base-100 border-r border-base-300 flex flex-col"
    >
      <div className="px-4 py-3 border-b border-base-300 flex items-center gap-2">
        <div className="flex-1">
          <NewConversationButton onClick={onNewConversation} />
        </div>
        <IconButton
          label="Skjul sidestolpe"
          onClick={onToggle}
          variant="ghost"
          size="sm"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </IconButton>
      </div>

      <div className="px-4 py-2 border-b border-base-300/70">
        <h3 className="font-serif text-sm font-medium text-base-content/80">Samtaler</h3>
      </div>

      <ConversationList
        conversations={conversations}
        isLoading={isLoading}
        currentConversationId={currentConversationId}
        onSelectConversation={onSelectConversation}
      />

      <div className="px-4 py-3 border-t border-base-300">
        <div className="text-[11px] text-base-content/50 text-center">
          {!session
            ? 'Logg inn for historikk'
            : conversations.length === 0
              ? 'Ingen samtaler'
              : `${conversations.length} ${conversations.length === 1 ? 'samtale' : 'samtaler'}`}
        </div>
      </div>
    </aside>
  );
}
