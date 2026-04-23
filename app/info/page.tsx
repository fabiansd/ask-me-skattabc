'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import Button from '../src/components/common/Button';
import Card from '../src/components/common/Card';
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
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const submitFeedback = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/postgres/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      });
      if (!response.ok) throw new Error('Failed to add feedback');
      await response.json();
      setFeedback(initialFeedback);
      setToast({ type: 'success', text: 'Takk for tilbakemeldingen!' });
    } catch (error) {
      console.error('Error sending feedback:', error);
      setToast({ type: 'error', text: 'Kunne ikke sende. Prøv igjen.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = event.target;
    setFeedback(prev => ({
      ...prev,
      [name]: value,
      username: getUserId(session),
    }));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      if (feedback.desired_features?.trim()) submitFeedback();
    }
  };

  return (
    <div className="flex-1">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Manual column */}
          <section className="lg:col-span-3 space-y-8">
            <header>
              <p className="text-[11px] font-medium tracking-wider uppercase text-secondary mb-2">
                Bruksmanual
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-base-content leading-tight">
                Slik får du mest ut av Optimalskatt
              </h1>
            </header>

            <Card variant="surface" className="p-6 sm:p-7">
              <h2 className="font-serif text-lg font-medium text-base-content mb-2">
                Hvordan stille spørsmål
              </h2>
              <p className="text-sm text-base-content/75 leading-relaxed">
                Skriv skattespørsmålet ditt på vanlig norsk, f.eks. «Kan jeg trekke fra
                hjemmekontor?». Du kan legge til spesifikke nøkkelord som <em>§ 6-15</em>,{' '}
                <em>fradrag</em> eller <em>MVA</em> i nøkkelord-feltet for å styre søket.
              </p>
            </Card>

            <Card variant="surface" className="p-6 sm:p-7">
              <h2 className="font-serif text-lg font-medium text-base-content mb-2">
                Smart dobbeltsøk
              </h2>
              <p className="text-sm text-base-content/75 leading-relaxed">
                Assistenten kombinerer semantisk søk i skattematerialet med eksakt matching av
                nøkkelord og §-referanser. De beste treffene fra begge metodene settes sammen for
                optimal relevans.
              </p>
            </Card>

            <Card variant="surface" className="p-6 sm:p-7">
              <h2 className="font-serif text-lg font-medium text-base-content mb-2">Svartyper</h2>
              <p className="text-sm text-base-content/75 leading-relaxed">
                Velg <strong className="text-base-content">Konkret</strong> for korte, fokuserte
                svar som inviterer til oppfølgingsspørsmål. Velg{' '}
                <strong className="text-base-content">Detaljert</strong> for grundige steg-for-steg
                forklaringer (tar litt lengre tid å generere).
              </p>
            </Card>

            <Card variant="surface" className="p-6 sm:p-7">
              <h2 className="font-serif text-lg font-medium text-base-content mb-2">Se kildene</h2>
              <p className="text-sm text-base-content/75 leading-relaxed">
                Hvert svar fra assistenten har en{' '}
                <strong className="text-base-content">Kilder</strong>-knapp som åpner et sidepanel
                med de originale lovtekstene og forskriftene svaret er bygget på.
              </p>
            </Card>

            <div>
              <h2 className="font-serif text-xl font-medium text-base-content mb-3">
                Hva assistenten kan hjelpe med
              </h2>
              <p className="text-sm text-base-content/75 leading-relaxed mb-4">
                Optimalskatt bygger på norske skattelover fra Lovdata, Skatteetatens veiledere og
                offentlige forskrifter. Den dekker blant annet:
              </p>
              <ul className="grid sm:grid-cols-2 gap-2 text-sm">
                {[
                  ['Personlig økonomi', 'Selvangivelse, fradrag og skatteoptimalisering'],
                  ['Næringsdrift', 'MVA, avskrivninger og bedriftsskatt'],
                  ['Investeringer', 'Aksjegevinst, utleie og kapitalinntekt'],
                  ['Internasjonalt', 'Dobbeltbeskatning og utenlandsk inntekt'],
                ].map(([title, body]) => (
                  <li key={title} className="rounded-box border border-base-300 bg-base-100 p-4">
                    <div className="font-medium text-base-content text-sm mb-0.5">{title}</div>
                    <div className="text-xs text-base-content/65 leading-relaxed">{body}</div>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-base-content/50 mt-4 italic">
                Merk: Dette er en eksperimentell tjeneste som ikke erstatter profesjonell
                skatterådgivning.
              </p>
            </div>
          </section>

          {/* Sidebar: contact + feedback */}
          <aside className="lg:col-span-2 space-y-6">
            <Card variant="subtle" className="p-6">
              <h2 className="font-serif text-lg font-medium text-base-content mb-4">Kontakt</h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-base-content/50 mb-0.5">
                    E-post
                  </dt>
                  <dd>
                    <a
                      href="mailto:fabian.s.dietrichson@gmail.com"
                      className="text-primary hover:text-secondary transition-colors break-all"
                    >
                      fabian.s.dietrichson@gmail.com
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-base-content/50 mb-0.5">
                    Telefon
                  </dt>
                  <dd className="text-base-content/85">+47 412 30 038</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-base-content/50 mb-0.5">
                    LinkedIn
                  </dt>
                  <dd>
                    <a
                      href="https://www.linkedin.com/in/fabiansodaldietrichson/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-secondary transition-colors"
                    >
                      Fabian S. Dietrichson
                    </a>
                  </dd>
                </div>
              </dl>
            </Card>

            <Card variant="surface" className="p-6">
              <h2 className="font-serif text-lg font-medium text-base-content mb-1">
                Tilbakemelding
              </h2>
              <p className="text-xs text-base-content/60 mb-4">
                Noe som mangler? Noe som bør fungere annerledes? Jeg leser alt.
              </p>
              <textarea
                name="desired_features"
                value={feedback.desired_features}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                rows={5}
                className="
                  w-full resize-y
                  rounded-btn border border-base-300 bg-base-100
                  px-3.5 py-3
                  text-sm text-base-content placeholder:text-base-content/40
                  focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                "
                placeholder="Ting du skulle ønske Optimalskatt kunne gjøre…"
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-[11px] text-base-content/50">⌘ + Enter for å sende</span>
                <Button
                  variant="primary"
                  size="sm"
                  loading={isLoading}
                  disabled={!feedback.desired_features?.trim()}
                  onClick={submitFeedback}
                >
                  Send
                </Button>
              </div>
            </Card>
          </aside>
        </div>
      </div>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`
            fixed bottom-4 left-1/2 -translate-x-1/2 z-50
            px-4 py-2.5 rounded-btn shadow-elevated
            text-sm font-medium
            animate-slide-up
            ${
              toast.type === 'success'
                ? 'bg-success text-success-content'
                : 'bg-error text-error-content'
            }
          `}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}
