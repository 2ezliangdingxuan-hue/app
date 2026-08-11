import { useState } from "react";
import { Link } from "react-router";
import { NavList } from "~/components/NavList";

const NAV_ITEMS = [
  { to: "/events", label: "Events" },
  { to: "/createEvent", label: "Create Event" },
  { to: "/scanner", label: "Scanner" },
  { to: "/sign-in", label: "Sign in" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-neutral-0/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <Link to="/" className="text-2xl font-extrabold tracking-tight text-brand-500">
          App1
        </Link>

        <nav className="hidden md:block">
          <NavList items={NAV_ITEMS} />
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
        </nav>
      )}
    </header>
  );
}
