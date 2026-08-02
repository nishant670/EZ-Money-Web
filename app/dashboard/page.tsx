"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowRight,
    ArrowUpRight,
    CalendarDays,
    CircleAlert,
    IndianRupee,
    Lightbulb,
    ListChecks,
    Loader2,
    Plus,
    RefreshCw,
    Sparkles,
    TrendingDown,
    TrendingUp,
    WalletCards,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import AddTransactionModal from "@/app/components/dashboard/AddTransactionModal";
import TransactionDetailsDrawer from "@/app/components/dashboard/TransactionDetailsDrawer";
import { apiErrorMessage, DashboardAPI, DashboardResponse, Transaction } from "@/app/lib/api";
import { cn } from "@/app/lib/utils";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

function isoDate(date: Date) {
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function rangeFor(preset: "month" | "30d" | "90d") {
    const end = new Date();
    const start = new Date(end);
    if (preset === "month") start.setDate(1);
    if (preset === "30d") start.setDate(end.getDate() - 29);
    if (preset === "90d") start.setDate(end.getDate() - 89);
    return { start_date: isoDate(start), end_date: isoDate(end), tz: Intl.DateTimeFormat().resolvedOptions().timeZone };
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
    return (
        <div className="rounded-[2rem] border border-dashed border-accent/30 bg-gradient-to-br from-white to-accent/5 p-10 text-center dark:from-zinc-900 dark:to-accent/5">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent/10 text-accent"><Sparkles className="h-6 w-6" /></span>
            <h2 className="mt-5 text-xl font-bold font-rounded">Your first insight starts with one transaction</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">Add an expense or income. Finnri will turn it into category, account, merchant, and period-level insight automatically.</p>
            <button onClick={onAdd} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white shadow-lg shadow-accent/20"><Plus className="h-4 w-4" /> Add a transaction</button>
        </div>
    );
}

export default function DashboardHome() {
    const [preset, setPreset] = useState<"month" | "30d" | "90d">("month");
    const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await DashboardAPI.get(rangeFor(preset));
            setDashboard(response.data);
        } catch (requestError) {
            setError(apiErrorMessage(requestError, "We couldn’t load your dashboard. Check that the FINNRI API is running, then try again."));
        } finally {
            setLoading(false);
        }
    }, [preset]);

    useEffect(() => { void loadDashboard(); }, [loadDashboard]);

    const net = (dashboard?.summary.total_income || 0) - (dashboard?.summary.total_spent || 0);
    const topInsight = dashboard?.insights.find((item) => item.severity === "warning") || dashboard?.insights[0];
    const hasData = Boolean(dashboard?.summary.transaction_count);
    const chartData = useMemo(() => dashboard?.top_categories.map((item) => ({ name: item.category, amount: item.amount })) || [], [dashboard]);

    return (
        <DashboardLayout>
            <div className="space-y-7 pb-12">
                <section className="relative overflow-hidden rounded-[2rem] bg-zinc-950 p-6 text-white shadow-2xl shadow-zinc-900/10 sm:p-8 lg:p-10">
                    <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
                    <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
                        <div className="max-w-2xl">
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/70"><CalendarDays className="h-3.5 w-3.5 text-accent" /> {dashboard ? `${dashboard.period.start} — ${dashboard.period.end}` : "Your money, in context"}</div>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Financial overview</p>
                            <h1 className="mt-3 max-w-xl text-3xl font-bold tracking-tight font-rounded sm:text-4xl lg:text-5xl">See what changed, then decide what matters.</h1>
                            <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-400 sm:text-base">Live totals, grounded insights, recurring patterns, and planning tools—built from your confirmed FINNRI data.</p>
                        </div>
                        <button onClick={() => setIsModalOpen(true)} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-accent px-6 py-3 text-sm font-bold text-white shadow-xl shadow-accent/20 hover:bg-[#ff7953]"><Plus className="h-5 w-5" /> Add transaction</button>
                    </div>
                </section>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex w-fit rounded-xl border border-border bg-white p-1 dark:bg-zinc-900" aria-label="Dashboard period">
                        {([['month', 'This month'], ['30d', '30 days'], ['90d', '90 days']] as const).map(([value, label]) => (
                            <button key={value} onClick={() => setPreset(value)} className={cn("min-h-10 rounded-lg px-4 text-xs font-bold transition", preset === value ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white")}>{label}</button>
                        ))}
                    </div>
                    <button onClick={() => void loadDashboard()} className="inline-flex min-h-11 items-center gap-2 self-start rounded-xl px-3 text-xs font-bold text-zinc-500 hover:bg-white dark:hover:bg-zinc-900"><RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /> Refresh</button>
                </div>

                {loading ? (
                    <div className="grid min-h-[420px] place-items-center rounded-[2rem] border border-border bg-white dark:bg-zinc-900"><div className="text-center text-zinc-400"><Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-accent" /><p className="text-sm font-semibold">Calculating your latest view…</p></div></div>
                ) : error ? (
                    <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 dark:border-red-900/40 dark:bg-red-950/20"><CircleAlert className="h-6 w-6 text-red-500" /><h2 className="mt-4 text-lg font-bold">Dashboard unavailable</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-red-700/70 dark:text-red-300/70">{error}</p><button onClick={() => void loadDashboard()} className="mt-5 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white">Try again</button></div>
                ) : !hasData ? <EmptyState onAdd={() => setIsModalOpen(true)} /> : dashboard && (
                    <>
                        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {[
                                { label: "Spent", value: currency.format(dashboard.summary.total_spent), detail: `${dashboard.summary.transaction_count} transactions`, icon: TrendingDown, tone: "text-rose-600 bg-rose-50 dark:bg-rose-950/30" },
                                { label: "Income", value: currency.format(dashboard.summary.total_income), detail: "Confirmed income", icon: TrendingUp, tone: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" },
                                { label: "Net cash flow", value: currency.format(net), detail: net >= 0 ? "Positive for this period" : "Spending is above income", icon: WalletCards, tone: "text-accent bg-accent/10" },
                                { label: "Daily average", value: currency.format(dashboard.summary.daily_average), detail: "Expense pace", icon: IndianRupee, tone: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30" },
                            ].map((card) => <article key={card.label} className="rounded-[1.75rem] border border-border bg-white p-6 shadow-sm dark:bg-zinc-900"><div className={cn("grid h-11 w-11 place-items-center rounded-2xl", card.tone)}><card.icon className="h-5 w-5" /></div><p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">{card.label}</p><p className="mt-2 text-2xl font-bold tracking-tight font-rounded">{card.value}</p><p className="mt-1 text-xs text-zinc-500">{card.detail}</p></article>)}
                        </section>

                        {topInsight && (
                            <section className="grid gap-6 overflow-hidden rounded-[2rem] border border-accent/20 bg-gradient-to-r from-accent/10 via-white to-white p-6 dark:via-zinc-900 dark:to-zinc-900 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
                                <div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent text-white"><Lightbulb className="h-5 w-5" /></span><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Worth noticing</p><h2 className="mt-2 text-xl font-bold font-rounded">{topInsight.title}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">{topInsight.body}</p></div></div>
                                <Link href="/dashboard/insights" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-accent/20 bg-white px-5 text-sm font-bold text-accent dark:bg-zinc-950">Explore all insights <ArrowRight className="h-4 w-4" /></Link>
                            </section>
                        )}

                        <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
                            <div className="rounded-[2rem] border border-border bg-white p-6 dark:bg-zinc-900 sm:p-8">
                                <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">Spending mix</p><h2 className="mt-2 text-xl font-bold font-rounded">Top categories</h2></div>
                                <div className="mt-7 h-[300px] min-w-0">
                                    <ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} layout="vertical" margin={{ left: 4, right: 8 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" /><XAxis type="number" hide /><YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#71717a" }} /><Tooltip formatter={(value) => currency.format(Number(value))} cursor={{ fill: "rgba(255,136,101,.06)" }} contentStyle={{ borderRadius: 16, border: "1px solid #f0e5e7" }} /><Bar dataKey="amount" fill="#FF8865" radius={[0, 8, 8, 0]} barSize={24} /></BarChart></ResponsiveContainer>
                                </div>
                            </div>
                            <div className="rounded-[2rem] border border-border bg-white p-6 dark:bg-zinc-900 sm:p-8">
                                <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">Where it went</p><h2 className="mt-2 text-xl font-bold font-rounded">Top merchants</h2></div><ListChecks className="h-5 w-5 text-accent" /></div>
                                <div className="mt-6 space-y-2">{dashboard.top_merchants.length ? dashboard.top_merchants.map((merchant, index) => <div key={merchant.merchant} className="flex items-center gap-3 rounded-2xl p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800"><span className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-100 text-xs font-bold text-zinc-500 dark:bg-zinc-800">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{merchant.merchant}</p><p className="text-xs text-zinc-400">{merchant.transaction_count} transaction{merchant.transaction_count === 1 ? "" : "s"}</p></div><p className="text-sm font-bold">{currency.format(merchant.amount)}</p></div>) : <p className="py-12 text-center text-sm text-zinc-400">Merchant details will appear here.</p>}</div>
                            </div>
                        </section>

                        <section className="rounded-[2rem] border border-border bg-white p-6 dark:bg-zinc-900 sm:p-8">
                            <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">Latest activity</p><h2 className="mt-2 text-xl font-bold font-rounded">Recent transactions</h2></div><Link href="/dashboard/transactions" className="inline-flex items-center gap-1 text-xs font-bold text-accent">View all <ArrowUpRight className="h-4 w-4" /></Link></div>
                            <div className="mt-6 divide-y divide-border">{dashboard.recent_transactions.map((transaction) => <button key={transaction.id} onClick={() => setSelectedTransaction(transaction)} className="flex min-h-16 w-full items-center gap-4 py-3 text-left"><span className="grid h-10 w-10 place-items-center rounded-xl bg-zinc-100 text-sm font-bold text-zinc-500 dark:bg-zinc-800">{(transaction.merchant || transaction.title || "?").slice(0, 1).toUpperCase()}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{transaction.merchant || transaction.title}</p><p className="truncate text-xs text-zinc-400">{transaction.category} · {transaction.account?.name || transaction.mode}</p></div><div className="text-right"><p className={cn("text-sm font-bold", transaction.type === "income" ? "text-emerald-600" : "text-zinc-900 dark:text-white")}>{transaction.type === "income" ? "+" : "−"}{currency.format(transaction.amount)}</p><p className="text-xs text-zinc-400">{transaction.date}</p></div></button>)}</div>
                        </section>
                    </>
                )}
            </div>
            <AddTransactionModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); void loadDashboard(); }} />
            <TransactionDetailsDrawer isOpen={Boolean(selectedTransaction)} onClose={() => { setSelectedTransaction(null); void loadDashboard(); }} transaction={selectedTransaction} />
        </DashboardLayout>
    );
}
