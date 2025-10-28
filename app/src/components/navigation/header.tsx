'use client';
import { signIn, signOut, useSession } from 'next-auth/react';

import { getUserId } from '../../service/users/getUserId';
import Health from '../serverPingHealth';

const Header = () => {
  const { data: session } = useSession();

  return (
    <div className="navbar bg-base-200 px-10 shadow">
      <div className="navbar-start">
        <a href="/" className="btn btn-ghost text-xl">
          SkattGPT
        </a>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <a href="/info" className="btn btn-ghost text-xl">
            Informasjon
          </a>
        </ul>
      </div>
      <div className="navbar-end">
        <div className="pr-8">
          <Health />
        </div>
        {session ? (
          <button onClick={() => signOut()} className="btn">
            {session.user?.name || getUserId(session)}
          </button>
        ) : (
          <button onClick={() => signIn('google')} className="btn">
            Login
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
