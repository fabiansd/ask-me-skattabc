'use client'

import React from 'react';
import ReactMarkdown from 'react-markdown';

interface GptResponseDisplayProps {
    searchResponse: string;
}

const GptResponseDisplay = ({ searchResponse }: GptResponseDisplayProps) => {
  return (
    <div className="text-left" style={{ whiteSpace: "pre-line" }}>
      {!!searchResponse &&
        <ReactMarkdown>{searchResponse}</ReactMarkdown>
      }
    </div>
  );
};

export default GptResponseDisplay;
