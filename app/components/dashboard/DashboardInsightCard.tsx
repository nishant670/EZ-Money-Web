import Link from "next/link";
import { ArrowUpRight, Lightbulb, TriangleAlert } from "lucide-react";
import { DashboardInsight } from "@/app/lib/api";
import { formatDate, formatMoney } from "@/app/lib/format";
import { transactionHref } from "@/app/lib/transaction-links";
import { cn } from "@/app/lib/utils";

function insightHref(insight: DashboardInsight, period: { start_date: string; end_date: string }) {
    if (insight.budget_id) return "/dashboard/tools#budgets";
    return transactionHref({
        ...period,
        type: "expense",
        ...(insight.category ? { category: insight.category } : {}),
        ...(insight.merchant ? { q: insight.merchant } : {}),
        ...(insight.account_id ? { account_id: insight.account_id } : {}),
        ...(insight.kind === "unusual_spending" && insight.amount !== undefined ? { min_amount: insight.amount } : {}),
    });
}

function supportingFacts(insight: DashboardInsight) {
    const facts: string[] = [];
    if (insight.amount !== undefined) facts.push(formatMoney(insight.amount));
    if (insight.transaction_count !== undefined) facts.push(`${insight.transaction_count} transaction${insight.transaction_count === 1 ? "" : "s"}`);
    if (insight.change_percentage !== undefined) facts.push(`${insight.change_percentage >= 0 ? "+" : ""}${Math.round(insight.change_percentage)}% change`);
    if (insight.percentage !== undefined) facts.push(`${Math.round(insight.percentage)}% ${insight.budget_id ? "used" : "share"}`);
    if (insight.limit_amount !== undefined) facts.push(`${formatMoney(insight.limit_amount)} limit`);
    if (insight.remaining_amount !== undefined) facts.push(`${formatMoney(insight.remaining_amount)} remaining`);
    if (insight.next_expected_date) facts.push(`Expected ${formatDate(insight.next_expected_date)}`);
    if (insight.confidence !== undefined) facts.push(`${Math.round(insight.confidence * 100)}% match`);
    return facts;
}

export default function DashboardInsightCard({
    insight,
    period,
    featured = false,
}: {
    insight: DashboardInsight;
    period: { start_date: string; end_date: string };
    featured?: boolean;
}) {
    const warning = insight.severity === "warning";
    const facts = supportingFacts(insight);
    const Icon = warning ? TriangleAlert : Lightbulb;

    return (
        <article className={cn(
            "rounded-panel border bg-white p-6 dark:bg-zinc-900",
            warning ? "border-amber-200 dark:border-amber-900/50" : "border-border",
            featured && "bg-gradient-to-r from-accent/10 via-white to-white dark:via-zinc-900 dark:to-zinc-900 sm:p-8",
        )}>
            <div className="flex items-start gap-4">
                <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-2xl", warning ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30" : "bg-accent/10 text-accent")}><Icon className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1">
                    <h3 className={cn("font-bold font-rounded", featured ? "text-xl" : "text-base")}>{insight.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-300">{insight.body}</p>
                </div>
            </div>

            {facts.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{facts.map((fact) => <span key={fact} className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{fact}</span>)}</div>}

            {insight.explanation && (
                <details className="mt-5 rounded-2xl bg-zinc-50 px-4 py-3 text-sm dark:bg-zinc-800/60">
                    <summary className="cursor-pointer font-bold text-zinc-600 dark:text-zinc-300">How this was calculated</summary>
                    <p className="mt-2 leading-6 text-zinc-500 dark:text-zinc-400">{insight.explanation}</p>
                </details>
            )}

            {insight.action_label && <Link href={insightHref(insight, period)} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-zinc-900 px-4 text-sm font-bold text-white dark:bg-white dark:text-zinc-900">{insight.action_label}<ArrowUpRight className="h-4 w-4" /></Link>}
        </article>
    );
}
