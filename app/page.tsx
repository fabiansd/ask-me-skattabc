'use client';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import CollapseToggle from './src/components/buttons/CollapseToggle';
import SearchButton from './src/components/buttons/SearchButton';
import ToggleSwitch from './src/components/buttons/ToggleModelDepth';
import KeywordInput from './src/components/chat/KeywordInput';
import KeywordTags from './src/components/chat/KeywordTags';
import SearchInput from './src/components/chat/SearchInput';
import ChatLayout from './src/components/layout/ChatLayout';
import WelcomeModal from './src/components/modals/WelcomeModal';
import SourcesSidebar from './src/components/navigation/SourcesSidebar';
import ChatDisplay, { ChatDisplayRef } from './src/components/textManagement/markdownTextDisplay';
import { ConversationProvider, useConversation } from './src/contexts/ConversationContext';
import { ConversationMessage } from './src/interface/history';
import { QueryChatRequest } from './src/interface/skattSokInterface';
import { createAssistantPlaceholder, createUserMessage } from './src/lib/messageHelpers';
import { getUserId } from './src/service/users/getUserId';

function SearchContent({
  isInputAreaCollapsed,
  setIsInputAreaCollapsed,
}: {
  isInputAreaCollapsed: boolean;
  setIsInputAreaCollapsed: (value: boolean) => void;
}) {
  const [isDetailed, setIsDetailed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Henter lover');
  const [searchInput, setSearchInput] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([]);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isSourcesSidebarOpen, setIsSourcesSidebarOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const chatDisplayRef = useRef<ChatDisplayRef>(null);

  const { data: session } = useSession();
  const { currentConversationId, setCurrentConversationId, refreshConversations } =
    useConversation();

  useEffect(() => {
    // Persist search state info for smoother UX
    const savedInput = sessionStorage.getItem('searchInput');
    const savedKeywords = sessionStorage.getItem('keywords');
    const savedConversationId = sessionStorage.getItem('currentConversationId');

    if (savedInput) setSearchInput(savedInput);
    if (savedKeywords) {
      try {
        setKeywords(JSON.parse(savedKeywords));
      } catch (error) {
        console.error('Error parsing saved keywords:', error);
      }
    }
    if (savedConversationId) {
      const conversationId = parseInt(savedConversationId, 10);
      if (!isNaN(conversationId)) {
        setCurrentConversationId(conversationId);
      }
    }
  }, [setCurrentConversationId]);

  useEffect(() => {
    searchInput
      ? sessionStorage.setItem('searchInput', searchInput)
      : sessionStorage.removeItem('searchInput');
  }, [searchInput]);

  useEffect(() => {
    keywords.length > 0
      ? sessionStorage.setItem('keywords', JSON.stringify(keywords))
      : sessionStorage.removeItem('keywords');
  }, [keywords]);

  useEffect(() => {
    currentConversationId
      ? sessionStorage.setItem('currentConversationId', currentConversationId.toString())
      : sessionStorage.removeItem('currentConversationId');
  }, [currentConversationId]);

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
    setLoadingText('Henter lover');

    setTimeout(() => {
      setLoadingText('Formulerer svar');
    }, 3500);

    try {
      console.log('📤', isDetailed ? 'DETALJERT' : 'KONKRET', 'mode');
      const queryChatRequest: QueryChatRequest = {
        searchText: searchInput,
        tags: keywords.length > 0 ? keywords : undefined,
        isDetailed: isDetailed,
        conversation_id: currentConversationId || undefined,
      };

      // Add user message to display immediately
      const userMessage = createUserMessage(searchInput, currentConversationId || undefined);

      setConversationMessages(prev => [...prev, userMessage]);

      // Scroll to the user's question after it's added
      setTimeout(() => {
        chatDisplayRef.current?.scrollToLastUserMessage();
      }, 100);

      const response = await fetch(`/api/query?auth_id=${getUserId(session)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(queryChatRequest),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Create placeholder assistant message for streaming
      const assistantMessage = createAssistantPlaceholder(currentConversationId || undefined);

      setConversationMessages(prev => [...prev, assistantMessage]);

      // Read stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let streamedContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          // Check if this is the final JSON message with conversation_id
          try {
            const parsed = JSON.parse(chunk);
            if (parsed.conversation_id) {
              if (!currentConversationId) {
                setCurrentConversationId(parsed.conversation_id);
              }
              continue;
            }
          } catch {
            // Not JSON, it's a text chunk
            streamedContent += chunk;

            // Update the assistant message with streamed content
            setConversationMessages(prev => {
              const updated = [...prev];
              const lastIndex = updated.length - 1;
              if (updated[lastIndex]?.role === 'assistant') {
                updated[lastIndex] = {
                  ...updated[lastIndex],
                  content: streamedContent,
                };
              }
              return updated;
            });
          }
        }
      }

      setSearchInput('');
      sessionStorage.removeItem('searchInput');

      // Refresh from database to get final state (only for authenticated users)
      if (session) {
        refreshConversations();
        fetchConversationMessages();
      }
    } catch (error) {
      console.error('🔴 [ERROR] Query failed:', error);
    }
    setIsLoading(false);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleButtonClick();
    }
  };

  const handleViewSources = (messageId: number) => {
    setSelectedMessageId(messageId);
    setIsSourcesSidebarOpen(true);
  };

  const handleCloseSources = () => {
    setIsSourcesSidebarOpen(false);
    setSelectedMessageId(null);
  };

  return (
    <>
      <WelcomeModal isVisible={showWelcomeModal} onClose={handleCloseModal} />

      {/* Input area - collapsible */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${isInputAreaCollapsed ? 'max-h-0' : 'max-h-100'}`}
      >
        <div className="pt-8 px-4">
          <div className="mx-auto max-w-5xl">
            <div className="flex justify-center">
              <SearchInput
                value={searchInput}
                onChange={handleSearchInputChange}
                onKeyDown={handleKeyPress}
              />
            </div>
            <div className="flex flex-col items-center pt-2.5 md:pt-5">
              {/* Desktop layout: Original horizontal layout */}
              <div className="hidden md:flex items-center gap-4">
                <KeywordInput keywords={keywords} onKeywordsChange={setKeywords} />
                <ToggleSwitch onToggle={handleToggle} isDetailed={isDetailed} />
                <SearchButton
                  isLoading={isLoading}
                  disabled={isLoading || searchInput === ''}
                  onClick={handleButtonClick}
                  currentConversationId={currentConversationId}
                  loadingText={loadingText}
                />
              </div>

              {/* Mobile layout: Two lines */}
              <div className="flex flex-col items-center gap-2 w-full max-w-2xl md:hidden">
                <KeywordInput keywords={keywords} onKeywordsChange={setKeywords} />
                <div className="flex items-center gap-2">
                  <ToggleSwitch onToggle={handleToggle} isDetailed={isDetailed} />
                  <SearchButton
                    isLoading={isLoading}
                    disabled={isLoading || searchInput === ''}
                    onClick={handleButtonClick}
                    currentConversationId={currentConversationId}
                    loadingText={loadingText}
                  />
                </div>
              </div>

              {/* Tags container - shared for both layouts */}
              <div className="w-full max-w-2xl mt-2 md:mt-0">
                <KeywordTags
                  keywords={keywords}
                  onRemoveKeyword={index => {
                    setKeywords(keywords.filter((_, i) => i !== index));
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Divider with collapse toggle */}
      <CollapseToggle isCollapsed={isInputAreaCollapsed} onToggle={setIsInputAreaCollapsed} />
      {/* Chat display area */}
      <div className="mx-auto max-w-5xl">
        <div className="flex justify-center">
          <div className="w-full max-w-3xl">
            <ChatDisplay
              ref={chatDisplayRef}
              conversationMessages={conversationMessages}
              isCollapsed={isInputAreaCollapsed}
              onViewSources={handleViewSources}
            />
          </div>
        </div>
      </div>

      {/* Sources sidebar */}
      <SourcesSidebar
        isOpen={isSourcesSidebarOpen}
        onToggle={handleCloseSources}
        messageId={selectedMessageId}
      />
    </>
  );
}

function SearchWrapper() {
  const [isInputAreaCollapsed, setIsInputAreaCollapsed] = useState(false);

  return (
    <ConversationProvider>
      <ChatLayout isInputCollapsed={isInputAreaCollapsed}>
        <SearchContent
          isInputAreaCollapsed={isInputAreaCollapsed}
          setIsInputAreaCollapsed={setIsInputAreaCollapsed}
        />
      </ChatLayout>
    </ConversationProvider>
  );
}

export default SearchWrapper;
