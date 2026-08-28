import type { ComponentPropsWithoutRef } from "react";

type TextareaProps = ComponentPropsWithoutRef<"textarea">;

export function Textarea({ className = "", ...rest }: TextareaProps) {
  return (
    <textarea
      className={`w-full rounded-md border border-neutral-300 bg-neutral-0 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-400/40 ${className}`}
      {...rest}
    />
  );
}
