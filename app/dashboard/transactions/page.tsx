"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import {
    Search,
    Filter,
    Download,
    MoreHorizontal,
    ChevronDown,
    Check,
    ExternalLink,
    Trash2,
    Tag,
    FolderInput,
    Plus,
    ArrowUpDown,
    Calendar,
    Wallet,
    Info,
    X,
    Loader2
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import AddTransactionModal from "@/app/components/dashboard/AddTransactionModal";
import TransactionDetailsDrawer from "@/app/components/dashboard/TransactionDetailsDrawer";
import { EntriesAPI, Transaction } from "@/app/lib/api";

export default function TransactionsScreen() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [showFilters, setShowFilters] = useState(false);

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

    // Filters State
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("All"); // All, Expense, Income
    const [filterAccount, setFilterAccount] = useState("All Accounts");
    const [filterDateRange, setFilterDateRange] = useState("Last 30 Days");

    useEffect(() => {
        fetchTransactions();
    }, [filterType, filterAccount, filterDateRange, isModalOpen, isDrawerOpen]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (filterType !== "All") params.type = filterType.toLowerCase();
            // Backend currently supports specific query params.
            // We might need client-side filtering for some if backend assumes exact match or specific logic.
            // For now, let's just fetch all and filter client side for search, and use backend params for basic filters if possible.
            // Based on API review: listEntries supports: type, category, mode, min_amount, start_date, etc.

            const res = await EntriesAPI.list(params);
            setTransactions(res.data);
        } catch (err) {
            console.error("Failed to fetch transactions", err);
        } finally {
            setLoading(false);
        }
    };

    // Client-side filtering for search (until backend search API is robust)
    const filteredTransactions = transactions.filter(t => {
        if (searchTerm && !t.merchant?.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !t.category.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !t.title?.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }
        return true;
    });

    const openDrawer = (txn: Transaction) => {
        setSelectedTxn(txn);
        setIsDrawerOpen(true);
    };

    const toggleSelectAll = () => {
        if (selectedRows.length === filteredTransactions.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(filteredTransactions.map(t => t.ID));
        }
    };

    const toggleSelectRow = (id: number) => {
        if (selectedRows.includes(id)) {
            setSelectedRows(selectedRows.filter(rowId => rowId !== id));
        } else {
            setSelectedRows([...selectedRows, id]);
        }
    };

    const handleDelete = async (id: number) => {
        // In a real app, show confirmation toast/undo
        await EntriesAPI.delete(id);
        fetchTransactions();
        if (id === selectedTxn?.ID) setIsDrawerOpen(false);
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-rounded tracking-tight dark:text-white">Transactions</h1>
                        <p className="text-zinc-500 text-sm font-medium mt-1">Manage and organize all your financial data.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-zinc-200 transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 bg-accent text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-accent/20 hover:scale-105 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Add New
                        </button>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-accent" />
                        <input
                            type="text"
                            placeholder="Search by merchant, category, or amount..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-900 border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all border",
                                showFilters ? "bg-accent text-white border-accent" : "bg-white dark:bg-zinc-900 border-border text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50"
                            )}
                        >
                            <Filter className="w-4 h-4" />
                            Advanced Filters
                            {showFilters ? <X className="w-3 h-3 ml-1" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-border rounded-xl px-2 py-1">
                            {["All", "Expense", "Income"].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={cn(
                                        "px-3 py-1.5 text-xs font-bold rounded-lg transition-colors",
                                        filterType === type ? "text-accent bg-accent/10" : "text-zinc-500 hover:text-zinc-900"
                                    )}
                                >
                                    {type === "Expense" ? "Expenses" : (type === "Income" ? "Income" : "All")}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Active Filters Panel */}
                {showFilters && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-8 bg-white dark:bg-zinc-900 border border-border rounded-[2rem] shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                <Calendar className="w-3 h-3" /> Date Range
                            </label>
                            <select
                                value={filterDateRange}
                                onChange={(e) => setFilterDateRange(e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-2.5 text-sm outline-none"
                            >
                                <option>Last 30 Days</option>
                                <option>Custom Range</option>
                                <option>This Month</option>
                                <option>Last Quarter</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                <Wallet className="w-3 h-3" /> Account
                            </label>
                            <select
                                value={filterAccount}
                                onChange={(e) => setFilterAccount(e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-2.5 text-sm outline-none"
                            >
                                <option>All Accounts</option>
                                <option>HDFC Card</option>
                                <option>ICICI Bank</option>
                                <option>Paytm Wallet</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                <ArrowUpDown className="w-3 h-3" /> Amount Range
                            </label>
                            <div className="flex items-center gap-2">
                                <input type="text" placeholder="Min" className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-3 py-2 text-sm outline-none" />
                                <span className="text-zinc-300">-</span>
                                <input type="text" placeholder="Max" className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-3 py-2 text-sm outline-none" />
                            </div>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={fetchTransactions}
                                className="w-full bg-accent text-white py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-accent/20"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                )}

                {/* Transactions Table Section */}
                <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-border shadow-sm overflow-hidden flex flex-col relative min-h-[400px]">

                    {/* Bulk Actions Bar */}
                    {selectedRows.length > 0 && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-6 z-30 animate-in slide-in-from-bottom-8 duration-300">
                            <span className="text-sm font-bold">{selectedRows.length} selected</span>
                            <div className="h-4 w-px bg-zinc-700 dark:bg-zinc-300" />
                            <div className="flex items-center gap-4">
                                <button className="flex items-center gap-2 text-xs font-bold hover:text-accent transition-colors"><Tag className="w-4 h-4" /> Category</button>
                                <button className="flex items-center gap-2 text-xs font-bold hover:text-accent transition-colors"><FolderInput className="w-4 h-4" /> Account</button>
                                <button className="flex items-center gap-2 text-xs font-bold hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /> Delete</button>
                            </div>
                            <button
                                onClick={() => setSelectedRows([])}
                                className="p-1 hover:bg-white/10 dark:hover:bg-zinc-100 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-border">
                                    <th className="p-5 w-12">
                                        <button
                                            onClick={toggleSelectAll}
                                            className={cn(
                                                "w-5 h-5 rounded border-2 transition-all flex items-center justify-center",
                                                (selectedRows.length === filteredTransactions.length && filteredTransactions.length > 0) ? "bg-accent border-accent text-white" : "border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900"
                                            )}
                                        >
                                            {selectedRows.length === filteredTransactions.length && filteredTransactions.length > 0 && <Check className="w-3 h-3" />}
                                        </button>
                                    </th>
                                    <th className="p-5 text-xs font-bold uppercase tracking-widest text-zinc-400">Date <ArrowUpDown className="w-3 h-3 inline ml-1" /></th>
                                    <th className="p-5 text-xs font-bold uppercase tracking-widest text-zinc-400">Merchant</th>
                                    <th className="p-5 text-xs font-bold uppercase tracking-widest text-zinc-400">Category</th>
                                    <th className="p-5 text-xs font-bold uppercase tracking-widest text-zinc-400">Mode</th>
                                    <th className="p-5 text-xs font-bold uppercase tracking-widest text-zinc-400">Amount <ArrowUpDown className="w-3 h-3 inline ml-1" /></th>
                                    <th className="p-5 text-xs font-bold uppercase tracking-widest text-zinc-400 text-center">Status</th>
                                    <th className="p-5 text-xs font-bold uppercase tracking-widest text-zinc-400"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={8} className="p-10 text-center">
                                            <div className="flex justify-center items-center gap-2 text-zinc-400">
                                                <Loader2 className="animate-spin w-5 h-5" /> Loading transactions...
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-10 text-center text-zinc-400">No transactions found.</td>
                                    </tr>
                                ) : (
                                    filteredTransactions.map((row) => (
                                        <tr
                                            key={row.ID}
                                            onClick={() => openDrawer(row)}
                                            className={cn(
                                                "border-b border-border group hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer",
                                                selectedRows.includes(row.ID) && "bg-accent/5 dark:bg-accent/10"
                                            )}
                                        >
                                            <td className="p-5" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => toggleSelectRow(row.ID)}
                                                    className={cn(
                                                        "w-5 h-5 rounded border-2 transition-all flex items-center justify-center",
                                                        selectedRows.includes(row.ID) ? "bg-accent border-accent text-white" : "border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900"
                                                    )}
                                                >
                                                    {selectedRows.includes(row.ID) && <Check className="w-3 h-3" />}
                                                </button>
                                            </td>
                                            <td className="p-5 text-sm font-medium text-zinc-500 whitespace-nowrap">{row.date}</td>
                                            <td className="p-5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold dark:text-white">{row.merchant || row.title}</span>
                                                    <div className="flex gap-1 mt-1.5 overflow-hidden">
                                                        {(row.tags || []).slice(0, 2).map((tag, i) => (
                                                            <span key={i} className="text-[10px] font-bold px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-md uppercase tracking-tight">{tag}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className="text-xs font-bold text-accent bg-accent/10 px-3 py-1.5 rounded-full">{row.category}</span>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                                    <Wallet className="w-3.5 h-3.5" />
                                                    {row.mode}
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className={cn("text-sm font-bold", row.type === "income" ? "text-green-500" : "dark:text-white")}>
                                                    {row.type === "income" ? "+" : "-"}₹{row.amount}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex justify-center">
                                                    {row.status === "confirmed" ? (
                                                        <div className="w-6 h-6 flex items-center justify-center bg-green-500/10 text-green-500 rounded-lg" title="Confirmed">
                                                            <Check className="w-4 h-4" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-6 h-6 flex items-center justify-center bg-amber-500/10 text-amber-500 rounded-lg" title="Pending AI Verification">
                                                            <Info className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                                    <button className="p-2 text-zinc-400 hover:text-accent rounded-lg transition-colors"><ExternalLink className="w-4 h-4" /></button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(row.ID); }} className="p-2 text-zinc-400 hover:text-red-500 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                    <button className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Info / Pagination */}
                    <div className="p-5 flex items-center justify-between border-t border-border bg-zinc-50 dark:bg-zinc-800/30">
                        <div className="flex items-center gap-3 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                            <span>Showing {filteredTransactions.length} entries</span>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-3 py-2 text-sm font-bold border border-border rounded-xl hover:bg-white dark:hover:bg-zinc-800 opacity-50 cursor-not-allowed transition-all">Previous</button>
                            <button className="px-3 py-2 text-sm font-bold border border-border rounded-xl hover:bg-white dark:hover:bg-zinc-800 transition-all opacity-50 cursor-not-allowed">Next</button>
                        </div>
                    </div>
                </div>

                {/* Modals & Drawers */}
                <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
                <TransactionDetailsDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} transaction={selectedTxn} />
            </div>
        </DashboardLayout>
    );
}
