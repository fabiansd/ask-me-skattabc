'use client';
import { useState } from 'react';

import { useConversation } from '../../contexts/ConversationContext';
import ConversationSidebar from '../navigation/ConversationSidebar';

interface ChatLayoutProps {
  children: React.ReactNode;
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true); // Start open on desktop
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
    <div className="relative h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar toggle button - always visible */}
      <button
        onClick={toggleSidebar}
        className="fixed left-0 z-60 btn btn-ghost btn-sm p-2 bg-base-200 border border-base-300"
        style={{ top: 'calc(4rem + 1rem + 0.5rem)' }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={sidebarOpen ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}
          />
        </svg>
      </button>

      {/* Sidebar Container - overlay when open */}
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

      {/* Backdrop when sidebar is open */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-transparent z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content area - always full width */}
      <div className="h-full w-full">{children}</div>
    </div>
  );
}
