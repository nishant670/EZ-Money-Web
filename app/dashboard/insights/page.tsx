"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    CalendarRange,
    CircleHelp,
    Clock3,
    Lightbulb,
    Loader2,
    RefreshCw,
    Repeat2,
    Store,
    WalletCards,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import { apiErrorMessage, DashboardAPI, DashboardResponse } from "@/app/lib/api";
import { cn } from "@/app/lib/utils";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

function todayISO() {
    const date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 10);
}

function monthStartISO() {
    const date = new Date();
    date.setDate(1);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 10);
}

export default function InsightsScreen() {
    const [startDate, setStartDate] = useState(monthStartISO);
    const [endDate, setEndDate] = useState(todayISO);
    const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadInsights = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await DashboardAPI.get({
                start_date: startDate,
                end_date: endDate,
                tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
            });
            setDashboard(response.data);
        } catch (requestError) {
            setError(apiErrorMessage(requestError, "We couldn’t calculate insights for this range."));
        } finally {
            setLoading(false);
        }
    }, [endDate, startDate]);

    useEffect(() => { void loadInsights(); }, [loadInsights]);

    const accounts = dashboard?.account_spending.map((item) => ({ name: item.account_name, amount: item.amount })) || [];
    const dueCandidates = dashboard?.recurring_candidates.filter((candidate) => candidate.review_due) || [];

    return (
        <DashboardLayout>
            <div className="space-y-7 pb-12">
                <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Explainable analysis</p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight font-rounded sm:text-4xl">Insights, with the numbers behind them.</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">Every observation comes from your confirmed transactions. No invented forecasts, scores, or financial advice.</p>
                    </div>
                    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-white p-2 dark:bg-zinc-900 sm:flex-row sm:items-center">
                        <label className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-zinc-500"><CalendarRange className="h-4 w-4 text-accent" /><span className="sr-only">Start date</span><input type="date" value={startDate} max={endDate} onChange={(event) => setStartDate(event.target.value)} className="bg-transparent outline-none" /></label>
                        <span className="hidden text-zinc-300 sm:block">→</span>
                        <label className="rounded-xl px-3 py-2 text-xs font-bold text-zinc-500"><span className="sr-only">End date</span><input type="date" value={endDate} min={startDate} max={todayISO()} onChange={(event) => setEndDate(event.target.value)} className="bg-transparent outline-none" /></label>
                        <button onClick={() => void loadInsights()} className="grid h-10 w-10 place-items-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" aria-label="Refresh insights"><RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /></button>
                    </div>
                </header>

                {loading ? (
                    <div className="grid min-h-[520px] place-items-center rounded-[2rem] border border-border bg-white dark:bg-zinc-900"><div className="text-center"><Loader2 className="mx-auto mb-3 h-7 w-7 animate-spin text-accent" /><p className="text-sm font-semibold text-zinc-400">Comparing this period with the previous one…</p></div></div>
                ) : error ? (
                    <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 dark:border-red-900/40 dark:bg-red-950/20"><AlertTriangle className="h-6 w-6 text-red-500" /><h2 className="mt-3 text-lg font-bold">Insights unavailable</h2><p className="mt-2 text-sm text-red-700/70 dark:text-red-300/70">{error}</p><button onClick={() => void loadInsights()} className="mt-5 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white">Try again</button></div>
                ) : dashboard && (
                    <>
                        <section className="grid gap-4 lg:grid-cols-3">
                            <article className="rounded-[2rem] bg-zinc-950 p-7 text-white lg:col-span-2">
                                <div className="flex items-start justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">This period</p><h2 className="mt-3 text-4xl font-bold tracking-tight font-rounded">{currency.format(dashboard.summary.total_spent)}</h2><p className="mt-2 text-sm text-zinc-400">spent across {dashboard.summary.transaction_count} confirmed transactions</p></div><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10"><ArrowDownRight className="h-5 w-5 text-accent" /></span></div>
                                <div className="mt-8 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-zinc-400">Income</p><p className="mt-1 text-xl font-bold">{currency.format(dashboard.summary.total_income)}</p></div><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-zinc-400">Daily spending average</p><p className="mt-1 text-xl font-bold">{currency.format(dashboard.summary.daily_average)}</p></div></div>
                            </article>
                            <article className="rounded-[2rem] border border-border bg-white p-7 dark:bg-zinc-900"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">Review queue</p><h2 className="mt-2 text-3xl font-bold font-rounded">{dueCandidates.length}</h2></div><Clock3 className="h-6 w-6 text-accent" /></div><p className="mt-3 text-sm leading-6 text-zinc-500">Likely recurring expenses whose expected date is in or just after this period.</p><div className="mt-5 rounded-xl bg-accent/10 p-3 text-xs font-semibold text-accent">Detected from stable repeated merchant or category patterns.</div></article>
                        </section>

                        <section>
                            <div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">What changed</p><h2 className="mt-1 text-xl font-bold font-rounded">Insight cards</h2></div><span className="text-xs text-zinc-400">Compared with the preceding equal-length period</span></div>
                            {dashboard.insights.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{dashboard.insights.map((insight) => (
                                <article key={`${insight.kind}-${insight.title}`} className={cn("rounded-[1.75rem] border bg-white p-6 dark:bg-zinc-900", insight.severity === "warning" ? "border-amber-200 dark:border-amber-900/50" : "border-border")}>
                                    <span className={cn("grid h-10 w-10 place-items-center rounded-xl", insight.severity === "warning" ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30" : "bg-accent/10 text-accent")}>{insight.severity === "warning" ? <AlertTriangle className="h-4 w-4" /> : <Lightbulb className="h-4 w-4" />}</span>
                                    <h3 className="mt-5 text-base font-bold">{insight.title}</h3><p className="mt-2 text-sm leading-6 text-zinc-500">{insight.body}</p>
                                </article>
                            ))}</div> : <div className="rounded-[1.75rem] border border-dashed border-border p-8 text-center text-sm text-zinc-400">Add more transactions to unlock comparisons and patterns.</div>}
                        </section>

                        <section className="grid gap-6 xl:grid-cols-2">
                            <div className="rounded-[2rem] border border-border bg-white p-6 dark:bg-zinc-900 sm:p-8"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent"><WalletCards className="h-4 w-4" /></span><div><h2 className="font-bold font-rounded">Account usage</h2><p className="text-xs text-zinc-400">Spending by payment source</p></div></div><div className="mt-6 h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={accounts}><CartesianGrid vertical={false} stroke="#eee" strokeDasharray="3 3" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#71717a" }} /><YAxis hide /><Tooltip formatter={(value) => currency.format(Number(value))} contentStyle={{ borderRadius: 16, border: "1px solid #f0e5e7" }} /><Bar dataKey="amount" fill="#FF8865" radius={[8, 8, 0, 0]} barSize={36} /></BarChart></ResponsiveContainer></div></div>
                            <div className="rounded-[2rem] border border-border bg-white p-6 dark:bg-zinc-900 sm:p-8"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30"><Store className="h-4 w-4" /></span><div><h2 className="font-bold font-rounded">Merchant concentration</h2><p className="text-xs text-zinc-400">Your largest merchant totals</p></div></div><div className="mt-6 space-y-3">{dashboard.top_merchants.map((merchant, index) => <div key={merchant.merchant} className="flex items-center gap-4 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800"><span className="text-xs font-bold text-zinc-400">0{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{merchant.merchant}</p><p className="text-xs text-zinc-400">{merchant.transaction_count} entries</p></div><p className="text-sm font-bold">{currency.format(merchant.amount)}</p></div>)}</div></div>
                        </section>

                        <section className="rounded-[2rem] border border-border bg-white p-6 dark:bg-zinc-900 sm:p-8">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex items-center gap-2 text-accent"><Repeat2 className="h-4 w-4" /><p className="text-xs font-bold uppercase tracking-[0.18em]">Recurring review</p></div><h2 className="mt-2 text-xl font-bold font-rounded">Patterns worth confirming</h2></div><span className="inline-flex items-center gap-1 text-xs text-zinc-400"><CircleHelp className="h-3.5 w-3.5" /> A candidate is not saved as a subscription automatically.</span></div>
                            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{dashboard.recurring_candidates.length ? dashboard.recurring_candidates.map((candidate) => <article key={`${candidate.label}-${candidate.next_expected_date}`} className="rounded-2xl border border-border p-5"><div className="flex items-start justify-between gap-4"><div><p className="font-bold">{candidate.label}</p><p className="mt-1 text-xs text-zinc-400">{candidate.interval_guess} · {candidate.occurrences} occurrences</p></div>{candidate.review_due && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:bg-amber-950/30">Review</span>}</div><p className="mt-5 text-2xl font-bold font-rounded">{currency.format(candidate.average_amount)}</p><div className="mt-4 flex items-center justify-between text-xs"><span className="text-zinc-400">Expected {candidate.next_expected_date}</span><span className="font-bold text-zinc-500">{Math.round(candidate.confidence * 100)}% match</span></div></article>) : <p className="col-span-full rounded-2xl bg-zinc-50 p-8 text-center text-sm text-zinc-400 dark:bg-zinc-800">No stable recurring pattern yet.</p>}</div>
                        </section>

                        <aside className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-900 dark:border-indigo-900/40 dark:bg-indigo-950/20 dark:text-indigo-200"><ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0" /><p><strong>How this works:</strong> totals are calculated from confirmed entries inside the selected dates. Comparisons use the immediately preceding range of equal length; anomaly and recurring rules are deterministic backend templates.</p></aside>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
