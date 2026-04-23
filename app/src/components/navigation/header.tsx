'use client';
import { useSession } from 'next-auth/react';

import { getUserId } from '../../service/users/getUserId';

const Header = () => {
  const { data: session } = useSession();
  const displayName = session?.user?.name || (session ? getUserId(session) : null);

  return (
    <header
      data-testid="app-header"
      className="sticky top-0 z-30 border-b border-base-300 bg-base-100/90 backdrop-blur-sm supports-[backdrop-filter]:bg-base-100/80"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <a
            href="/"
            className="group flex items-center gap-2 font-serif text-lg sm:text-xl font-medium tracking-tight text-base-content hover:text-primary transition-colors"
            aria-label="Optimalskatt — til forsiden"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6 text-secondary"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 2.5l2.8 5.8 6.4.9-4.6 4.5 1.1 6.3L12 17l-5.7 3 1.1-6.3L2.8 9.2l6.4-.9L12 2.5z"
              />
            </svg>
            <span className="relative">
              Optimalskatt
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-secondary transition-all duration-200 group-hover:w-full" />
            </span>
          </a>

          <nav className="flex items-center gap-1 sm:gap-2">
            <a
              data-testid="nav-info"
              href="/info"
              className="h-9 inline-flex items-center px-3 rounded-btn text-sm text-base-content/80 hover:text-base-content hover:bg-base-200 transition-colors"
            >
              Info
            </a>
            <a
              data-testid="nav-account"
              href="/account"
              className="h-9 inline-flex items-center gap-2 px-3 rounded-btn text-sm text-base-content/80 hover:text-base-content hover:bg-base-200 transition-colors max-w-[10rem] sm:max-w-[14rem]"
            >
              {displayName ? (
                <>
                  <span
                    className="h-6 w-6 shrink-0 rounded-full bg-primary text-primary-content grid place-items-center text-[11px] font-semibold"
                    aria-hidden
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                  <span className="truncate">{displayName}</span>
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 10-6 0 3 3 0 006 0zm0 0c2.5 0 4.5 2 4.5 4.5M9 12c-2.5 0-4.5 2-4.5 4.5M12 21.5A9.5 9.5 0 1012 2.5a9.5 9.5 0 000 19z"
                    />
                  </svg>
                  <span>Logg inn</span>
                </>
              )}
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
