'use client';
import { signIn } from 'next-auth/react';
import { useEffect } from 'react';

interface WelcomeModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function WelcomeModal({ isVisible, onClose }: WelcomeModalProps) {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-base-100 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-base-content mb-3">Velkommen til Skatt AI!</h2>
          <p className="text-base-content/70 leading-relaxed mb-4">
            Denne skatteassistenten bruker norske skattelover til å svare på komplekse
            skattespørsmål.
          </p>
          <p className="text-base-content/70 leading-relaxed">
            Logg inn med din Google-konto å få tilgang til <strong>samtalehistorikk</strong> og{' '}
            <strong>sterkere AI-modell </strong>.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => signIn('google')}
            className="w-full btn bg-sky-700 hover:bg-sky-800 text-white font-bold py-3 rounded-lg"
          >
            Logg inn med Google
          </button>
          <button
            onClick={onClose}
            className="w-full btn btn-ghost text-base-content/60 font-bold py-3 rounded-lg"
          >
            Fortsett uten innlogging
          </button>
        </div>
      </div>
    </div>
  );
}
