"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ArrowDownRight,
    ArrowUpRight,
    CalendarRange,
    CircleAlert,
    Filter,
    IndianRupee,
    Landmark,
    Loader2,
    RefreshCw,
    Search,
    Store,
    Tags,
    Wallet,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import { Account, AccountsAPI, apiErrorMessage, EntryListParams, ReportsAPI, TransactionReportResponse } from "@/app/lib/api";
import { formatMoney, toLocalISO } from "@/app/lib/format";
import { cn } from "@/app/lib/utils";

function rangeFor(preset: "month" | "30d" | "90d" | "all") {
    if (preset === "all") return {};
    const end = new Date();
    const start = new Date(end);
    if (preset === "month") start.setDate(1);
    if (preset === "30d") start.setDate(end.getDate() - 29);
    if (preset === "90d") start.setDate(end.getDate() - 89);
    return { start_date: toLocalISO(start), end_date: toLocalISO(end) };
}

function EmptyPanel({ label }: { label: string }) {
    return <div className="grid min-h-52 place-items-center rounded-2xl bg-zinc-50 p-6 text-center text-sm font-semibold text-zinc-400 dark:bg-zinc-800">{label}</div>;
}

export default function ReportsScreen() {
    const [report, setReport] = useState<TransactionReportResponse | null>(null);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [type, setType] = useState<"all" | "expense" | "income">("all");
    const [accountID, setAccountID] = useState<number | "">("");
    const [dateRange, setDateRange] = useState<"month" | "30d" | "90d" | "all">("90d");

    useEffect(() => {
        AccountsAPI.list().then((response) => setAccounts(response.data)).catch(() => setAccounts([]));
    }, []);

    const buildReportParams = useCallback(() => {
        const params: EntryListParams = {};
        if (searchTerm.trim()) params.q = searchTerm.trim();
        if (type !== "all") params.type = type;
        if (accountID) params.account_id = accountID;
        Object.assign(params, rangeFor(dateRange));
        return params;
    }, [accountID, dateRange, searchTerm, type]);

    const loadReport = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await ReportsAPI.transactionSummary(buildReportParams());
            setReport(response.data);
        } catch (requestError) {
            setError(apiErrorMessage(requestError, "We couldn’t load transaction reports."));
        } finally {
            setLoading(false);
        }
    }, [buildReportParams]);

    useEffect(() => {
        const timer = window.setTimeout(() => void loadReport(), 250);
        return () => window.clearTimeout(timer);
    }, [loadReport]);

    const categoryChart = useMemo(() => report?.by_category.map((item) => ({
        name: item.label,
        amount: item.amount,
        percentage: item.percentage,
    })) || [], [report]);
    const monthChart = useMemo(() => report?.by_month.map((item) => ({
        month: item.month,
        expense: item.expense,
        income: item.income,
        net: item.net_cashflow,
    })) || [], [report]);
    const hasData = Boolean(report?.summary.transaction_count);

    return (
        <DashboardLayout>
            <div className="space-y-7 pb-12">
                <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Advanced reports</p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight font-rounded sm:text-4xl">Transaction reports</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">Filter confirmed records and compare totals by category, merchant, account, month, and type.</p>
                    </div>
                    <button onClick={() => void loadReport()} className="inline-flex min-h-11 items-center gap-2 self-start rounded-xl border border-border bg-white px-4 text-sm font-bold text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /> Refresh
                    </button>
                </header>

                <section className="rounded-[1.75rem] border border-border bg-white p-4 dark:bg-zinc-900">
                    <div className="grid gap-3 xl:grid-cols-[1fr_auto_auto_auto]">
                        <label className="relative">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                            <span className="sr-only">Search reports</span>
                            <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Merchant, title, or note..." className="min-h-11 w-full rounded-xl bg-zinc-100 pl-11 pr-4 text-sm outline-none focus:ring-4 focus:ring-accent/10 dark:bg-zinc-800" />
                        </label>
                        <label className="relative">
                            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                            <span className="sr-only">Transaction type</span>
                            <select value={type} onChange={(event) => setType(event.target.value as typeof type)} className="min-h-11 appearance-none rounded-xl bg-zinc-100 pl-10 pr-8 text-sm font-semibold outline-none dark:bg-zinc-800">
                                <option value="all">All types</option>
                                <option value="expense">Expenses</option>
                                <option value="income">Income</option>
                            </select>
                        </label>
                        <label className="relative">
                            <Wallet className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                            <span className="sr-only">Account</span>
                            <select value={accountID} onChange={(event) => setAccountID(event.target.value ? Number(event.target.value) : "")} className="min-h-11 max-w-56 appearance-none rounded-xl bg-zinc-100 pl-10 pr-8 text-sm font-semibold outline-none dark:bg-zinc-800">
                                <option value="">All accounts</option>
                                {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
                            </select>
                        </label>
                        <label className="relative">
                            <CalendarRange className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                            <span className="sr-only">Date range</span>
                            <select value={dateRange} onChange={(event) => setDateRange(event.target.value as typeof dateRange)} className="min-h-11 appearance-none rounded-xl bg-zinc-100 pl-10 pr-8 text-sm font-semibold outline-none dark:bg-zinc-800">
                                <option value="month">This month</option>
                                <option value="30d">Last 30 days</option>
                                <option value="90d">Last 90 days</option>
                                <option value="all">All time</option>
                            </select>
                        </label>
                    </div>
                </section>

                {loading ? (
                    <div className="grid min-h-[520px] place-items-center rounded-[2rem] border border-border bg-white dark:bg-zinc-900">
                        <div className="text-center"><Loader2 className="mx-auto mb-3 h-7 w-7 animate-spin text-accent" /><p className="text-sm font-semibold text-zinc-400">Building report rollups...</p></div>
                    </div>
                ) : error ? (
                    <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 dark:border-red-900/40 dark:bg-red-950/20"><CircleAlert className="h-6 w-6 text-red-500" /><h2 className="mt-4 text-lg font-bold">Reports unavailable</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-red-700/70 dark:text-red-300/70">{error}</p><button onClick={() => void loadReport()} className="mt-5 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white">Try again</button></div>
                ) : report && (
                    <>
                        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {[
                                { label: "Expense", value: formatMoney(report.summary.total_expense), detail: `${report.summary.expense_count} expense records`, icon: ArrowDownRight, tone: "text-rose-600 bg-rose-50 dark:bg-rose-950/30" },
                                { label: "Income", value: formatMoney(report.summary.total_income), detail: `${report.summary.income_count} income records`, icon: ArrowUpRight, tone: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" },
                                { label: "Net cash flow", value: formatMoney(report.summary.net_cashflow), detail: report.summary.net_cashflow >= 0 ? "Income above expense" : "Expense above income", icon: Landmark, tone: "text-accent bg-accent/10" },
                                { label: "Records", value: report.summary.transaction_count.toLocaleString("en-IN"), detail: "Matching filters", icon: IndianRupee, tone: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30" },
                            ].map((card) => (
                                <article key={card.label} className="rounded-[1.75rem] border border-border bg-white p-6 shadow-sm dark:bg-zinc-900">
                                    <div className={cn("grid h-11 w-11 place-items-center rounded-2xl", card.tone)}><card.icon className="h-5 w-5" /></div>
                                    <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">{card.label}</p>
                                    <p className="mt-2 break-words text-2xl font-bold tracking-tight font-rounded">{card.value}</p>
                                    <p className="mt-1 text-xs text-zinc-500">{card.detail}</p>
                                </article>
                            ))}
                        </section>

                        {!hasData ? (
                            <EmptyPanel label="No confirmed transactions match these report filters." />
                        ) : (
                            <>
                                <section className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
                                    <div className="rounded-[2rem] border border-border bg-white p-6 dark:bg-zinc-900 sm:p-8">
                                        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent"><Tags className="h-4 w-4" /></span><div><h2 className="font-bold font-rounded">Category mix</h2><p className="text-xs text-zinc-400">Expense distribution by category</p></div></div>
                                        <div className="mt-7 h-[320px] min-w-0">
                                            {categoryChart.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={categoryChart} layout="vertical" margin={{ left: 8, right: 8 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" /><XAxis type="number" hide /><YAxis dataKey="name" type="category" width={116} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#71717a" }} /><Tooltip formatter={(value) => formatMoney(Number(value))} cursor={{ fill: "rgba(255,136,101,.06)" }} contentStyle={{ borderRadius: 16, border: "1px solid #f0e5e7" }} /><Bar dataKey="amount" fill="#FF8865" radius={[0, 8, 8, 0]} barSize={24} /></BarChart></ResponsiveContainer> : <EmptyPanel label="No expense categories in this range." />}
                                        </div>
                                    </div>
                                    <div className="rounded-[2rem] border border-border bg-white p-6 dark:bg-zinc-900 sm:p-8">
                                        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30"><Store className="h-4 w-4" /></span><div><h2 className="font-bold font-rounded">Top merchants</h2><p className="text-xs text-zinc-400">Largest expense merchants</p></div></div>
                                        <div className="mt-6 space-y-2">{report.by_merchant.length ? report.by_merchant.slice(0, 6).map((merchant, index) => <div key={merchant.key} className="flex items-center gap-3 rounded-2xl bg-zinc-50 p-3 dark:bg-zinc-800"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-xs font-bold text-zinc-500 dark:bg-zinc-900">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{merchant.label}</p><p className="text-xs text-zinc-400">{merchant.transaction_count} records</p></div><p className="text-sm font-bold">{formatMoney(merchant.amount)}</p></div>) : <EmptyPanel label="No merchant spending in this range." />}</div>
                                    </div>
                                </section>

                                <section className="grid gap-6 xl:grid-cols-2">
                                    <div className="rounded-[2rem] border border-border bg-white p-6 dark:bg-zinc-900 sm:p-8">
                                        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30"><CalendarRange className="h-4 w-4" /></span><div><h2 className="font-bold font-rounded">Monthly trend</h2><p className="text-xs text-zinc-400">Expense and income over time</p></div></div>
                                        <div className="mt-7 h-[300px] min-w-0">
                                            {monthChart.length ? <ResponsiveContainer width="100%" height="100%"><LineChart data={monthChart} margin={{ left: 4, right: 12, top: 8, bottom: 4 }}><CartesianGrid vertical={false} stroke="#eee" strokeDasharray="3 3" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#71717a" }} /><YAxis hide /><Tooltip formatter={(value) => formatMoney(Number(value))} contentStyle={{ borderRadius: 16, border: "1px solid #f0e5e7" }} /><Line type="monotone" dataKey="expense" stroke="#FF8865" strokeWidth={3} dot={{ r: 3 }} /><Line type="monotone" dataKey="income" stroke="#16a34a" strokeWidth={3} dot={{ r: 3 }} /></LineChart></ResponsiveContainer> : <EmptyPanel label="Monthly trend appears after dated records." />}
                                        </div>
                                    </div>
                                    <div className="rounded-[2rem] border border-border bg-white p-6 dark:bg-zinc-900 sm:p-8">
                                        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent"><Wallet className="h-4 w-4" /></span><div><h2 className="font-bold font-rounded">Account usage</h2><p className="text-xs text-zinc-400">Expense totals by payment source</p></div></div>
                                        <div className="mt-6 divide-y divide-border">{report.by_account.length ? report.by_account.map((account) => <div key={`${account.account_id}-${account.account_name}`} className="flex min-h-16 items-center gap-4 py-3"><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{account.account_name}</p><p className="text-xs text-zinc-400">{account.transaction_count} records · {account.percentage.toFixed(1)}%</p></div><p className="text-sm font-bold">{formatMoney(account.amount)}</p></div>) : <EmptyPanel label="No account spending in this range." />}</div>
                                    </div>
                                </section>
                            </>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
