'use client';
import { useEffect, useState } from 'react';

import { ESDocument } from '../../clients/esUtil';

interface SourcesSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  messageId: number | null;
}

export default function SourcesSidebar({ isOpen, onToggle, messageId }: SourcesSidebarProps) {
  const [sources, setSources] = useState<ESDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchSources = async () => {
      if (!messageId) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/messages/${messageId}/sources`);
        if (response.ok) {
          const data = await response.json();
          setSources(data.sources || []);
          setCurrentIndex(0);
        } else {
          console.error('Failed to fetch sources');
          setSources([]);
        }
      } catch (error) {
        console.error('Error fetching sources:', error);
        setSources([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && messageId) {
      fetchSources();
    }
  }, [isOpen, messageId]);

  // Close sidebar when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.querySelector('[data-sidebar="sources"]');
      if (sidebar && !sidebar.contains(event.target as Node)) {
        onToggle();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  const handlePrevious = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : sources.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev < sources.length - 1 ? prev + 1 : 0));
  };

  // Convert escaped \n to actual line breaks for proper rendering
  const formatContent = (content: string): string => {
    return content.replace(/\\n/g, '\n');
  };

  if (!isOpen) return null;

  return (
    <div
      data-sidebar="sources"
      className="fixed right-0 top-0 h-full bg-base-200 border-l border-base-300 w-[48rem] flex flex-col z-50 shadow-xl transition-transform duration-300 ease-in-out"
    >
      <div className="p-4 border-b border-base-300 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            className="btn btn-ghost btn-sm p-2"
            aria-label="Skjul kilder"
            title="Skjul kilder"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold">Kildedokumenter</h2>
        </div>
        {!isLoading && sources.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              className="btn btn-sm btn-ghost"
              onClick={handlePrevious}
              aria-label="Forrige kilde"
            >
              ← Forrige
            </button>
            <span className="text-sm text-base-content/70">
              {currentIndex + 1} / {sources.length}
            </span>
            <button className="btn btn-sm btn-ghost" onClick={handleNext} aria-label="Neste kilde">
              Neste →
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading && (
          <div className="flex justify-center items-center h-full">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        )}

        {!isLoading && sources.length === 0 && (
          <div className="text-center text-base-content/50 mt-8">Ingen kildedokumenter funnet</div>
        )}

        {!isLoading && sources.length > 0 && (
          <>
            <div className="bg-base-300 rounded-lg p-4">
              {sources[currentIndex].department && (
                <div className="text-xs text-base-content/60 mb-2">
                  {sources[currentIndex].department}
                </div>
              )}
              {sources[currentIndex].document_title && (
                <div className="text-sm font-semibold mb-2">
                  {sources[currentIndex].document_title}
                </div>
              )}
              {sources[currentIndex].article_number && (
                <div className="text-xs text-base-content/70 mb-1">
                  Artikkel {sources[currentIndex].article_number}
                </div>
              )}
              <div
                className="text-sm border-t border-base-content/10 pt-3"
                style={{ whiteSpace: 'pre-line' }}
              >
                {formatContent(sources[currentIndex].content)}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="p-4 border-t border-base-300">
        <div className="text-xs text-base-content/50 text-center">
          {sources.length} {sources.length === 1 ? 'kilde' : 'kilder'}
        </div>
      </div>
    </div>
  );
}
