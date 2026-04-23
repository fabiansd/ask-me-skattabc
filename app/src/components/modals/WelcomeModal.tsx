'use client';
import { useEffect, useRef } from 'react';

import Button from '../common/Button';

interface WelcomeModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function WelcomeModal({ isVisible, onClose }: WelcomeModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVisible) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    dialogRef.current?.focus();
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        tabIndex={-1}
        data-testid="welcome-modal"
        onClick={e => e.stopPropagation()}
        className="
          w-full max-w-md
          bg-base-100 rounded-box border border-base-300 shadow-elevated
          p-7 sm:p-8
          text-center
          animate-scale-in
          focus:outline-none
        "
      >
        <div className="mx-auto mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-secondary/15 text-secondary">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            className="h-5 w-5"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 2.5l2.8 5.8 6.4.9-4.6 4.5 1.1 6.3L12 17l-5.7 3 1.1-6.3L2.8 9.2l6.4-.9L12 2.5z"
            />
          </svg>
        </div>

        <h2
          id="welcome-title"
          className="font-serif text-2xl font-medium text-base-content mb-2 tracking-tight"
        >
          Velkommen til Optimalskatt
        </h2>

        <p className="text-sm text-base-content/70 leading-relaxed mb-1.5">
          Profesjonell AI-assistanse innen norsk skatterett. Få presise, kildebelagte svar på
          komplekse skattespørsmål.
        </p>
        <p className="text-sm text-base-content/70 leading-relaxed mb-6">
          Logg inn med Google for å låse opp{' '}
          <strong className="text-base-content">samtalehistorikk</strong> og en{' '}
          <strong className="text-base-content">kraftigere språkmodell</strong>.
        </p>

        <div className="space-y-2.5">
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={() => (window.location.href = '/account')}
          >
            Logg inn med Google
          </Button>
          <Button
            data-testid="welcome-dismiss"
            variant="ghost"
            size="md"
            fullWidth
            onClick={onClose}
          >
            Fortsett uten innlogging
          </Button>
        </div>
      </div>
    </div>
  );
}
