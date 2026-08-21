import type { Subscription } from "@/app/lib/api";

type DueStatePresentation = { label: string; className: string };

export const SUBSCRIPTION_DUE_STATES: Record<Subscription["due_state"], DueStatePresentation> = {
    scheduled: { label: "Upcoming", className: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800" },
    due_soon: { label: "Due soon", className: "bg-amber-50 text-amber-600 dark:bg-amber-950/30" },
    overdue: { label: "Overdue", className: "bg-red-50 text-red-600 dark:bg-red-950/30" },
    paused: { label: "Paused", className: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800" },
    cancelled: { label: "Cancelled", className: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800" },
    unknown: { label: "Date unavailable", className: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800" },
};
