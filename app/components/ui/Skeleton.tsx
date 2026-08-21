import { cn } from "@/app/lib/utils";

export default function Skeleton({ className }: { className?: string }) {
    return <div aria-hidden="true" className={cn("animate-pulse rounded-xl bg-zinc-200/75 dark:bg-zinc-800", className)} />;
}

export function PageSkeleton({ rows = 4 }: { rows?: number }) {
    return <div className="space-y-6" role="status" aria-label="Loading content"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-32 rounded-panel" />)}</div><Skeleton className="h-72 rounded-panel" /><div className="space-y-3 rounded-panel border border-border bg-card p-6">{Array.from({ length: rows }, (_, index) => <Skeleton key={index} className="h-14" />)}</div><span className="sr-only">Loading…</span></div>;
}
