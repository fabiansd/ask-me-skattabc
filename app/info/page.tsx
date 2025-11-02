'use client';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

import { UserFeedbackInput } from '../src/interface/feedback';
import { getUserId } from '../src/service/users/getUserId';

const initialFeedback: UserFeedbackInput = {
  username: 'default',
  happiness_feedback: '',
  desired_features: '',
};

export default function Info() {
  const [feedback, setFeedback] = useState(initialFeedback);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  const handeButtonClick = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/postgres/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback: feedback,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to add feedback');
      }
      await response.json();
      setFeedback(initialFeedback);
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
    setIsLoading(false);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handeButtonClick();
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = event.target;
    setFeedback({
      ...feedback,
      [name]: value,
      username: getUserId(session),
    });
  };

  return (
    <div className="pt-10 flex justify-center">
      <div className="w-full max-w-2xl space-y-8">
        {/* About the AI Assistant */}
        <div>
          <p className="text-base-content/80 leading-relaxed mb-4">
            Denne AI-assistenten bruker norske skattelover og juridiske tekster til å gi presise
            svar på komplekse skattespørsmål. Systemet kombinerer semantisk søk i skattemateriale
            med avanserte språkmodeller for å levere praktiske råd innen:
          </p>
          <ul className="list-disc list-inside text-base-content/80 space-y-2 mb-4">
            <li>
              <strong>Personlig økonomi:</strong> Selvangivelse, fradrag og skatteoptimalisering
            </li>
            <li>
              <strong>Næringsdrift:</strong> MVA, avskrivninger og bedriftsskatt
            </li>
            <li>
              <strong>Investeringer:</strong> Aksjegevinst, utleie og kapitalinntekt
            </li>
            <li>
              <strong>Internasjonalt:</strong> Dobbeltbeskatningsavtaler og utenlandsk inntekt
            </li>
          </ul>
          <p className="text-base-content/60 text-sm">
            <em>
              Merk: Dette er en eksperimentell tjeneste som ikke erstatter profesjonell rådgivning.
            </em>
          </p>
        </div>

        {/* Contact Info */}
        <div>
          <h2 className="text-xl font-bold text-base-content mb-4">Kontaktinfo</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-base-content/60">📧</span>
              <a
                href="mailto:fabian.s.dietrichson@gmail.com"
                className="text-sky-600 hover:text-sky-800"
              >
                fabian.s.dietrichson@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base-content/60">📱</span>
              <span className="text-base-content/80">+47 41230038</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base-content/60">💼</span>
              <a
                href="https://www.linkedin.com/in/fabiansodaldietrichson/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-600 hover:text-sky-800"
              >
                LinkedIn-profil
              </a>
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div>
          <h2 className="text-xl font-bold text-base-content mb-4">Tilbakemelding</h2>
          <div className="space-y-4">
            <textarea
              name="happiness_feedback"
              value={feedback.happiness_feedback}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              className="textarea textarea-bordered w-full h-32 p-4"
              placeholder="Positive og negative tilbakemeldinger om Skatt AI"
            ></textarea>
            <textarea
              name="desired_features"
              value={feedback.desired_features}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              className="textarea textarea-bordered w-full h-32 p-4"
              placeholder="Ting du skulle ønske Skatt AI kunne"
            ></textarea>
            <div className="flex justify-center">
              <button
                className="btn bg-sky-700 hover:bg-sky-800 text-white font-bold px-6 rounded"
                disabled={
                  isLoading ||
                  (feedback.desired_features === '' && feedback.happiness_feedback === '')
                }
                onClick={handeButtonClick}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
