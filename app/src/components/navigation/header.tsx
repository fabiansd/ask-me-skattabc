'use client';
import { useSession } from 'next-auth/react';

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
        <a href="/info" className="btn btn-ghost text-sm rounded">
          Info
        </a>
        {session ? (
          <a href="/account" className="btn btn-ghost rounded">
            {session.user?.name || getUserId(session)}
          </a>
        ) : (
          <a href="/account" className="btn btn-ghost rounded">
            Login
          </a>
        )}
      </div>
    </div>
  );
};

export default Header;
