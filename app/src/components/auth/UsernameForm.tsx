'use client'
import { useContext, useState } from 'react';
import UserContext from '../../contexts/user';

export default function UsernameForm() {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-center text-gray-300 mb-2">
          Lag brukernavn for å kunne holde historikk
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Skriv inn brukernavn"
          className="w-full px-3 py-2 text-gray-900 bg-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        className="btn bg-sky-700 hover:bg-sky-800 text-white font-bold w-full m-1 px-6 rounded"
        disabled={!username}
      >
        Lag / velg brukernavn
      </button>
    </form>
  );
}