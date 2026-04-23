'use client';
import { useEffect, useState } from 'react';

import { useConversation } from '../../contexts/ConversationContext';
import ConversationSidebar from '../navigation/ConversationSidebar';

interface ChatLayoutProps {
  children: React.ReactNode;
  // Kept for API compatibility with callers; drawer behavior does not depend on it.
  isInputCollapsed?: boolean;
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentConversationId, selectConversation, startNewConversation } = useConversation();

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  const handleSelectConversation = (conversationId: number) => {
    selectConversation(conversationId);
    if (window.matchMedia('(max-width: 768px)').matches) {
      setSidebarOpen(false);
    }
  };

  const handleNewConversation = () => {
    startNewConversation();
    setSidebarOpen(false);
  };

  // Lock body scroll while the drawer is open on mobile
  useEffect(() => {
    if (!sidebarOpen) return;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (!isMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  // Close on Escape
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [sidebarOpen]);

  return (
    <div className="relative flex-1 flex flex-col min-h-0">
      <button
        type="button"
        data-testid="sidebar-toggle"
        onClick={toggleSidebar}
        aria-expanded={sidebarOpen}
        aria-controls="conversation-drawer"
        className={`
          group fixed left-0 z-30
          inline-flex items-center gap-2
          px-2 py-1.5
          bg-base-100 border border-l-0 border-base-300
          rounded-r-btn shadow-card
          text-xs font-medium text-base-content/70
          hover:text-base-content hover:border-secondary/50 hover:bg-base-200
          transition-all duration-150
          top-[calc(3.5rem+0.75rem)] sm:top-[calc(4rem+1rem)]
          ${sidebarOpen ? 'opacity-0 pointer-events-none -translate-x-2' : 'opacity-100'}
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary
        `}
      >
        <svg
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="hidden sm:inline pr-1">Samtaler</span>
      </button>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral/30 backdrop-blur-sm animate-fade-in"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <div
        id="conversation-drawer"
        className={`
          fixed left-0 top-14 sm:top-16 z-50
          h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-4rem)]
          w-full sm:w-80
          shadow-elevated
          transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
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

      <div className="flex-1 flex flex-col min-h-0">{children}</div>
    </div>
  );
}
