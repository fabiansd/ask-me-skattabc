'use client';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

const EXAMPLE_PROMPTS = [
  'Kan jeg trekke fra hjemmekontor som lønnsmottaker?',
  'Hvordan beskattes gevinst ved salg av aksjer?',
  'Hva er grensen for MVA-registrering?',
];

function EmptyState({
  onSelectPrompt,
  session,
}: {
  onSelectPrompt: (prompt: string) => void;
  session: ReturnType<typeof useSession>['data'];
}) {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-2xl text-center">
        <div className="inline-flex items-center gap-2 h-7 px-3 rounded-full bg-secondary/10 text-secondary text-[11px] font-medium tracking-wide uppercase mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-secondary" aria-hidden />
          AI-drevet skatteassistanse
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-base-content mb-4 leading-[1.1]">
          Still et spørsmål om{' '}
          <span className="text-primary">norsk skatterett</span>.
        </h1>
        <p className="text-base text-base-content/70 max-w-xl mx-auto leading-relaxed mb-8">
          Svarene er basert på norske skattelover, Skatteetatens veiledere og
          publiserte forskrifter. Hvert svar er lenket til sine kilder.
        </p>

        <div className="grid gap-2 sm:grid-cols-3 text-left">
          {EXAMPLE_PROMPTS.map(prompt => (
            <button
              key={prompt}
              type="button"
              onClick={() => onSelectPrompt(prompt)}
              className="
                group
                rounded-box border border-base-300 bg-base-100
                px-4 py-3
                text-sm text-base-content/80
                hover:border-secondary/50 hover:bg-base-200/50 hover:text-base-content
                transition-all duration-150
                shadow-card
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary
              "
            >
              <span className="block leading-snug">{prompt}</span>
              <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-base-content/50 group-hover:text-secondary transition-colors">
                Prøv dette
                <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          ))}
        </div>

        {!session && (
          <p className="mt-10 text-xs text-base-content/50">
            Tips: logg inn for å lagre samtalehistorikk og få tilgang til en kraftigere modell.
          </p>
        )}
      </div>
    </div>
  );
}

function SearchContent({
  isInputAreaCollapsed,
  setIsInputAreaCollapsed,
}: {
  isInputAreaCollapsed: boolean;
  setIsInputAreaCollapsed: (value: boolean) => void;
}) {
  const [isDetailed, setIsDetailed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Henter kilder…');
  const [searchInput, setSearchInput] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([]);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isSourcesSidebarOpen, setIsSourcesSidebarOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const chatDisplayRef = useRef<ChatDisplayRef>(null);

  const { data: session } = useSession();
  const {
    currentConversationId,
    setCurrentConversationId,
    refreshConversations,
    newConversationSignal,
  } = useConversation();

  const hasMessages = conversationMessages.length > 0;

  // Reset local draft state (keywords + pending search input) whenever the
  // user starts a new conversation via the "Ny samtale" button. We skip the
  // initial mount so we don't wipe restored sessionStorage state on load.
  const firstNewSignalRef = useRef(true);
  useEffect(() => {
    if (firstNewSignalRef.current) {
      firstNewSignalRef.current = false;
      return;
    }
    setKeywords([]);
    setSearchInput('');
    sessionStorage.removeItem('keywords');
    sessionStorage.removeItem('searchInput');
  }, [newConversationSignal]);

  useEffect(() => {
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
    setIsDetailed(state);
  };

  const handleButtonClick = async () => {
    if (!searchInput.trim() || isLoading) return;

    setIsLoading(true);
    setLoadingText('Henter kilder…');

    const phaseTimer = setTimeout(() => {
      setLoadingText('Formulerer svar…');
    }, 3500);

    try {
      const queryChatRequest: QueryChatRequest = {
        searchText: searchInput,
        tags: keywords.length > 0 ? keywords : undefined,
        isDetailed: isDetailed,
        conversation_id: currentConversationId || undefined,
      };

      const userMessage = createUserMessage(searchInput, currentConversationId || undefined);
      setConversationMessages(prev => [...prev, userMessage]);

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

      const assistantMessage = createAssistantPlaceholder(currentConversationId || undefined);
      setConversationMessages(prev => [...prev, assistantMessage]);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let streamedContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          try {
            const parsed = JSON.parse(chunk);
            if (parsed.conversation_id) {
              if (!currentConversationId) {
                setCurrentConversationId(parsed.conversation_id);
              }
              continue;
            }
          } catch {
            streamedContent += chunk;
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

      if (session) {
        refreshConversations();
        fetchConversationMessages();
      }
    } catch (error) {
      console.error('[ERROR] Query failed:', error);
    } finally {
      clearTimeout(phaseTimer);
      setIsLoading(false);
    }
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

  const selectExamplePrompt = (prompt: string) => {
    setSearchInput(prompt);
  };

  const canSubmit = useMemo(
    () => !isLoading && searchInput.trim().length > 0,
    [isLoading, searchInput]
  );

  return (
    <>
      <WelcomeModal isVisible={showWelcomeModal} onClose={handleCloseModal} />

      {/* Input area — collapsible */}
      <div
        className={`
          transition-[max-height,opacity,padding] duration-300 ease-out overflow-hidden
          ${
            isInputAreaCollapsed
              ? 'max-h-0 opacity-0 pointer-events-none'
              : 'max-h-[28rem] opacity-100'
          }
        `}
      >
        <div className="pt-6 sm:pt-8 px-4 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <div className="flex justify-center">
              <SearchInput
                value={searchInput}
                onChange={handleSearchInputChange}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
              />
            </div>

            <div className="mx-auto max-w-3xl mt-3 sm:mt-4">
              {/* Desktop: horizontal */}
              <div className="hidden md:flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <KeywordInput keywords={keywords} onKeywordsChange={setKeywords} />
                  <ToggleSwitch onToggle={handleToggle} isDetailed={isDetailed} />
                </div>
                <SearchButton
                  isLoading={isLoading}
                  disabled={!canSubmit}
                  onClick={handleButtonClick}
                  currentConversationId={currentConversationId}
                  loadingText={loadingText}
                />
              </div>

              {/* Mobile: stacked */}
              <div className="flex md:hidden flex-col gap-2.5">
                <KeywordInput keywords={keywords} onKeywordsChange={setKeywords} />
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <ToggleSwitch onToggle={handleToggle} isDetailed={isDetailed} />
                  </div>
                  <SearchButton
                    isLoading={isLoading}
                    disabled={!canSubmit}
                    onClick={handleButtonClick}
                    currentConversationId={currentConversationId}
                    loadingText={loadingText}
                  />
                </div>
              </div>

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

      <CollapseToggle isCollapsed={isInputAreaCollapsed} onToggle={setIsInputAreaCollapsed} />

      {/* Chat area */}
      {hasMessages ? (
        <ChatDisplay
          ref={chatDisplayRef}
          conversationMessages={conversationMessages}
          isCollapsed={isInputAreaCollapsed}
          onViewSources={handleViewSources}
          isStreaming={isLoading}
        />
      ) : (
        <EmptyState onSelectPrompt={selectExamplePrompt} session={session} />
      )}

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
