'use client'

import React from 'react';
import ReactMarkdown from 'react-markdown';

interface GptResponseDisplayProps {
  searchResponse: string;
}

function generateSkattelovLink(paragraf: string): string {
  const baseURL = "https://lovdata.no/lov/1999-03-26-14/§";
  return `${baseURL}${paragraf}`;
}

function replaceParagraphsWithLinks(text: string): string {

  if (!text || typeof text !== "string") {
    return '';
  }

  const paragrafRegex = /§\s*(\d+-\d+)/g;

  return text.replace(paragrafRegex, (match, paragraf) => {
    const link = generateSkattelovLink(paragraf);
    return `[${match}](${link})`;
  });
}



const GptResponseDisplay = ({ searchResponse }: GptResponseDisplayProps) => {
  const processedText = replaceParagraphsWithLinks(searchResponse);

  return (
    <div className="text-left markdown-content" style={{ whiteSpace: "pre-line" }}>
      <ReactMarkdown>{processedText}</ReactMarkdown>
    </div>
  );
};

export default GptResponseDisplay;
