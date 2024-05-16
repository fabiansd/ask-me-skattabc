'use client'
import React from 'react';
import GptResponseDisplay from './markdownTextDisplay';

interface ParagraphsDisplayProps {
  paragraphs: string[];
}

const ParagraphsDisplay = ({ paragraphs }: ParagraphsDisplayProps) => {
  return (
    <div className="flex flex-col items-center space-y-6">
      {!!paragraphs && paragraphs.map((paragraph, index) => (
        <div key={index} className="inline-block p-4 text-left bg-base-300 rounded-box shadow max-w-max">
          <GptResponseDisplay searchResponse={paragraph}/>
        </div>
      ))}
    </div>
  );
};

export default ParagraphsDisplay;
