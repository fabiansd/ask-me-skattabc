'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { ConversationsList } from '../../interface/history';
import { getUserId } from '../../service/users/getUserId';
import CollapseButton from '../buttons/collapseButton';
import NewConversationButton from '../buttons/newConversationButton';
import ConversationList from '../layout/ConversationList';

interface ConversationSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onSelectConversation: (conversationId: number) => void;
  onNewConversation: () => void;
  currentConversationId: number | null;
}

export default function ConversationSidebar({
  isOpen,
  onToggle,
  onSelectConversation,
  onNewConversation,
  currentConversationId,
}: ConversationSidebarProps) {
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [conversations, setConversations] = useState<ConversationsList[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (!isOpen) {
      // Wait for sidebar animation to complete before showing floating button
      const timer = setTimeout(() => {
        setShowFloatingButton(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShowFloatingButton(false);
    }
  }, [isOpen]);

  // Fetch conversations when component mounts or session changes
  useEffect(() => {
    const fetchConversations = async () => {
      if (!session) return;
      setIsLoading(true);
      try {
        const response = await fetch(`/api/conversations?auth_id=${getUserId(session)}`);
        if (response.ok) {
          const data = await response.json();
          setConversations(data);
        } else {
          console.error('Failed to fetch conversations');
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [session]);

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onToggle} />
      )}

      {/* Collapse button when sidebar is hidden */}
      {showFloatingButton && (
        <CollapseButton onClick={onToggle} title="Vis sidebar" isFloating={true} />
      )}

      {/* Sidebar */}
      <div className="h-full bg-base-200 border-r border-base-300 w-80 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-base-300 flex justify-between items-center">
          <NewConversationButton onClick={onNewConversation} />
          <CollapseButton onClick={onToggle} title="Skjul sidebar" />
        </div>

        {/* Conversations list */}
        <ConversationList
          conversations={conversations}
          isLoading={isLoading}
          currentConversationId={currentConversationId}
          onSelectConversation={onSelectConversation}
        />

        {/* Footer */}
        <div className="p-4 border-t border-base-300">
          <div className="text-xs text-base-content/50 text-center">
            {conversations.length} samtaler
          </div>
        </div>
      </div>
    </>
  );
}
