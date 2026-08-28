import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  action?: ReactNode;
  className?: string;
};

export function PageHeader({ title, action, className = "" }: PageHeaderProps) {
  return (
    <div className={`flex flex-row items-center justify-between gap-4 ${className}`}>
      <h1 className="text-2xl font-bold text-neutral-800 sm:text-3xl">{title}</h1>
      {action}
    </div>
  );
}
