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
        {
          method: 'DELETE',
        }
      );
      if (response.ok) {
        // If we deleted the current conversation, start a new one
        if (conversationId === contextCurrentId) {
          startNewConversation();
        }
        refreshConversations();
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-2">
        {isLoading ? (
          <div className="text-center py-4 text-base-content/60">Laster samtaler...</div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-4 text-base-content/60">Ingen samtaler ennå</div>
        ) : (
          conversations.map(conversation => (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={`
                relative w-full text-left p-3 rounded-lg mb-1 transition-colors
                hover:bg-base-300 group
                ${currentConversationId === conversation.id ? 'bg-base-300' : 'hover:bg-base-300'}
              `}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium truncate text-base-content">
                    {conversation.title}
                  </h4>
                  <p className="text-xs text-base-content/60 truncate mt-1">
                    {conversation.lastMessage}
                  </p>
                </div>
                <span className="text-xs text-base-content/50 ml-2 flex-shrink-0">
                  {conversation.timestamp}
                </span>
              </div>
              <DeleteButton onDelete={() => handleDelete(conversation.id)} />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
