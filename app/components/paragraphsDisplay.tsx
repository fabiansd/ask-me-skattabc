'use client'
import React from 'react';
import GptResponseDisplay from './markdownTextDisplay';

interface ParagraphsDisplayProps {
  paragraphs: string[];
}

const ParagraphsDisplay = ({ paragraphs }: ParagraphsDisplayProps) => {
  return (
    <div className="carousel carousel-center rounded-box">
      {!!paragraphs && paragraphs.map((paragraph, index) => (
        <div key={index} className="carousel-item p-4 m-6 text-left bg-base-300 rounded-box shadow inline-block">
          <GptResponseDisplay searchResponse={paragraph}/>
        </div>
      ))}
    </div>
  );
};


export default ParagraphsDisplay;
