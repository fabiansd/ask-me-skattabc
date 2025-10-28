'use client';
import React, { createContext, useContext, useState } from 'react';

interface ConversationContextType {
  currentConversationId: number | null;
  setCurrentConversationId: (id: number | null) => void;
  selectConversation: (id: number) => void;
  startNewConversation: () => void;
  clearSearchState?: () => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export function ConversationProvider({ children }: { children: React.ReactNode }) {
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);

  const selectConversation = (id: number) => {
    setCurrentConversationId(id);
    // TODO: Clear current search results when switching conversations
  };

  const startNewConversation = () => {
    setCurrentConversationId(null);
    // TODO: Clear current conversation state
  };

  return (
    <ConversationContext.Provider
      value={{
        currentConversationId,
        setCurrentConversationId,
        selectConversation,
        startNewConversation,
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
