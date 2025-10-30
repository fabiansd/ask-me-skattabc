'use client';
import React, { createContext, useContext, useState } from 'react';

interface ConversationContextType {
  currentConversationId: number | null;
  setCurrentConversationId: (id: number | null) => void;
  selectConversation: (id: number) => void;
  startNewConversation: () => void;
  refreshConversations: () => void;
  refreshTrigger: number;
  clearSearchState?: () => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export function ConversationProvider({ children }: { children: React.ReactNode }) {
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const selectConversation = (id: number) => {
    setCurrentConversationId(id);
    // TODO: Clear current search results when switching conversations
  };

  const startNewConversation = () => {
    setCurrentConversationId(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const refreshConversations = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <ConversationContext.Provider
      value={{
        currentConversationId,
        setCurrentConversationId,
        selectConversation,
        startNewConversation,
        refreshConversations,
        refreshTrigger,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversation() {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
}
