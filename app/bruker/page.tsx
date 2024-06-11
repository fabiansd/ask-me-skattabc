'use client'
import React, { useContext, useState } from 'react';
import UserContext from '../src/contexts/user';

const LoginPage = () => {
  const { createUser } = useContext(UserContext);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await createUser(username);
      setUsername('');
    } catch (error) {
      setError('Error creating user. Please try again.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && username) {
      handleSubmit(e as any); // TypeScript hack to make it compile
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-4 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="mb-4 text-2xl font-bold text-center text-white">Lag / velg brukernavn</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-center text-gray-300">
              Lag brukernavn for å kunne holde historikk
            </label>
            <label htmlFor="username" className="block mb-2 text-sm font-medium text-center text-gray-300">
              Velg eventuelt tidligere registrert brukernavn
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div>
            <button
              className="w-full px-4 py-2 text-white bg-sky-700 hover:bg-sky-800 rounded "
              disabled={!username}
            >
              Lag / velg
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
