export function CardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-neutral-0 shadow-card animate-pulse">
      <div className="aspect-2/1 w-full bg-neutral-200" />
      <div className="flex flex-col gap-2 p-4">
        <div className="h-5 w-3/4 rounded bg-neutral-200" />
        <div className="h-4 w-1/2 rounded bg-neutral-100" />
        <div className="h-4 w-1/3 rounded bg-neutral-100" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 6 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-4 border-b border-neutral-100 bg-neutral-0 px-4 py-3.5 animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded bg-neutral-200"
          style={{ width: `${Math.max(40, 100 - i * 12)}px`, flexGrow: i === 1 ? 1 : 0 }}
        />
      ))}
    </div>
  );
}

export function DetailsSkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 animate-pulse">
      <div className="mb-6 flex justify-between">
        <div className="h-8 w-64 rounded bg-neutral-200" />
        <div className="h-8 w-24 rounded-pill bg-neutral-200" />
      </div>
      <div className="mb-6 aspect-2/1 w-full rounded-xl bg-neutral-200" />
      <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-neutral-0 p-6">
        <div className="h-6 w-48 rounded bg-neutral-200" />
        <div className="h-4 w-full rounded bg-neutral-100" />
        <div className="h-4 w-5/6 rounded bg-neutral-100" />
      </div>
    </div>
  );
}

