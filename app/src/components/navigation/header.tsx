'use client';
import { signIn, signOut, useSession } from 'next-auth/react';

import { getUserId } from '../../service/users/getUserId';

const Header = () => {
  const { data: session } = useSession();

  return (
    <div className="navbar bg-base-200 px-10 shadow">
      <div className="navbar-start">
        <a href="/" className="btn btn-ghost text-xl">
          Skatt AI
        </a>
      </div>
      <div className="navbar-center hidden lg:flex"></div>
      <div className="navbar-end flex items-center gap-2">
        <a href="/info" className="btn btn-ghost text-sm">
          Info
        </a>
        {session ? (
          <button onClick={() => signOut()} className="btn btn-ghost">
            {session.user?.name || getUserId(session)}
          </button>
        ) : (
          <button onClick={() => signIn('google')} className="btn btn-ghost">
            Login
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
