'use client';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function LoginPage() {
  const { data: session } = useSession();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="card p-6 bg-base-200 shadow max-w-md w-full">
        <h2 className="mb-6 text-2xl font-bold text-center text-white">
          {session ? 'Profil' : 'Logg inn'}
        </h2>

        {session ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-white">Logget inn som:</p>
              <p className="font-bold text-lg">{session.user?.name || session.user?.email}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="btn bg-red-600 hover:bg-red-700 text-white w-full"
            >
              Logg ut
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-center text-gray-300 mb-4">
              Logg inn med Google for å lagre historikk
            </p>
            <button
              onClick={() => signIn('google')}
              className="btn bg-blue-600 hover:bg-blue-700 text-white w-full"
            >
              Logg inn med Google
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
