import type { ComponentPropsWithoutRef } from "react";

type SelectProps = ComponentPropsWithoutRef<"select">;

export function Select({ className = "", children, ...rest }: SelectProps) {
  return (
    <select
      className={`w-full rounded-md border border-neutral-300 bg-neutral-0 px-3 py-2 text-neutral-800 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-400/40 ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
}
