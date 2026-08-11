import { useState } from "react";
import { Link } from "react-router";
import { NavList } from "~/components/NavList";
import { UserMenu } from "~/components/UserMenu";
import { useAuth } from "~/auth/AuthContext";

const NAV_ITEMS = [
  { to: "/events", label: "Your Events" },
  { to: "/createEvent", label: "Create Event" },
  { to: "/scanner", label: "Scanner" },
];

const SIGN_IN_ITEM = [{ to: "/sign-in", label: "Sign in" }];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { account, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-neutral-0/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <Link to="/" className="text-2xl font-extrabold tracking-tight text-brand-500">
          App1
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <NavList items={NAV_ITEMS} />
          {account ? (
            <UserMenu name={account.name || account.email} onSignOut={signOut} />
          ) : (
            <NavList items={SIGN_IN_ITEM} />
          )}
        </nav>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((current) => !current)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-brand-50 hover:text-brand-600 md:hidden"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {mobileOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <nav className="border-t border-neutral-200 px-4 py-3 md:hidden">
          <NavList items={NAV_ITEMS} className="flex-col items-stretch gap-1" />
          {account ? (
            <div className="mt-2 flex flex-col gap-1 border-t border-neutral-100 pt-2">
              <div className="px-3 py-1 text-xs font-medium uppercase tracking-wide text-neutral-400">
                Signed in as {account.name || account.email}
              </div>
              <button
                type="button"
                onClick={signOut}
                className="rounded-pill px-3 py-1.5 text-left text-sm font-medium text-neutral-600 transition-colors hover:bg-brand-50 hover:text-brand-600"
              >
                Log out
              </button>
            </div>
          ) : (
            <NavList items={SIGN_IN_ITEM} className="mt-1 flex-col items-stretch gap-1" />
          )}
        </nav>
      )}
    </header>
  );
}
