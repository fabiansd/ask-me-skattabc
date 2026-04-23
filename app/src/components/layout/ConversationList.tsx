'use client';
import { useSession } from 'next-auth/react';

import { useConversation } from '../../contexts/ConversationContext';
import { ConversationsList } from '../../interface/history';
import { getUserId } from '../../service/users/getUserId';
import DeleteButton from '../buttons/DeleteButton';

interface ConversationListProps {
  conversations: ConversationsList[];
  isLoading: boolean;
  currentConversationId: number | null;
  onSelectConversation: (conversationId: number) => void;
}

export default function ConversationList({
  conversations,
  isLoading,
  currentConversationId,
  onSelectConversation,
}: ConversationListProps) {
  const { data: session } = useSession();
  const {
    refreshConversations,
    startNewConversation,
    currentConversationId: contextCurrentId,
  } = useConversation();

  const handleDelete = async (conversationId: number) => {
    if (!session) return;
    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/messages?auth_id=${getUserId(session)}`,
        { method: 'DELETE' }
      );
      if (response.ok) {
        if (conversationId === contextCurrentId) {
          startNewConversation();
        }
        refreshConversations();
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto px-3 py-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="mb-2 h-14 rounded-btn bg-base-300/40 animate-pulse" aria-hidden />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-6 py-10 text-center">
        <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-base-200 grid place-items-center text-base-content/50">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 8h9M7.5 12h6m-9.5 8.5L6 17.5h12A2.5 2.5 0 0020.5 15V6A2.5 2.5 0 0018 3.5H6A2.5 2.5 0 003.5 6v11a2 2 0 002 2h.5z"
            />
          </svg>
        </div>
        <p className="text-sm text-base-content/60">
          {session ? 'Ingen samtaler ennå' : 'Logg inn for å se samtalehistorikk'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto thin-scrollbar px-2 py-2">
      {conversations.map(conversation => {
        const isActive = currentConversationId === conversation.id;
        return (
          <button
            key={conversation.id}
            type="button"
            data-testid="conversation-item"
            aria-current={isActive ? 'true' : undefined}
            onClick={() => onSelectConversation(conversation.id)}
            className={`
              group relative w-full text-left
              px-3 py-2.5 mb-1 rounded-btn
              transition-colors duration-150
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-secondary
              ${isActive ? 'bg-base-300/80' : 'hover:bg-base-300/50'}
            `}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0 pr-6">
                <h4
                  className={`
                    font-serif text-sm font-medium truncate
                    ${isActive ? 'text-base-content' : 'text-base-content/90'}
                  `}
                >
                  {conversation.title}
                </h4>
                <p className="text-xs text-base-content/55 truncate mt-0.5">
                  {conversation.lastMessage}
                </p>
              </div>
              <span className="text-[10px] uppercase tracking-wide text-base-content/40 mt-0.5 shrink-0">
                {conversation.timestamp}
              </span>
            </div>
            <DeleteButton onDelete={() => handleDelete(conversation.id)} />
          </button>
        );
      })}
    </div>
  );
}
