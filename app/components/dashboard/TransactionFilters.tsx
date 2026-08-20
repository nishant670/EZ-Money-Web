"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarRange, Filter, IndianRupee, Search, Tag, Tags, Wallet, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Account, EntryListParams, apiErrorMessage } from "@/app/lib/api";
import { categoryOptionsFor, loadCategories } from "@/app/lib/categories";
import { formatDate, toLocalISO } from "@/app/lib/format";

export type DateRangePreset = "month" | "30d" | "90d" | "all" | "custom";

type FilterUpdate = Record<string, string | number | null | undefined>;

export type TransactionFilterState = {
    q: string;
    type: "all" | "expense" | "income";
    accountID: number | "";
    category: string;
    tag: string;
    minAmount: string;
    maxAmount: string;
    dateRange: DateRangePreset;
    startDate: string;
    endDate: string;
    page: number;
};

const RANGE_LABELS: Record<DateRangePreset, string> = {
    month: "This month",
    "30d": "Last 30 days",
    "90d": "Last 90 days",
    all: "All time",
    custom: "Custom dates",
};

function currentMonthStart() {
    const date = new Date();
    date.setDate(1);
    return toLocalISO(date);
}

function positiveInteger(value: string | null) {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : "";
}

function amountValue(value: string | null) {
    if (value === null || value.trim() === "") return "";
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? value : "";
}

function rangeParams(range: DateRangePreset, startDate: string, endDate: string) {
    if (range === "all") return {};
    if (range === "custom") {
        return {
            ...(startDate ? { start_date: startDate } : {}),
            ...(endDate ? { end_date: endDate } : {}),
        };
    }
    const end = new Date();
    const start = new Date(end);
    if (range === "month") start.setDate(1);
    if (range === "30d") start.setDate(end.getDate() - 29);
    if (range === "90d") start.setDate(end.getDate() - 89);
    return { start_date: toLocalISO(start), end_date: toLocalISO(end) };
}

export function useTransactionFilters(defaultRange: Exclude<DateRangePreset, "custom">) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const queryString = searchParams.toString();

    const filters = useMemo<TransactionFilterState>(() => {
        const params = new URLSearchParams(queryString);
        const rangeValue = params.get("range");
        const dateRange: DateRangePreset = rangeValue === "month" || rangeValue === "30d" || rangeValue === "90d" || rangeValue === "all" || rangeValue === "custom"
            ? rangeValue
            : defaultRange;
        const typeValue = params.get("type");
        const accountID = positiveInteger(params.get("account_id"));
        const pageValue = positiveInteger(params.get("page"));
        return {
            q: params.get("q")?.trim() || "",
            type: typeValue === "expense" || typeValue === "income" ? typeValue : "all",
            accountID,
            category: params.get("category")?.trim() || "",
            tag: params.get("tag")?.trim() || "",
            minAmount: amountValue(params.get("min_amount")),
            maxAmount: amountValue(params.get("max_amount")),
            dateRange,
            startDate: params.get("start_date") || (dateRange === "custom" ? currentMonthStart() : ""),
            endDate: params.get("end_date") || (dateRange === "custom" ? toLocalISO() : ""),
            page: typeof pageValue === "number" ? pageValue : 1,
        };
    }, [defaultRange, queryString]);

    const update = useCallback((updates: FilterUpdate, replace = false) => {
        const next = new URLSearchParams(queryString);
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === undefined || value === "") next.delete(key);
            else next.set(key, String(value));
        });
        if (!("page" in updates)) next.delete("page");
        const href = next.size ? `${pathname}?${next.toString()}` : pathname;
        if (replace) router.replace(href, { scroll: false });
        else router.push(href, { scroll: false });
    }, [pathname, queryString, router]);

    const entryParams = useCallback((includePagination = false): EntryListParams => {
        const params: EntryListParams = {};
        if (includePagination) {
            params.page = filters.page;
            params.page_size = 25;
        }
        if (filters.q) params.q = filters.q;
        if (filters.type !== "all") params.type = filters.type;
        if (filters.accountID) params.account_id = filters.accountID;
        if (filters.category) params.category = filters.category;
        if (filters.tag) params.tag = filters.tag;
        if (filters.minAmount !== "") params.min_amount = Number(filters.minAmount);
        if (filters.maxAmount !== "") params.max_amount = Number(filters.maxAmount);
        Object.assign(params, rangeParams(filters.dateRange, filters.startDate, filters.endDate));
        return params;
    }, [filters]);

    const amountError = filters.minAmount !== "" && filters.maxAmount !== "" && Number(filters.minAmount) > Number(filters.maxAmount)
        ? "Minimum amount cannot be greater than maximum amount."
        : "";
    const dateError = filters.dateRange === "custom" && filters.startDate && filters.endDate && filters.startDate > filters.endDate
        ? "Start date cannot be after end date."
        : "";

    const clearAll = useCallback(() => {
        router.push(`${pathname}?range=all`, { scroll: false });
    }, [pathname, router]);

    return { filters, update, entryParams, amountError, dateError, clearAll };
}

export type TransactionFilterController = ReturnType<typeof useTransactionFilters>;

type FilterChip = {
    key: string;
    label: string;
    remove: () => void;
};

function DebouncedFilterInput({
    initialValue,
    onCommit,
    ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange"> & {
    initialValue: string;
    onCommit: (value: string) => void;
}) {
    const [draft, setDraft] = useState(initialValue);

    useEffect(() => {
        if (draft === initialValue) return;
        const timer = window.setTimeout(() => onCommit(draft), 300);
        return () => window.clearTimeout(timer);
    }, [draft, initialValue, onCommit]);

    return <input {...props} value={draft} onChange={(event) => setDraft(event.target.value)} />;
}

export function TransactionFilterPanel({
    controller,
    accounts,
    searchLabel,
}: {
    controller: TransactionFilterController;
    accounts: Account[];
    searchLabel: string;
}) {
    const { filters, update, amountError, dateError, clearAll } = controller;
    const [categories, setCategories] = useState<string[]>([]);
    const [categoriesError, setCategoriesError] = useState("");

    useEffect(() => {
        let active = true;
        loadCategories()
            .then((value) => {
                if (!active) return;
                setCategories(value.categories);
                setCategoriesError("");
            })
            .catch((error) => {
                if (!active) return;
                setCategoriesError(apiErrorMessage(error, "Categories are unavailable."));
            });
        return () => { active = false; };
    }, []);

    const chips = useMemo<FilterChip[]>(() => {
        const items: FilterChip[] = [];
        if (filters.q) items.push({ key: "q", label: `Search: ${filters.q}`, remove: () => update({ q: null }) });
        if (filters.type !== "all") items.push({ key: "type", label: filters.type === "expense" ? "Expenses" : "Income", remove: () => update({ type: null }) });
        if (filters.accountID) {
            const account = accounts.find((item) => item.id === filters.accountID);
            items.push({ key: "account", label: `Account: ${account?.name || `#${filters.accountID}`}`, remove: () => update({ account_id: null }) });
        }
        if (filters.category) items.push({ key: "category", label: `Category: ${filters.category}`, remove: () => update({ category: null }) });
        if (filters.tag) items.push({ key: "tag", label: `Tag: ${filters.tag}`, remove: () => update({ tag: null }) });
        if (filters.minAmount !== "") items.push({ key: "min", label: `At least ₹${filters.minAmount}`, remove: () => update({ min_amount: null }) });
        if (filters.maxAmount !== "") items.push({ key: "max", label: `At most ₹${filters.maxAmount}`, remove: () => update({ max_amount: null }) });
        const dateLabel = filters.dateRange === "custom"
            ? `${filters.startDate ? formatDate(filters.startDate) : "Any date"} – ${filters.endDate ? formatDate(filters.endDate) : "Today"}`
            : RANGE_LABELS[filters.dateRange];
        items.push({ key: "date", label: dateLabel, remove: () => update({ range: "all", start_date: null, end_date: null }) });
        return items;
    }, [accounts, filters, update]);

    const selectRange = (range: DateRangePreset) => {
        if (range === "custom") {
            update({ range, start_date: filters.startDate || currentMonthStart(), end_date: filters.endDate || toLocalISO() });
            return;
        }
        update({ range, start_date: null, end_date: null });
    };

    return (
        <section className="space-y-4 rounded-[2rem] border border-border bg-white p-4 dark:bg-zinc-900" aria-label="Transaction filters">
            <div className="grid gap-3 xl:grid-cols-4">
                <label className="relative xl:col-span-2">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <span className="sr-only">{searchLabel}</span>
                    <DebouncedFilterInput key={`q-${filters.q}`} initialValue={filters.q} onCommit={(value) => update({ q: value.trim() || null }, true)} placeholder="Merchant, title, or note…" className="min-h-11 w-full rounded-xl bg-zinc-100 pl-11 pr-4 text-sm outline-none focus:ring-4 focus:ring-accent/10 dark:bg-zinc-800" />
                </label>
                <label className="relative">
                    <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <span className="sr-only">Transaction type</span>
                    <select value={filters.type} onChange={(event) => update({ type: event.target.value === "all" ? null : event.target.value })} className="min-h-11 w-full appearance-none rounded-xl bg-zinc-100 pl-10 pr-8 text-sm font-semibold outline-none dark:bg-zinc-800">
                        <option value="all">All types</option>
                        <option value="expense">Expenses</option>
                        <option value="income">Income</option>
                    </select>
                </label>
                <label className="relative">
                    <Wallet className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <span className="sr-only">Account</span>
                    <select value={filters.accountID} onChange={(event) => update({ account_id: event.target.value || null })} className="min-h-11 w-full appearance-none rounded-xl bg-zinc-100 pl-10 pr-8 text-sm font-semibold outline-none dark:bg-zinc-800">
                        <option value="">All accounts</option>
                        {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
                    </select>
                </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <label className="relative">
                    <Tags className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <span className="sr-only">Category</span>
                    <select value={filters.category} onChange={(event) => update({ category: event.target.value || null })} disabled={Boolean(categoriesError)} className="min-h-11 w-full appearance-none rounded-xl bg-zinc-100 pl-10 pr-8 text-sm font-semibold outline-none disabled:opacity-50 dark:bg-zinc-800">
                        <option value="">All categories</option>
                        {categoryOptionsFor(categories, filters.category).map((category) => <option key={category} value={category}>{category}</option>)}
                    </select>
                </label>
                <label className="relative">
                    <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <span className="sr-only">Tag</span>
                    <DebouncedFilterInput key={`tag-${filters.tag}`} initialValue={filters.tag} onCommit={(value) => update({ tag: value.trim() || null }, true)} placeholder="Tag" className="min-h-11 w-full rounded-xl bg-zinc-100 pl-10 pr-3 text-sm outline-none dark:bg-zinc-800" />
                </label>
                <label className="relative">
                    <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <span className="sr-only">Minimum amount</span>
                    <DebouncedFilterInput key={`min-${filters.minAmount}`} initialValue={filters.minAmount} onCommit={(value) => update({ min_amount: value || null }, true)} type="number" min="0" step="0.01" placeholder="Minimum" className="min-h-11 w-full rounded-xl bg-zinc-100 pl-10 pr-3 text-sm outline-none dark:bg-zinc-800" />
                </label>
                <label className="relative">
                    <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <span className="sr-only">Maximum amount</span>
                    <DebouncedFilterInput key={`max-${filters.maxAmount}`} initialValue={filters.maxAmount} onCommit={(value) => update({ max_amount: value || null }, true)} type="number" min="0" step="0.01" placeholder="No maximum" className="min-h-11 w-full rounded-xl bg-zinc-100 pl-10 pr-3 text-sm outline-none dark:bg-zinc-800" />
                </label>
                <label className="relative">
                    <CalendarRange className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <span className="sr-only">Date range</span>
                    <select value={filters.dateRange} onChange={(event) => selectRange(event.target.value as DateRangePreset)} className="min-h-11 w-full appearance-none rounded-xl bg-zinc-100 pl-10 pr-8 text-sm font-semibold outline-none dark:bg-zinc-800">
                        <option value="month">This month</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                        <option value="all">All time</option>
                        <option value="custom">Custom range</option>
                    </select>
                </label>
            </div>

            {filters.dateRange === "custom" && (
                <div className="flex flex-col gap-3 rounded-2xl bg-zinc-50 p-3 dark:bg-zinc-800/60 sm:flex-row sm:items-center">
                    <CalendarRange className="hidden h-4 w-4 text-accent sm:block" />
                    <label className="flex flex-1 items-center gap-2 text-xs font-bold text-zinc-500"><span>From</span><input type="date" value={filters.startDate} max={filters.endDate || toLocalISO()} onChange={(event) => update({ range: "custom", start_date: event.target.value || null })} className="min-h-10 flex-1 rounded-xl border border-border bg-white px-3 outline-none dark:bg-zinc-900" /></label>
                    <label className="flex flex-1 items-center gap-2 text-xs font-bold text-zinc-500"><span>To</span><input type="date" value={filters.endDate} min={filters.startDate || undefined} max={toLocalISO()} onChange={(event) => update({ range: "custom", end_date: event.target.value || null })} className="min-h-10 flex-1 rounded-xl border border-border bg-white px-3 outline-none dark:bg-zinc-900" /></label>
                </div>
            )}

            {(categoriesError || amountError || dateError) && (
                <div className="space-y-1 text-xs font-semibold text-red-600 dark:text-red-300">
                    {categoriesError && <p>{categoriesError} The current category remains visible, but new category choices need the API.</p>}
                    {amountError && <p>{amountError}</p>}
                    {dateError && <p>{dateError}</p>}
                </div>
            )}

            <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4" aria-label="Active filters">
                <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">Applied</span>
                {chips.map((chip) => (
                    <button key={chip.key} type="button" onClick={chip.remove} className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-accent/10 px-3 text-xs font-bold text-accent" aria-label={`Remove ${chip.label} filter`}>
                        {chip.label}<X className="h-3.5 w-3.5" />
                    </button>
                ))}
                <button type="button" onClick={clearAll} className="ml-auto min-h-8 px-2 text-xs font-bold text-zinc-500 underline decoration-zinc-300 underline-offset-4">Clear all</button>
            </div>
        </section>
    );
}
