'use client';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';

import SearchButton from './src/components/buttons/SearchButton';
import ToggleSwitch from './src/components/buttons/ToggleModelDepth';
import KeywordInput from './src/components/chat/KeywordInput';
import KeywordTags from './src/components/chat/KeywordTags';
import SearchInput from './src/components/chat/SearchInput';
import ChatLayout from './src/components/layout/ChatLayout';
import WelcomeModal from './src/components/modals/WelcomeModal';
import ChatDisplay from './src/components/textManagement/markdownTextDisplay';
import { ConversationProvider, useConversation } from './src/contexts/ConversationContext';
import { ConversationMessage } from './src/interface/history';
import { QueryChatRequest } from './src/interface/skattSokInterface';
import { getUserId } from './src/service/users/getUserId';

function SearchContent() {
  const [isDetailed, setIsDetailed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([]);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const { data: session } = useSession();
  const { currentConversationId, setCurrentConversationId, refreshConversations } =
    useConversation();

  // Show welcome modal for non-authenticated users after 2 seconds
  useEffect(() => {
    if (!session && !sessionStorage.getItem('welcomeModalDismissed')) {
      const timer = setTimeout(() => setShowWelcomeModal(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [session]);

  const handleCloseModal = () => {
    setShowWelcomeModal(false);
    sessionStorage.setItem('welcomeModalDismissed', 'true');
  };

  const fetchConversationMessages = useCallback(async () => {
    if (currentConversationId) {
      try {
        const response = await fetch(
          `/api/conversations/${currentConversationId}/messages?auth_id=${getUserId(session)}`
        );
        if (response.ok) {
          const data: ConversationMessage[] = await response.json();
          setConversationMessages(data);
          console.log('🟡 [HISTORY] Loaded conversation messages:', data.length);
        }
      } catch (error) {
        console.error('Error fetching conversation messages:', error);
      }
    } else {
      // Clear messages when no conversation selected
      setConversationMessages([]);
    }
  }, [currentConversationId, session]);

  useEffect(() => {
    fetchConversationMessages();
  }, [fetchConversationMessages]);

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSearchInput(event.target.value);
  };

  const handleToggle = (state: boolean) => {
    console.log('page', isDetailed);
    setIsDetailed(state);
  };

  const handleButtonClick = async () => {
    setIsLoading(true);
    try {
      console.log('📤', isDetailed ? 'DETALJERT' : 'KONKRET', 'mode');
      const queryChatRequest: QueryChatRequest = {
        searchText: searchInput,
        tags: keywords.length > 0 ? keywords : undefined,
        isDetailed: isDetailed,
        conversation_id: currentConversationId || undefined,
      };

      const response = await fetch(`/api/query?auth_id=${getUserId(session)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(queryChatRequest),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('🟢 [API] Query response received:', data);

      // If this was a new conversation, save the returned conversation_id and refresh list
      if (!currentConversationId && data.conversation_id) {
        setCurrentConversationId(data.conversation_id);
        refreshConversations();
      }

      fetchConversationMessages();
    } catch (error) {
      console.error('🔴 [ERROR] Query failed:', error);
    }
    setIsLoading(false);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleButtonClick();
    }
  };

  return (
    <>
      <WelcomeModal isVisible={showWelcomeModal} onClose={handleCloseModal} />
      <div className="pt-10 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="flex justify-center">
            <SearchInput
              value={searchInput}
              onChange={handleSearchInputChange}
              onKeyDown={handleKeyPress}
            />
          </div>
          <div className="flex flex-col items-center pt-5">
            <div className="flex items-center gap-4">
              <KeywordInput keywords={keywords} onKeywordsChange={setKeywords} />
              <ToggleSwitch onToggle={handleToggle} isDetailed={isDetailed} />
              <SearchButton
                isLoading={isLoading}
                disabled={isLoading || searchInput === ''}
                onClick={handleButtonClick}
                currentConversationId={currentConversationId}
              />
            </div>
            <div className="w-full max-w-2xl">
              <KeywordTags
                keywords={keywords}
                onRemoveKeyword={index => {
                  setKeywords(keywords.filter((_, i) => i !== index));
                }}
              />
            </div>
          </div>
        </div>
        <div className="divider w-full"></div>
        <div className="px-4">
          <div className="mx-auto max-w-5xl">
            <div className="flex justify-center">
              <div className="w-full max-w-3xl">
                <ChatDisplay conversationMessages={conversationMessages} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Search() {
  return (
    <ConversationProvider>
      <ChatLayout>
        <SearchContent />
      </ChatLayout>
    </ConversationProvider>
  );
}
