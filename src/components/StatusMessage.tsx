import type { ReactNode } from "react";

export function LoadingState({ label = "Searching flights…" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="space-y-3">
      <p className="text-sm text-slate-600">{label}</p>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-36 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />
      ))}
    </div>
  );
}

interface MessageProps {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, children, action }: MessageProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      {children && <div className="mt-2 text-sm text-slate-600">{children}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ title, children, action }: MessageProps) {
  return (
    <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6">
      <h2 className="text-lg font-semibold text-red-800">{title}</h2>
      {children && <div className="mt-2 text-sm text-red-700">{children}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
