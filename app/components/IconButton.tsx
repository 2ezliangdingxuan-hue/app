import type { ComponentPropsWithoutRef } from "react";

type IconButtonProps = ComponentPropsWithoutRef<"button"> & {
  size?: "sm" | "md";
};

export function IconButton({ className = "", size = "md", children, ...rest }: IconButtonProps) {
  const dims = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  return (
    <button
      type="button"
      className={`inline-flex ${dims} items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-brand-50 hover:text-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
