'use client';
import { useState } from 'react';

import { useConversation } from '../../contexts/ConversationContext';
import ConversationSidebar from '../navigation/ConversationSidebar';

interface ChatLayoutProps {
  children: React.ReactNode;
  isInputCollapsed?: boolean;
}

export default function ChatLayout({ children, isInputCollapsed = false }: ChatLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start closed by default
  const { currentConversationId, selectConversation, startNewConversation } = useConversation();
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleSelectConversation = (conversationId: number) => {
    selectConversation(conversationId);
  };

  const handleNewConversation = () => {
    startNewConversation();
    setSidebarOpen(false);
  };

  return (
    <div
      className={`relative ${isInputCollapsed ? 'h-screen overflow-y-auto' : 'min-h-[calc(100vh-4rem)]'}`}
    >
      <button
        onClick={toggleSidebar}
        className={`group fixed left-0 z-60 bg-base-200 border border-base-300 flex items-center justify-center min-h-[2rem] hover:bg-neutral hover:border-neutral-focus transition-colors ${
          sidebarOpen ? 'p-2 rounded-md' : 'md:pl-3 md:pr-2 py-2 rounded-r-md w-8 md:w-auto'
        } top-[10.35rem] md:top-[6.55rem]`}
      >
        {!sidebarOpen && (
          <span className="text-sm font-medium mr-2 hidden md:flex items-center">Samtaler</span>
        )}
        <svg
          className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={sidebarOpen ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}
          />
        </svg>
      </button>

      <div
        className={`
        fixed left-0 top-16 h-[calc(100vh-4rem)] z-50 bg-base-100 shadow-lg
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        w-80
      `}
      >
        <ConversationSidebar
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          currentConversationId={currentConversationId}
        />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-transparent z-40" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="h-full w-full">{children}</div>
    </div>
  );
}
