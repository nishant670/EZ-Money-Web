"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
    ChevronLeft,
    ChevronRight,
    CircleAlert,
    Download,
    Loader2,
    Plus,
} from "lucide-react";
import AddTransactionModal from "@/app/components/dashboard/AddTransactionModal";
import TransactionDetailsDrawer from "@/app/components/dashboard/TransactionDetailsDrawer";
import { TransactionFilterPanel, useTransactionFilters } from "@/app/components/dashboard/TransactionFilters";
import { Account, AccountsAPI, apiErrorMessage, EntriesAPI, SplitBill, Transaction } from "@/app/lib/api";
import { formatDate, formatMoney } from "@/app/lib/format";
import { downloadTransactionsCSV } from "@/app/lib/export-transactions";
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
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [editing, setEditing] = useState<TransactionEditDraft | null>(null);
    const filterController = useTransactionFilters("30d");
    const { filters, entryParams, amountError, dateError, update } = filterController;

    useEffect(() => {
        AccountsAPI.list().then((response) => setAccounts(response.data)).catch(() => setAccounts([]));
    }, []);

    const loadTransactions = useCallback(async () => {
        setLoading(true); setError("");
        if (amountError || dateError) {
            setError(amountError || dateError);
            setLoading(false);
            return;
        }
        try {
            const response = await EntriesAPI.list(entryParams(true));
            setTransactions(response.data.entries);
            setTotalPages(Math.max(1, response.data.total_pages));
            setTotal(response.data.total);
        } catch (requestError) {
            setError(apiErrorMessage(requestError, "We couldn’t load your transactions."));
        } finally { setLoading(false); }
    }, [amountError, dateError, entryParams]);

    useEffect(() => { const timer = window.setTimeout(() => void loadTransactions(), 250); return () => window.clearTimeout(timer); }, [loadTransactions]);

    const exportCurrentView = async () => {
        setExportError(""); setIsExporting(true);
        try {
            await downloadTransactionsCSV(entryParams(false));
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

    return <><div className="space-y-6 pb-12"><header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Confirmed records</p><h1 className="mt-2 text-3xl font-bold tracking-tight font-rounded sm:text-4xl">Transactions</h1><p className="mt-2 text-sm text-zinc-500">Search, filter, inspect, add, edit, duplicate, or delete real entries.</p></div><div className="flex gap-3"><button onClick={() => void exportCurrentView()} disabled={isExporting} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-bold text-zinc-600 disabled:opacity-40 dark:bg-zinc-900 dark:text-zinc-300">{isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Export CSV</button><button onClick={() => { setEditing(null); setIsModalOpen(true); }} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-bold text-white shadow-lg shadow-accent/20"><Plus className="h-4 w-4" /> Add</button></div></header>
        <TransactionFilterPanel controller={filterController} accounts={accounts} searchLabel="Search transactions" />
        {exportError && <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300"><CircleAlert className="mt-0.5 h-5 w-5 shrink-0" /><p>{exportError}</p></div>}
        {error && <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300"><CircleAlert className="mt-0.5 h-5 w-5 shrink-0" /><div><p>{error}</p><button onClick={() => void loadTransactions()} className="mt-2 font-bold underline">Try again</button></div></div>}
        <section className="overflow-hidden rounded-[2rem] border border-border bg-white dark:bg-zinc-900"><div className="flex items-center justify-between border-b border-border px-6 py-4"><p className="text-sm font-bold">{total.toLocaleString("en-IN")} matching records</p><p className="text-xs text-zinc-400">Page {filters.page} of {totalPages}</p></div><div className="overflow-x-auto"><table className="w-full min-w-[860px] text-left"><thead className="bg-zinc-50 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 dark:bg-zinc-800/60"><tr><th className="px-6 py-4">Date</th><th className="px-6 py-4">Merchant</th><th className="px-6 py-4">Category</th><th className="px-6 py-4">Account</th><th className="px-6 py-4 text-right">Amount</th></tr></thead><tbody className="divide-y divide-border">{loading ? <tr><td colSpan={5} className="h-72 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-accent" /><p className="mt-3 text-sm text-zinc-400">Loading transactions…</p></td></tr> : transactions.length === 0 ? <tr><td colSpan={5} className="h-72 text-center text-sm text-zinc-400">No transactions match these filters.</td></tr> : transactions.map((transaction) => <tr key={transaction.id} onClick={() => setSelectedTransaction(transaction)} className="cursor-pointer transition hover:bg-zinc-50 dark:hover:bg-zinc-800/40"><td className="px-6 py-4 text-sm text-zinc-500">{formatDate(transaction.date)}</td><td className="px-6 py-4"><p className="text-sm font-bold">{transaction.merchant || transaction.title}</p><p className="mt-0.5 text-xs capitalize text-zinc-400">{transaction.type}</p></td><td className="px-6 py-4 text-sm text-zinc-500">{transaction.category}</td><td className="px-6 py-4 text-sm text-zinc-500">{transaction.account?.name || transaction.mode}</td><td className={cn("px-6 py-4 text-right text-sm font-bold", transaction.type === "income" && "text-emerald-600")}>{transaction.type === "income" ? "+" : "−"}{formatMoney(transaction.amount)}</td></tr>)}</tbody></table></div><div className="flex items-center justify-end gap-2 border-t border-border p-4"><button disabled={filters.page <= 1 || loading} onClick={() => update({ page: filters.page - 1 })} className="grid h-10 w-10 place-items-center rounded-xl border border-border disabled:opacity-30" aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button><button disabled={filters.page >= totalPages || loading} onClick={() => update({ page: filters.page + 1 })} className="grid h-10 w-10 place-items-center rounded-xl border border-border disabled:opacity-30" aria-label="Next page"><ChevronRight className="h-4 w-4" /></button></div></section>
    </div><AddTransactionModal isOpen={isModalOpen} onClose={closeModal} transaction={editing?.transaction} linkedSplitBill={editing?.splitBill} splitDataAvailable={editing?.splitDataAvailable} onSaved={handleSaved} /><TransactionDetailsDrawer isOpen={Boolean(selectedTransaction) && !isModalOpen} transaction={selectedTransaction} onEdit={(transaction, splitBill, splitDataAvailable) => { setEditing({ transaction, splitBill, splitDataAvailable }); setIsModalOpen(true); }} onClose={() => setSelectedTransaction(null)} onChanged={() => { void loadTransactions(); }} /></>;
}
