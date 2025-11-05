'use client';
import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

import { ConversationMessage } from '../../interface/history';
import { replaceParagraphsWithLinks } from '../../lib/skatteparagraferReferering';

interface ChatDisplayProps {
  conversationMessages: ConversationMessage[];
}

const ChatDisplay = ({ conversationMessages }: ChatDisplayProps) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current && conversationMessages.length > 0) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversationMessages]);

  if (conversationMessages.length === 0) {
    return <div className="text-center text-base-content/60 py-8">Spør meg om noe</div>;
  }

  return (
    <div
      ref={chatContainerRef}
      className="h-[calc(100vh-20rem)] overflow-y-auto scroll-smooth bg-base-100 rounded-lg p-4"
    >
      <div className="space-y-4 w-full">
        {conversationMessages.map(message => (
          <div key={message.message_id} className="w-full flex justify-center">
            <div
              className={`p-4 rounded-lg w-full ${
                message.role === 'user' ? 'bg-base-300' : 'bg-base-200'
              }`}
            >
              <div className="text-sm font-medium mb-2 text-base-content/80">
                {message.role === 'user' ? 'Du:' : 'Assistent:'}
              </div>
              <div
                className="text-left markdown-content text-base-content"
                style={{ whiteSpace: 'pre-line' }}
              >
                <ReactMarkdown>{replaceParagraphsWithLinks(message.content)}</ReactMarkdown>
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatDisplay;
