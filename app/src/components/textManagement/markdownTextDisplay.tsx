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
  isStreaming?: boolean;
}

export interface ChatDisplayRef {
  scrollToLastUserMessage: () => void;
}

const ChatDisplay = forwardRef<ChatDisplayRef, ChatDisplayProps>(
  ({ conversationMessages, isCollapsed = false, onViewSources, isStreaming = false }, ref) => {
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);

    useImperativeHandle(ref, () => ({
      scrollToLastUserMessage: () => {
        if (!chatContainerRef.current) return;
        const userMessages = chatContainerRef.current.querySelectorAll('[data-role="user"]');
        const lastUserMessage = userMessages[userMessages.length - 1];
        if (lastUserMessage) {
          lastUserMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      },
    }));

    useEffect(() => {
      const container = chatContainerRef.current;
      if (!container) return;

      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        const isScrollable = scrollHeight > clientHeight + 40;
        setShowScrollButton(isScrollable && !isNearBottom);
      };

      container.addEventListener('scroll', handleScroll);
      handleScroll();

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
      return null;
    }

    return (
      <div className="relative flex-1 flex flex-col min-h-0">
        <div
          ref={chatContainerRef}
          className={`
            flex-1 min-h-0
            overflow-y-auto scroll-smooth thin-scrollbar
            ${isCollapsed ? 'pt-6' : 'pt-2'}
            pb-8
          `}
        >
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            {conversationMessages.map((message, idx) => {
              const isUser = message.role === 'user';
              const isLast = idx === conversationMessages.length - 1;
              const isStreamingThis = isStreaming && isLast && !isUser;

              return (
                <article
                  key={message.message_id}
                  data-testid="chat-message"
                  data-role={message.role}
                  className={`group relative py-5 ${idx !== 0 ? 'border-t border-base-300/60' : ''}`}
                >
                  <header className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`
                          inline-flex items-center justify-center
                          h-6 w-6 rounded-full text-[11px] font-medium
                          ${
                            isUser
                              ? 'bg-base-300 text-base-content/80'
                              : 'bg-primary text-primary-content'
                          }
                        `}
                        aria-hidden
                      >
                        {isUser ? 'Du' : 'O'}
                      </span>
                      <span className="text-xs font-medium text-base-content/60 tracking-wide uppercase">
                        {isUser ? 'Du' : 'Optimalskatt'}
                      </span>
                    </div>
                    {!isUser &&
                      message.source_document_ids &&
                      message.source_document_ids.length > 0 &&
                      onViewSources && (
                        <ViewSourcesButton onClick={() => onViewSources(message.message_id)} />
                      )}
                  </header>

                  <div
                    className={`
                      markdown-content text-base-content leading-relaxed
                      ${isUser ? 'font-sans text-[15px]' : 'font-sans text-[15px]'}
                      ${isStreamingThis && !message.content ? 'streaming-caret' : ''}
                      ${isStreamingThis && message.content ? 'streaming-caret' : ''}
                    `}
                  >
                    <ReactMarkdown
                      components={{
                        a: ({ href, children }) => (
                          <a href={href} target="_blank" rel="noopener noreferrer">
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {message.content || (isStreamingThis ? '' : '')}
                    </ReactMarkdown>
                  </div>

                  {isUser && message.tags && message.tags.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {message.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center h-5 px-2 rounded-full bg-base-200 text-[11px] text-base-content/70 border border-base-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>

        {showScrollButton && <ScrollToBottomButton onClick={scrollToBottom} />}
      </div>
    );
  }
);

ChatDisplay.displayName = 'ChatDisplay';

export default ChatDisplay;
