"use client";

import React, { FormEvent, useCallback, useEffect, useState } from "react";
import {
    Banknote,
    Building2,
    CircleAlert,
    CreditCard,
    Loader2,
    Pencil,
    Plus,
    ShieldCheck,
    Smartphone,
    Star,
    Trash2,
    WalletCards,
    X,
} from "lucide-react";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import { Account, AccountInput, AccountsAPI, apiErrorMessage } from "@/app/lib/api";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const ACCOUNT_TYPES: Array<{ value: Account["type"]; label: string }> = [
    { value: "cash", label: "Cash" }, { value: "upi", label: "UPI" }, { value: "bank", label: "Bank account" },
    { value: "credit_card", label: "Credit card" }, { value: "debit_card", label: "Debit card" }, { value: "wallet", label: "Wallet" }, { value: "other", label: "Other" },
];

const emptyForm: AccountInput = { type: "cash", name: "", color: "#FF8865", provider: "", identifier: "", credit_limit: 0, due_day: 0, fee_month: "", balance: 0, is_default: false };

function accountIcon(type: Account["type"]) {
    if (type === "cash") return Banknote;
    if (type === "upi") return Smartphone;
    if (type === "bank") return Building2;
    if (type === "credit_card" || type === "debit_card") return CreditCard;
    return WalletCards;
}

function accountLabel(type: Account["type"]) {
    return ACCOUNT_TYPES.find((item) => item.value === type)?.label || "Account";
}

function AccountDialog({ account, onClose, onSaved }: { account: Account | null; onClose: () => void; onSaved: () => void }) {
    const [form, setForm] = useState<AccountInput>(account ? {
        type: account.type, name: account.name, color: account.color || "#FF8865", provider: account.provider,
        identifier: account.identifier, credit_limit: account.credit_limit, due_day: account.due_day,
        fee_month: account.fee_month, balance: account.balance, is_default: account.is_default,
    } : emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        setSaving(true); setError("");
        try {
            if (account) await AccountsAPI.update(account.id, form);
            else await AccountsAPI.create(form);
            onSaved();
        } catch (requestError) {
            setError(apiErrorMessage(requestError, "We couldn’t save this account."));
        } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-zinc-950/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="account-dialog-title">
            <form onSubmit={submit} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-border bg-white shadow-2xl dark:bg-zinc-900">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white/95 p-6 backdrop-blur dark:bg-zinc-900/95"><div><h2 id="account-dialog-title" className="text-xl font-bold font-rounded">{account ? "Edit account" : "Add an account"}</h2><p className="mt-1 text-xs text-zinc-400">FINNRI tracks accounts manually; it does not connect to your bank.</p></div><button type="button" onClick={onClose} className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Close"><X className="h-5 w-5" /></button></div>
                <div className="grid gap-5 p-6 sm:grid-cols-2">
                    <label className="space-y-2"><span className="text-xs font-bold text-zinc-500">Account name</span><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Salary account" className="w-full rounded-xl border border-border bg-zinc-50 px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-accent/10 dark:bg-zinc-800" /></label>
                    <label className="space-y-2"><span className="text-xs font-bold text-zinc-500">Type</span><select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as Account["type"] })} className="w-full rounded-xl border border-border bg-zinc-50 px-4 py-3 text-sm outline-none dark:bg-zinc-800">{ACCOUNT_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></label>
                    <label className="space-y-2"><span className="text-xs font-bold text-zinc-500">Provider or bank</span><input value={form.provider} onChange={(event) => setForm({ ...form, provider: event.target.value })} placeholder="Optional" className="w-full rounded-xl border border-border bg-zinc-50 px-4 py-3 text-sm outline-none dark:bg-zinc-800" /></label>
                    <label className="space-y-2"><span className="text-xs font-bold text-zinc-500">Identifier</span><input value={form.identifier} onChange={(event) => setForm({ ...form, identifier: event.target.value })} placeholder="Last 4 digits or UPI ID" className="w-full rounded-xl border border-border bg-zinc-50 px-4 py-3 text-sm outline-none dark:bg-zinc-800" /></label>
                    <label className="space-y-2"><span className="text-xs font-bold text-zinc-500">Current balance</span><input type="number" step="0.01" value={form.balance} onChange={(event) => setForm({ ...form, balance: Number(event.target.value) })} className="w-full rounded-xl border border-border bg-zinc-50 px-4 py-3 text-sm outline-none dark:bg-zinc-800" /></label>
                    {(form.type === "credit_card") && <><label className="space-y-2"><span className="text-xs font-bold text-zinc-500">Credit limit</span><input type="number" min="0" step="0.01" value={form.credit_limit} onChange={(event) => setForm({ ...form, credit_limit: Number(event.target.value) })} className="w-full rounded-xl border border-border bg-zinc-50 px-4 py-3 text-sm outline-none dark:bg-zinc-800" /></label><label className="space-y-2"><span className="text-xs font-bold text-zinc-500">Due day</span><input type="number" min="0" max="31" value={form.due_day} onChange={(event) => setForm({ ...form, due_day: Number(event.target.value) })} className="w-full rounded-xl border border-border bg-zinc-50 px-4 py-3 text-sm outline-none dark:bg-zinc-800" /></label></>}
                    <label className="flex items-center gap-3 rounded-xl border border-border p-4 sm:col-span-2"><input type="checkbox" checked={form.is_default} disabled={account?.is_default} onChange={(event) => setForm({ ...form, is_default: event.target.checked })} className="h-4 w-4 accent-[#FF8865]" /><span><span className="block text-sm font-bold">Use as default account</span><span className="block text-xs text-zinc-400">Selected first when adding a transaction.</span></span></label>
                    {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 sm:col-span-2">{error}</p>}
                </div>
                <div className="sticky bottom-0 flex justify-end gap-3 border-t border-border bg-white/95 p-5 backdrop-blur dark:bg-zinc-900/95"><button type="button" onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm font-bold text-zinc-500">Cancel</button><button disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-6 text-sm font-bold text-white disabled:opacity-60">{saving && <Loader2 className="h-4 w-4 animate-spin" />}{account ? "Save changes" : "Add account"}</button></div>
            </form>
        </div>
    );
}

export default function AccountsScreen() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingAccount, setEditingAccount] = useState<Account | null | undefined>(undefined);

    const loadAccounts = useCallback(async () => {
        setLoading(true); setError("");
        try { const response = await AccountsAPI.list(); setAccounts(response.data); }
        catch (requestError) { setError(apiErrorMessage(requestError, "We couldn’t load your accounts.")); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { void loadAccounts(); }, [loadAccounts]);

    const deleteAccount = async (account: Account) => {
        if (!window.confirm(`Delete ${account.name}? This is only possible when no transactions use it.`)) return;
        try { await AccountsAPI.delete(account.id); await loadAccounts(); }
        catch (requestError) { setError(apiErrorMessage(requestError, "We couldn’t delete this account.")); }
    };

    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

    return (
        <DashboardLayout>
            <div className="space-y-7 pb-12">
                <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Payment sources</p><h1 className="mt-2 text-3xl font-bold tracking-tight font-rounded sm:text-4xl">Accounts that match your real records.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">Use accounts to explain where spending happened. Balances are manually maintained and never presented as bank-synced.</p></div><button onClick={() => setEditingAccount(null)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-accent px-6 text-sm font-bold text-white shadow-lg shadow-accent/20"><Plus className="h-5 w-5" /> Add account</button></header>

                <section className="grid gap-4 md:grid-cols-3"><article className="rounded-[1.75rem] bg-zinc-950 p-6 text-white md:col-span-2"><p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Manually recorded balance</p><p className="mt-3 text-4xl font-bold font-rounded">{currency.format(totalBalance)}</p><p className="mt-3 text-xs text-zinc-400">Across {accounts.length} account{accounts.length === 1 ? "" : "s"}; informational only.</p></article><article className="rounded-[1.75rem] border border-border bg-white p-6 dark:bg-zinc-900"><ShieldCheck className="h-6 w-6 text-accent" /><h2 className="mt-4 font-bold">No bank connection</h2><p className="mt-2 text-sm leading-6 text-zinc-500">FINNRI stores the labels and balances you enter. It does not claim automatic synchronization.</p></article></section>

                {error && <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300"><CircleAlert className="mt-0.5 h-5 w-5 shrink-0" /><div className="flex-1"><p>{error}</p><button onClick={() => void loadAccounts()} className="mt-2 font-bold underline">Try again</button></div></div>}

                {loading ? <div className="grid min-h-80 place-items-center rounded-[2rem] border border-border bg-white dark:bg-zinc-900"><Loader2 className="h-7 w-7 animate-spin text-accent" /></div> : accounts.length === 0 ? <div className="rounded-[2rem] border border-dashed border-border p-12 text-center"><WalletCards className="mx-auto h-8 w-8 text-zinc-300" /><h2 className="mt-4 text-lg font-bold">No accounts yet</h2><p className="mt-2 text-sm text-zinc-500">Add cash, UPI, bank, card, or wallet sources.</p></div> : (
                    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{accounts.map((account) => {
                        const Icon = accountIcon(account.type);
                        return <article key={account.id} className="group relative overflow-hidden rounded-[2rem] border border-border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl dark:bg-zinc-900"><div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: account.color || "#FF8865" }} /><div className="flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800"><Icon className="h-5 w-5" /></span><div className="flex items-center gap-1">{account.is_default && <span className="mr-1 inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent"><Star className="h-3 w-3 fill-current" /> Default</span>}<button onClick={() => setEditingAccount(account)} className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white" aria-label={`Edit ${account.name}`}><Pencil className="h-4 w-4" /></button><button onClick={() => void deleteAccount(account)} className="rounded-xl p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30" aria-label={`Delete ${account.name}`}><Trash2 className="h-4 w-4" /></button></div></div><p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">{accountLabel(account.type)}</p><h2 className="mt-1 text-xl font-bold font-rounded">{account.name}</h2><p className="mt-1 min-h-5 text-xs text-zinc-400">{[account.provider, account.identifier].filter(Boolean).join(" · ") || "No identifier added"}</p><div className="mt-7 border-t border-border pt-5"><p className="text-xs text-zinc-400">Recorded balance</p><p className="mt-1 text-2xl font-bold font-rounded">{currency.format(account.balance)}</p>{account.type === "credit_card" && account.credit_limit > 0 && <p className="mt-2 text-xs text-zinc-400">Limit {currency.format(account.credit_limit)}{account.due_day ? ` · due day ${account.due_day}` : ""}</p>}</div></article>;
                    })}</section>
                )}
            </div>
            {editingAccount !== undefined && <AccountDialog account={editingAccount} onClose={() => setEditingAccount(undefined)} onSaved={() => { setEditingAccount(undefined); void loadAccounts(); }} />}
        </DashboardLayout>
    );
}
