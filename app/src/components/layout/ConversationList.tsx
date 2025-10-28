'use client';
import { ConversationsList } from '../../interface/history';

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
                w-full text-left p-3 rounded-lg mb-1 transition-colors
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
            </button>
          ))
        )}
      </div>
    </div>
  );
}
