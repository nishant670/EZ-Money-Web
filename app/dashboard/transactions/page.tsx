"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
    CalendarRange,
    ChevronLeft,
    ChevronRight,
    CircleAlert,
    Download,
    Filter,
    Loader2,
    Plus,
    Search,
    Wallet,
} from "lucide-react";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import AddTransactionModal from "@/app/components/dashboard/AddTransactionModal";
import TransactionDetailsDrawer from "@/app/components/dashboard/TransactionDetailsDrawer";
import { Account, AccountsAPI, apiErrorMessage, EntriesAPI, EntryListParams, SplitBill, Transaction } from "@/app/lib/api";
import { formatDate, formatMoney, toLocalISO } from "@/app/lib/format";
import { cn } from "@/app/lib/utils";

type TransactionEditDraft = {
    transaction: Transaction;
    splitBill: SplitBill | null;
    splitDataAvailable: boolean;
};

export default function TransactionsScreen() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [exportError, setExportError] = useState("");
    const [isExporting, setIsExporting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [type, setType] = useState<"all" | "expense" | "income">("all");
    const [accountID, setAccountID] = useState<number | "">("");
    const [dateRange, setDateRange] = useState<"all" | "30d" | "month">("30d");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [editing, setEditing] = useState<TransactionEditDraft | null>(null);

    useEffect(() => {
        const query = new URLSearchParams(window.location.search).get("q");
        if (query) setSearchTerm(query);
        AccountsAPI.list().then((response) => setAccounts(response.data)).catch(() => setAccounts([]));
    }, []);

    const buildEntryParams = useCallback((includePagination: boolean) => {
        const params: EntryListParams = {};
        if (includePagination) {
            params.page = page;
            params.page_size = 25;
        }
        if (searchTerm.trim()) params.q = searchTerm.trim();
        if (type !== "all") params.type = type;
        if (accountID) params.account_id = accountID;
        if (dateRange !== "all") {
            const end = new Date(); const start = new Date(end);
            if (dateRange === "month") start.setDate(1); else start.setDate(end.getDate() - 29);
            params.start_date = toLocalISO(start); params.end_date = toLocalISO(end);
        }
        return params;
    }, [accountID, dateRange, page, searchTerm, type]);

    const loadTransactions = useCallback(async () => {
        setLoading(true); setError("");
        try {
            const response = await EntriesAPI.list(buildEntryParams(true));
            setTransactions(response.data.entries);
            setTotalPages(Math.max(1, response.data.total_pages));
            setTotal(response.data.total);
        } catch (requestError) {
            setError(apiErrorMessage(requestError, "We couldn’t load your transactions."));
        } finally { setLoading(false); }
    }, [buildEntryParams]);

    useEffect(() => { const timer = window.setTimeout(() => void loadTransactions(), 250); return () => window.clearTimeout(timer); }, [loadTransactions]);

    const exportCurrentView = async () => {
        setExportError(""); setIsExporting(true);
        try {
            const response = await EntriesAPI.exportCSV(buildEntryParams(false));
            const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: "text/csv;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `finnri-transactions-${toLocalISO()}.csv`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (requestError) {
            setExportError(apiErrorMessage(requestError, "We couldn’t export your transactions."));
        } finally { setIsExporting(false); }
    };

    const closeModal = () => { setIsModalOpen(false); setEditing(null); };
    const handleSaved = async (saved: Transaction) => {
        setTransactions((current) => current.map((item) => item.id === saved.id ? saved : item));
        await loadTransactions();
        if (editing) setSelectedTransaction(saved);
    };

    return <DashboardLayout><div className="space-y-6 pb-12"><header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Confirmed records</p><h1 className="mt-2 text-3xl font-bold tracking-tight font-rounded sm:text-4xl">Transactions</h1><p className="mt-2 text-sm text-zinc-500">Search, filter, inspect, add, edit, duplicate, or delete real entries.</p></div><div className="flex gap-3"><button onClick={() => void exportCurrentView()} disabled={isExporting} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-bold text-zinc-600 disabled:opacity-40 dark:bg-zinc-900 dark:text-zinc-300">{isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Export CSV</button><button onClick={() => { setEditing(null); setIsModalOpen(true); }} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-bold text-white shadow-lg shadow-accent/20"><Plus className="h-4 w-4" /> Add</button></div></header>
        <section className="rounded-[1.75rem] border border-border bg-white p-4 dark:bg-zinc-900"><div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]"><label className="relative"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" /><span className="sr-only">Search transactions</span><input value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setPage(1); }} placeholder="Merchant, title, or note…" className="min-h-11 w-full rounded-xl bg-zinc-100 pl-11 pr-4 text-sm outline-none focus:ring-4 focus:ring-accent/10 dark:bg-zinc-800" /></label><label className="relative"><Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" /><span className="sr-only">Transaction type</span><select value={type} onChange={(event) => { setType(event.target.value as typeof type); setPage(1); }} className="min-h-11 appearance-none rounded-xl bg-zinc-100 pl-10 pr-8 text-sm font-semibold outline-none dark:bg-zinc-800"><option value="all">All types</option><option value="expense">Expenses</option><option value="income">Income</option></select></label><label className="relative"><Wallet className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" /><span className="sr-only">Account</span><select value={accountID} onChange={(event) => { setAccountID(event.target.value ? Number(event.target.value) : ""); setPage(1); }} className="min-h-11 max-w-56 appearance-none rounded-xl bg-zinc-100 pl-10 pr-8 text-sm font-semibold outline-none dark:bg-zinc-800"><option value="">All accounts</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select></label><label className="relative"><CalendarRange className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" /><span className="sr-only">Date range</span><select value={dateRange} onChange={(event) => { setDateRange(event.target.value as typeof dateRange); setPage(1); }} className="min-h-11 appearance-none rounded-xl bg-zinc-100 pl-10 pr-8 text-sm font-semibold outline-none dark:bg-zinc-800"><option value="30d">Last 30 days</option><option value="month">This month</option><option value="all">All time</option></select></label></div></section>
        {exportError && <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300"><CircleAlert className="mt-0.5 h-5 w-5 shrink-0" /><p>{exportError}</p></div>}
        {error && <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300"><CircleAlert className="mt-0.5 h-5 w-5 shrink-0" /><div><p>{error}</p><button onClick={() => void loadTransactions()} className="mt-2 font-bold underline">Try again</button></div></div>}
        <section className="overflow-hidden rounded-[2rem] border border-border bg-white dark:bg-zinc-900"><div className="flex items-center justify-between border-b border-border px-6 py-4"><p className="text-sm font-bold">{total.toLocaleString("en-IN")} matching records</p><p className="text-xs text-zinc-400">Page {page} of {totalPages}</p></div><div className="overflow-x-auto"><table className="w-full min-w-[860px] text-left"><thead className="bg-zinc-50 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 dark:bg-zinc-800/60"><tr><th className="px-6 py-4">Date</th><th className="px-6 py-4">Merchant</th><th className="px-6 py-4">Category</th><th className="px-6 py-4">Account</th><th className="px-6 py-4 text-right">Amount</th></tr></thead><tbody className="divide-y divide-border">{loading ? <tr><td colSpan={5} className="h-72 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-accent" /><p className="mt-3 text-sm text-zinc-400">Loading transactions…</p></td></tr> : transactions.length === 0 ? <tr><td colSpan={5} className="h-72 text-center text-sm text-zinc-400">No transactions match these filters.</td></tr> : transactions.map((transaction) => <tr key={transaction.id} onClick={() => setSelectedTransaction(transaction)} className="cursor-pointer transition hover:bg-zinc-50 dark:hover:bg-zinc-800/40"><td className="px-6 py-4 text-sm text-zinc-500">{formatDate(transaction.date)}</td><td className="px-6 py-4"><p className="text-sm font-bold">{transaction.merchant || transaction.title}</p><p className="mt-0.5 text-xs capitalize text-zinc-400">{transaction.type}</p></td><td className="px-6 py-4 text-sm text-zinc-500">{transaction.category}</td><td className="px-6 py-4 text-sm text-zinc-500">{transaction.account?.name || transaction.mode}</td><td className={cn("px-6 py-4 text-right text-sm font-bold", transaction.type === "income" && "text-emerald-600")}>{transaction.type === "income" ? "+" : "−"}{formatMoney(transaction.amount)}</td></tr>)}</tbody></table></div><div className="flex items-center justify-end gap-2 border-t border-border p-4"><button disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)} className="grid h-10 w-10 place-items-center rounded-xl border border-border disabled:opacity-30" aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button><button disabled={page >= totalPages || loading} onClick={() => setPage((value) => value + 1)} className="grid h-10 w-10 place-items-center rounded-xl border border-border disabled:opacity-30" aria-label="Next page"><ChevronRight className="h-4 w-4" /></button></div></section>
    </div><AddTransactionModal isOpen={isModalOpen} onClose={closeModal} transaction={editing?.transaction} linkedSplitBill={editing?.splitBill} splitDataAvailable={editing?.splitDataAvailable} onSaved={handleSaved} /><TransactionDetailsDrawer isOpen={Boolean(selectedTransaction) && !isModalOpen} transaction={selectedTransaction} onEdit={(transaction, splitBill, splitDataAvailable) => { setEditing({ transaction, splitBill, splitDataAvailable }); setIsModalOpen(true); }} onClose={() => { setSelectedTransaction(null); void loadTransactions(); }} /></DashboardLayout>;
}
