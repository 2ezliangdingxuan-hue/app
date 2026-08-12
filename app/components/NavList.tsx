import { NavLink } from "react-router";
import type { ReactNode } from "react";

type NavLinkItemProps = {
  to: string;
  children: ReactNode;
  end?: boolean;
  relative?: "route" | "path";
  className?: string;
  variant?: "light" | "dark";
};

export function NavLinkItem({ to, children, end, relative, className = "", variant = "light" }: NavLinkItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      relative={relative}
      className={({ isActive }) =>
        `rounded-pill px-3 py-1.5 text-sm font-medium transition-colors ${
          variant === "dark"
            ? isActive
              ? "bg-white text-brand-700"
              : "text-white/90 hover:bg-white/10 hover:text-white"
            : isActive
              ? "bg-brand-500 text-white"
              : "text-neutral-600 hover:bg-brand-50 hover:text-brand-600"
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
  variant?: "light" | "dark";
};

export function NavList({ items, className = "flex flex-row items-center gap-2", variant = "light" }: NavListProps) {
  return (
    <ul className={className}>
      {items.map((item) => (
        <li key={item.to}>
          <NavLinkItem to={item.to} end={item.end} variant={variant}>
            {item.label}
          </NavLinkItem>
        </li>
      ))}
    </ul>
  );
}
