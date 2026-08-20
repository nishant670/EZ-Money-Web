import type { ReactNode } from "react";
import { DashboardBudgetStatus } from "@/app/lib/api";
import { formatMoney } from "@/app/lib/format";
import { cn } from "@/app/lib/utils";

const STATUS_STYLES: Record<DashboardBudgetStatus["status"], { badge: string; bar: string; label: string }> = {
    safe: {
        badge: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30",
        bar: "bg-emerald-500",
        label: "On track",
    },
    watch: {
        badge: "bg-amber-50 text-amber-600 dark:bg-amber-950/30",
        bar: "bg-amber-500",
        label: "Watch",
    },
    exceeded: {
        badge: "bg-rose-50 text-rose-600 dark:bg-rose-950/30",
        bar: "bg-rose-500",
        label: "Exceeded",
    },
};

export default function BudgetProgressCard({
    budget,
    footer,
    compact = false,
}: {
    budget: DashboardBudgetStatus;
    footer?: ReactNode;
    compact?: boolean;
}) {
    const styles = STATUS_STYLES[budget.status];
    const percentage = Math.max(0, budget.percentage);
    const trackPercentage = Math.min(100, percentage);
    const roundedPercentage = Math.round(percentage);
    const dayLabel = `${budget.days_left} day${budget.days_left === 1 ? "" : "s"} left`;

    return (
        <article className={cn("rounded-2xl border border-border bg-white dark:bg-zinc-900", compact ? "p-5" : "p-6")}>
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="truncate font-bold">{budget.name}</p>
                    <p className="mt-1 truncate text-xs text-zinc-400">{budget.category || "All expenses"}</p>
                </div>
                <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider", styles.badge)}>{styles.label}</span>
            </div>

            <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                    <p className="text-sm font-bold">{formatMoney(budget.spent_amount)} <span className="font-medium text-zinc-400">of {formatMoney(budget.limit_amount)}</span></p>
                    <p className="mt-1 text-xs text-zinc-400">confirmed spending</p>
                </div>
                <p className={cn("text-2xl font-bold font-rounded", budget.status === "safe" ? "text-emerald-600" : budget.status === "watch" ? "text-amber-600" : "text-rose-600")}>{roundedPercentage}%</p>
            </div>

            <div
                className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
                role="progressbar"
                aria-label={`${budget.name} budget used`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={trackPercentage}
                aria-valuetext={`${roundedPercentage}% used`}
            >
                <div className={cn("h-full rounded-full", styles.bar)} style={{ width: `${trackPercentage}%` }} />
            </div>

            <div className="mt-4 flex items-center justify-between gap-4 text-xs">
                <span className="font-semibold text-zinc-500">{formatMoney(budget.remaining_amount)} remaining</span>
                <span className="text-zinc-400">{dayLabel}</span>
            </div>

            {footer && <div className="mt-5 border-t border-border pt-4">{footer}</div>}
        </article>
    );
}
