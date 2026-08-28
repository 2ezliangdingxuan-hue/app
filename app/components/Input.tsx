import type { ComponentPropsWithoutRef } from "react";

type InputProps = ComponentPropsWithoutRef<"input"> & { invalid?: boolean };

export function Input({ className = "", invalid = false, ...rest }: InputProps) {
  return (
    <input
      className={`w-full rounded-md border bg-neutral-0 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-400/40 ${
        invalid ? "border-danger-500" : "border-neutral-300"
      } ${className}`}
      {...rest}
    />
  );
}
