'use client';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { ConversationMessage } from '../../interface/history';
import ScrollToBottomButton from '../buttons/ScrollToBottomButton';
import ViewSourcesButton from '../buttons/ViewSourcesButton';

interface ChatDisplayProps {
  conversationMessages: ConversationMessage[];
  isCollapsed?: boolean;
  onViewSources?: (messageId: number) => void;
}

export interface ChatDisplayRef {
  scrollToLastUserMessage: () => void;
}

const ChatDisplay = forwardRef<ChatDisplayRef, ChatDisplayProps>(
  ({ conversationMessages, isCollapsed = false, onViewSources }, ref) => {
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);

    // Expose scroll function to parent
    useImperativeHandle(ref, () => ({
      scrollToLastUserMessage: () => {
        if (!chatContainerRef.current) return;

        // Find last user message element
        const userMessages = chatContainerRef.current.querySelectorAll('[data-role="user"]');
        const lastUserMessage = userMessages[userMessages.length - 1];

        if (lastUserMessage) {
          lastUserMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      },
    }));

    // Check if user is near bottom
    useEffect(() => {
      const container = chatContainerRef.current;
      if (!container) return;

      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShowScrollButton(!isNearBottom);
      };

      container.addEventListener('scroll', handleScroll);
      handleScroll(); // Check initial state

      return () => container.removeEventListener('scroll', handleScroll);
    }, [conversationMessages]);

    const scrollToBottom = () => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    };

    if (conversationMessages.length === 0) {
      return <div className="text-center text-base-content/60 py-8">Spør meg om noe</div>;
    }

    return (
      <div className="relative">
        <div
          ref={chatContainerRef}
          className={`${isCollapsed ? 'h-[calc(100vh-6rem)]' : 'h-[calc(100vh-17rem)]'} overflow-y-auto scroll-smooth bg-base-100 rounded-lg`}
        >
          {conversationMessages.map(message => (
            <div
              key={message.message_id}
              className="w-full flex justify-center mb-6"
              data-role={message.role}
            >
              <div
                className={`p-4 rounded-lg w-full ${
                  message.role === 'user' ? 'bg-base-300' : 'bg-base-200'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-medium text-base-content/80">
                    {message.role === 'user' ? 'Du:' : 'Assistent:'}
                  </div>
                  {message.role === 'assistant' &&
                    message.source_document_ids &&
                    message.source_document_ids.length > 0 &&
                    onViewSources && (
                      <ViewSourcesButton onClick={() => onViewSources(message.message_id)} />
                    )}
                </div>
                <div
                  className="text-left markdown-content text-base-content"
                  style={{ whiteSpace: 'pre-line' }}
                >
                  <ReactMarkdown
                    components={{
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-600 hover:text-sky-800 underline"
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
                {message.role === 'user' && message.tags && message.tags.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs text-base-content/60">Tags: </span>
                    {message.tags.map((tag, index) => (
                      <span key={index} className="text-xs text-base-content/60">
                        {tag}
                        {index < message.tags!.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                )}
                {message.role === 'assistant' &&
                  message.source_document_ids &&
                  message.source_document_ids.length > 0 &&
                  onViewSources && (
                    <div className="mt-2 flex justify-end">
                      <ViewSourcesButton onClick={() => onViewSources(message.message_id)} />
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>
        {showScrollButton && <ScrollToBottomButton onClick={scrollToBottom} />}
      </div>
    );
  }
);

ChatDisplay.displayName = 'ChatDisplay';

export default ChatDisplay;
