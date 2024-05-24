'use client'

import { query_history } from '@prisma/client';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import GptResponseDisplay from './markdownTextDisplay';

interface QueryHistoryProps {
    history: query_history[];
}

const QueryHistory = ( {history}: QueryHistoryProps) => {

  return (
    <div className="text-left markdown-content px-60" style={{ whiteSpace: "pre-line" }}>
        {history.map((entry) => (
            <div key={entry.history_id} className="relative p-2">
                <div className="collapse bg-base-200">
                <input type="checkbox" /> 
                <div className="collapse-title text-xl">
                    <p>{entry.question}</p>
                </div>
                <div className="collapse-content"> 
                    <GptResponseDisplay searchResponse={entry.answer}/>
                </div>
                </div>
            </div>
        ))
        }
    </div>
  );
};

export default QueryHistory;
