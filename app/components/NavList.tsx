import { NavLink } from "react-router";
import type { ReactNode } from "react";

type NavLinkItemProps = {
  to: string;
  children: ReactNode;
  end?: boolean;
  relative?: "route" | "path";
  className?: string;
};

export function NavLinkItem({ to, children, end, relative, className = "" }: NavLinkItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      relative={relative}
      className={({ isActive }) =>
        `rounded-pill px-3 py-1.5 text-sm font-medium transition-colors ${
          isActive ? "bg-brand-500 text-white" : "text-neutral-600 hover:bg-brand-50 hover:text-brand-600"
        } ${className}`
      }
    >
      {children}
    </NavLink>
  );
}

type NavListProps = {
  items: { to: string; label: string; end?: boolean }[];
  className?: string;
};

export function NavList({ items, className = "flex flex-row items-center gap-2" }: NavListProps) {
  return (
    <ul className={className}>
      {items.map((item) => (
        <li key={item.to}>
          <NavLinkItem to={item.to} end={item.end}>
            {item.label}
          </NavLinkItem>
        </li>
      ))}
    </ul>
  );
}
