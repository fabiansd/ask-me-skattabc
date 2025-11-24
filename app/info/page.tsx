'use client';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

import { UserFeedbackInput } from '../src/interface/feedback';
import { getUserId } from '../src/service/users/getUserId';

const initialFeedback: UserFeedbackInput = {
  username: 'default',
  happiness_feedback: 'x',
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
    <div className="pt-10 px-4 flex justify-center">
      <div className="w-full max-w-2xl space-y-8 pb-8">
        {/* How to Use */}
        <div>
          <h2 className="text-xl font-bold text-base-content mb-4">Bruksmanual</h2>

          <p className="text-base-content/80 leading-relaxed mb-4">
            <strong>Hvordan søke</strong>
            <br />
            Skriv ditt skattespørsmål på vanlig norsk, f.eks. &quot;Kan jeg trekke fra
            hjemmekontor?&quot; For bedre treff kan du legge til spesifikke nøkkelord som &quot;§
            6-15&quot;, &quot;fradrag&quot;, eller &quot;MVA&quot; i nøkkelord-feltet.
          </p>

          <p className="text-base-content/80 leading-relaxed mb-4">
            <strong>Smart matching</strong>
            <br />
            Assistenten bruker dobbelt søk - den leter etter lover som forstår spørsmålet ditt
            semantisk, samtidig som den matcher eksakte nøkkelord som §-referanser. De beste
            treffene fra begge metodene kombineres for optimal relevans.
          </p>

          <p className="text-base-content/80 leading-relaxed mb-4">
            <strong>Svartyper</strong>
            <br />
            Velg <em>konkret</em> for korte, fokuserte svar som åpner for oppfølgingsspørsmål. Velg{' '}
            <em>detaljert</em> for grundige steg-for-steg forklaringer (tar lengre tid å generere).
          </p>

          <p className="text-base-content/80 leading-relaxed mb-4">
            <strong>Se kildene</strong>
            <br />
            Hvert svar fra assistenten har en &quot;Kilder&quot;-knapp som lar deg se de originale
            lovtekstene og forskriftene som ble brukt til å generere svaret. Klikk på knappen for å
            åpne en sidepanel med alle kildedokumentene.
          </p>
        </div>

        {/* About the AI Assistant */}
        <div>
          <p className="text-base-content/80 leading-relaxed mb-4">
            Denne AI-assistenten bruker juridiske tekster og alle norske skattelover fra Lovdata til
            å gi presise svar på komplekse skattespørsmål. Systemet kombinerer semantisk søk i
            skattemateriale med avanserte språkmodeller for å levere praktiske råd innen:
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
              <span className="text-base-content/80">+47 412 30 038</span>
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
              name="desired_features"
              value={feedback.desired_features}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              className="textarea textarea-bordered w-full h-32 p-4"
              placeholder="Ting du skulle ønske skatt AI kunne gjøre og generell tilbakemelding."
            ></textarea>
            <div className="flex justify-center">
              <button
                className="btn bg-sky-700 hover:bg-sky-800 text-white font-bold px-6 rounded"
                disabled={isLoading || feedback.desired_features === ''}
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
