import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { NavList } from "~/components/NavList";
import { UserMenu } from "~/components/UserMenu";
import { useAuth } from "~/auth/AuthContext";

const NAV_ITEMS = [
  { to: "/events", label: "Your Events" },
  { to: "/createEvent", label: "Create Events" },
  { to: "/scanner", label: "Scanner" },
];

const SIGN_IN_ITEM = [{ to: "/sign-in", label: "Sign in" }];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { account, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-brand-700/60 bg-brand-600/95 backdrop-blur-md shadow-soft">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-white group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white shadow-inner transition-transform group-hover:scale-105">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
              <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
            </svg>
          </div>
          <span className="font-extrabold tracking-tight">GatherEase</span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <NavList items={NAV_ITEMS} variant="dark" />
          {account ? (
            <UserMenu name={account.name || account.email} onSignOut={handleSignOut} variant="dark" />
          ) : (
            <NavList items={SIGN_IN_ITEM} variant="dark" />
          )}
        </nav>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((current) => !current)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15 hover:text-white md:hidden"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {mobileOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <nav className="border-t border-brand-700/80 bg-brand-700/90 px-4 py-4 md:hidden animate-in slide-in-from-top-2">
          <NavList
            items={NAV_ITEMS}
            className="flex-col items-stretch gap-1.5"
            variant="dark"
          />
          {account ? (
            <div className="mt-3 flex flex-col gap-1 border-t border-brand-600/80 pt-3">
              <div className="px-3 py-1 text-xs font-medium uppercase tracking-wider text-white/70">
                Signed in as {account.name || account.email}
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-xl px-3 py-2 text-left text-sm font-medium text-white/90 transition-colors hover:bg-white/15 hover:text-white"
              >
                Log out
              </button>
            </div>
          ) : (
            <NavList items={SIGN_IN_ITEM} className="mt-2 flex-col items-stretch gap-1.5" variant="dark" />
          )}
        </nav>
      )}
    </header>
  );
}
