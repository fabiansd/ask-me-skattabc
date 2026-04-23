'use client';
import React, { createContext, useContext, useState } from 'react';

interface ConversationContextType {
  currentConversationId: number | null;
  setCurrentConversationId: (id: number | null) => void;
  selectConversation: (id: number) => void;
  startNewConversation: () => void;
  refreshConversations: () => void;
  refreshTrigger: number;
  /**
   * Increments every time `startNewConversation` is called. Consumers can
   * watch this value to reset local draft state (keywords, inputs, etc.).
   */
  newConversationSignal: number;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export function ConversationProvider({ children }: { children: React.ReactNode }) {
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [newConversationSignal, setNewConversationSignal] = useState(0);

  const selectConversation = (id: number) => {
    setCurrentConversationId(id);
  };

  const startNewConversation = () => {
    setCurrentConversationId(null);
    setRefreshTrigger(prev => prev + 1);
    setNewConversationSignal(prev => prev + 1);
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
        newConversationSignal,
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
