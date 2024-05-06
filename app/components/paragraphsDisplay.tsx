'use client'
import React from 'react';
import GptResponseDisplay from './gptResponseDisplay';

interface ParagraphsDisplayProps {
  paragraphs: string[];
}

const ParagraphsDisplay = ({ paragraphs }: ParagraphsDisplayProps) => {
  return (
    <div className="p-4">
      {!!paragraphs && paragraphs.map((paragraph, index) => (
        <div key={index} className="p-4 mb-6 text-left bg-base-300 rounded-box shadow">
          <GptResponseDisplay searchResponse={paragraph}/>
        </div>
      ))}
    </div>
  );
};

export default ParagraphsDisplay;
