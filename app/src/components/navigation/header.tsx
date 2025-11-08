'use client';
import { useSession } from 'next-auth/react';

import { getUserId } from '../../service/users/getUserId';

const Header = () => {
  const { data: session } = useSession();

  return (
    <div className="navbar bg-base-200 px-2 shadow">
      <div className="navbar-start">
        <a href="/" className="btn btn-ghost text-xl">
          Skatt AI
        </a>
      </div>
      <div className="navbar-center hidden lg:flex"></div>
      <div className="navbar-end flex items-center">
        <a href="/info" className="btn btn-ghost text-sm rounded px-2">
          Info
        </a>
        {session ? (
          <a href="/account" className="btn btn-ghost rounded max-w-[12.5rem] overflow-hidden px-2">
            <span className="block truncate text-left">
              {session.user?.name || getUserId(session)}
            </span>
          </a>
        ) : (
          <a href="/account" className="btn btn-ghost rounded px-2">
            Login
          </a>
        )}
      </div>
    </div>
  );
};

export default Header;
