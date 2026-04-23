'use client';
import { useEffect, useState } from 'react';

import { ESDocument } from '../../clients/esUtil';
import IconButton from '../common/IconButton';

interface SourcesSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  messageId: number | null;
  initialSources?: ESDocument[];
}

export default function SourcesSidebar({
  isOpen,
  onToggle,
  messageId,
  initialSources,
}: SourcesSidebarProps) {
  const [sources, setSources] = useState<ESDocument[]>(initialSources ?? []);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (initialSources) {
      setSources(initialSources);
      setCurrentIndex(0);
      return;
    }

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
  }, [isOpen, messageId, initialSources]);

  // Click outside closes
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.querySelector('[data-sidebar="sources"]');
      if (sidebar && !sidebar.contains(event.target as Node)) {
        onToggle();
      }
    };
    const t = setTimeout(() => document.addEventListener('mousedown', handleClickOutside), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);

  // Escape key closes; arrow keys navigate
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onToggle();
      if (sources.length > 1) {
        if (e.key === 'ArrowLeft')
          setCurrentIndex(prev => (prev > 0 ? prev - 1 : sources.length - 1));
        if (e.key === 'ArrowRight')
          setCurrentIndex(prev => (prev < sources.length - 1 ? prev + 1 : 0));
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, sources.length, onToggle]);

  const formatContent = (content: string): string => content.replace(/\\n/g, '\n');

  if (!isOpen) return null;

  const current = sources[currentIndex];

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-neutral/20 backdrop-blur-sm animate-fade-in"
        onClick={onToggle}
        aria-hidden
      />

      <aside
        data-sidebar="sources"
        role="dialog"
        aria-label="Kildedokumenter"
        className="
          fixed right-0 top-0 z-50
          h-[100dvh] w-full max-w-[min(640px,90vw)]
          bg-base-100 border-l border-base-300
          shadow-elevated
          flex flex-col
          animate-[slide-up_240ms_ease-out]
        "
      >
        <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-base-300">
          <div className="flex items-center gap-3 min-w-0">
            <IconButton label="Skjul kilder" onClick={onToggle} variant="ghost" size="sm">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </IconButton>
            <div className="min-w-0">
              <h2 className="font-serif text-lg font-medium text-base-content truncate">
                Kildedokumenter
              </h2>
              {sources.length > 0 && (
                <p className="text-xs text-base-content/55 mt-0.5">
                  {sources.length} {sources.length === 1 ? 'kilde' : 'kilder'}
                </p>
              )}
            </div>
          </div>

          {!isLoading && sources.length > 1 && (
            <div className="flex items-center gap-1">
              <IconButton
                label="Forrige kilde"
                data-testid="sources-prev"
                onClick={() => setCurrentIndex(prev => (prev > 0 ? prev - 1 : sources.length - 1))}
                variant="subtle"
                size="sm"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </IconButton>
              <span
                className="text-xs text-base-content/70 tabular-nums min-w-[3rem] text-center"
                aria-live="polite"
              >
                {currentIndex + 1} / {sources.length}
              </span>
              <IconButton
                label="Neste kilde"
                data-testid="sources-next"
                onClick={() => setCurrentIndex(prev => (prev < sources.length - 1 ? prev + 1 : 0))}
                variant="subtle"
                size="sm"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </IconButton>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto thin-scrollbar px-5 py-5">
          {isLoading && (
            <div className="flex justify-center items-center h-full">
              <div
                className="h-6 w-6 rounded-full border-2 border-base-content/30 border-r-transparent animate-spin"
                aria-label="Laster"
              />
            </div>
          )}

          {!isLoading && sources.length === 0 && (
            <div className="text-center text-base-content/50 mt-8">
              Ingen kildedokumenter funnet
            </div>
          )}

          {!isLoading && current && (
            <article className="rounded-box border border-base-300 bg-base-100 p-5 shadow-card">
              {current.department && (
                <div className="inline-flex items-center h-5 px-2 rounded-full bg-base-200 text-[11px] text-base-content/70 mb-3">
                  {current.department}
                </div>
              )}
              {current.document_title && (
                <h3 className="font-serif text-lg font-medium text-base-content mb-1.5 leading-snug">
                  {current.document_title}
                </h3>
              )}
              {current.article_number && (
                <div className="text-xs text-base-content/60 mb-3">
                  Artikkel <span className="font-medium">{current.article_number}</span>
                </div>
              )}
              <div
                className="text-sm text-base-content/85 leading-relaxed pt-3 border-t border-base-300"
                style={{ whiteSpace: 'pre-line' }}
              >
                {formatContent(current.content)}
              </div>
            </article>
          )}
        </div>
      </aside>
    </>
  );
}
