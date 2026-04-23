'use client';
import { useSearchParams } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Suspense } from 'react';

import Button from '../src/components/common/Button';
import Card from '../src/components/common/Card';

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function AccountContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const promptSelectAccount = searchParams.get('prompt') === 'select_account';

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center flex-1 min-h-[60vh]">
        <div
          className="h-8 w-8 rounded-full border-2 border-primary border-r-transparent animate-spin"
          aria-label="Laster"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex justify-center px-4 pt-10 sm:pt-16 pb-10">
      <Card variant="elevated" className="max-w-md w-full p-7 sm:p-8">
        <header className="text-center mb-6">
          <h1 className="font-serif text-2xl font-medium text-base-content tracking-tight">
            {session ? 'Min konto' : 'Logg inn'}
          </h1>
          <p className="mt-1.5 text-sm text-base-content/65">
            {session
              ? 'Administrer kontoen din og logg ut av Optimalskatt.'
              : 'Få tilgang til samtalehistorikk og en kraftigere modell.'}
          </p>
        </header>

        {!session ? (
          <div className="space-y-3">
            <Button
              variant="primary"
              size="md"
              fullWidth
              leftIcon={<GoogleIcon />}
              onClick={() =>
                signIn(
                  'google',
                  undefined,
                  promptSelectAccount ? { prompt: 'select_account' } : undefined
                )
              }
            >
              Fortsett med Google
            </Button>
            <p className="text-center text-[11px] text-base-content/50">
              Ved å logge inn aksepterer du at samtalene dine lagres i vår database.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-3 rounded-box bg-base-200 border border-base-300 p-4">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-content grid place-items-center font-medium">
                {(session.user?.name || session.user?.email || '?').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-base-content truncate">{session.user?.name}</p>
                <p className="text-xs text-base-content/60 truncate">{session.user?.email}</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={() => (window.location.href = '/')}
              >
                Gå til assistenten
              </Button>
              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={() => signOut({ callbackUrl: '/account' })}
              >
                Logg ut
              </Button>
            </div>

            <div className="pt-3 border-t border-base-300">
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                onClick={() => signOut({ callbackUrl: '/account?prompt=select_account' })}
              >
                Bytt Google-konto
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center flex-1 min-h-[60vh]">
          <div
            className="h-8 w-8 rounded-full border-2 border-primary border-r-transparent animate-spin"
            aria-label="Laster"
          />
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
