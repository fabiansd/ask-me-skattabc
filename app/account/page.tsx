'use client';
import { signIn, signOut, useSession } from 'next-auth/react';
// eslint-disable-next-line import/order
import { useSearchParams } from 'next/navigation';

export default function AccountPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const promptSelectAccount = searchParams.get('prompt') === 'select_account';

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-700"></div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-center pt-20">
      <div className="card p-8 bg-base-200 shadow-xl max-w-md w-full">
        <h1 className="mb-6 text-2xl font-bold text-center text-white">
          {session ? 'Konto' : 'Logg inn'}
        </h1>

        {!session ? (
          <div className="space-y-4">
            <p className="text-center text-gray-300 mb-6">
              Logg inn for å få tilgang til samtalehistorikk og bedre modell.
            </p>
            <button
              onClick={() =>
                signIn(
                  'google',
                  undefined,
                  promptSelectAccount ? { prompt: 'select_account' } : undefined
                )
              }
              className="btn bg-sky-700 hover:bg-sky-800 text-white font-bold w-full"
            >
              Logg inn med Google
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-white mb-2">Logget inn som:</p>
              <p className="font-bold text-lg text-white">{session.user?.name}</p>
              <p className="text-gray-300 text-sm">{session.user?.email}</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => (window.location.href = '/')}
                className="btn bg-sky-700 hover:bg-sky-800 text-white font-bold w-full"
              >
                Gå til hovedside
              </button>
              <button
                onClick={() => signOut({ callbackUrl: '/account' })}
                className="btn bg-red-600 hover:bg-red-700 text-white w-full"
              >
                Logg ut
              </button>
            </div>

            <div className="border-t border-gray-600 pt-4">
              <button
                onClick={() => signOut({ callbackUrl: '/account?prompt=select_account' })}
                className="btn btn-ghost text-gray-400 hover:text-white w-full text-sm"
              >
                Logg inn med ny bruker
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
