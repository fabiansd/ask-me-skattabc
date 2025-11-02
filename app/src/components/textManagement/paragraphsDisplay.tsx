'use client';
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface ParagraphsDisplayProps {
  paragraphs: string[];
}

const ParagraphsDisplay = ({ paragraphs }: ParagraphsDisplayProps) => {
  return (
    <div className="flex flex-col items-center space-y-6">
      {!!paragraphs &&
        paragraphs.map((paragraph, index) => (
          <div
            key={index}
            className="inline-block p-4 text-left bg-base-300 rounded-box shadow max-w-max"
          >
            <ReactMarkdown>{paragraph}</ReactMarkdown>
          </div>
        ))}
    </div>
  );
};

export default ParagraphsDisplay;
