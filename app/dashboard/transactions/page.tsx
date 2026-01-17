"use client";

import React, { useState } from "react";
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
    X
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import AddTransactionModal from "@/app/components/dashboard/AddTransactionModal";
import TransactionDetailsDrawer from "@/app/components/dashboard/TransactionDetailsDrawer";

const TRANSACTIONS = [
    { id: 1, date: "15 Jan, 2026", merchant: "Starbucks", category: "Food & Drinks", account: "HDFC Card", type: "Expense", amount: "₹350", status: "confirmed", tags: ["Morning", "Coffee"] },
    { id: 2, date: "15 Jan, 2026", merchant: "Zomato Premium", category: "Food & Drinks", account: "ICICI Bank", type: "Expense", amount: "₹1,200", status: "confirmed", tags: ["Dinner"] },
    { id: 3, date: "14 Jan, 2026", merchant: "Salary Credit", category: "Salary", account: "ICICI Bank", type: "Income", amount: "+₹1,25,000", status: "confirmed", tags: ["Work"] },
    { id: 4, date: "14 Jan, 2026", merchant: "Amazon India", category: "Electronics", account: "Amazon Pay", type: "Expense", amount: "₹45,000", status: "pending", tags: ["Personal", "Gadgets"] },
    { id: 5, date: "13 Jan, 2026", merchant: "Apple Subscription", category: "Entertainment", account: "HDFC Card", type: "Expense", amount: "₹199", status: "confirmed", tags: ["iCloud"] },
    { id: 6, date: "12 Jan, 2026", merchant: "Uber India", category: "Transport", account: "Paytm Wallet", type: "Expense", amount: "₹420", status: "confirmed", tags: ["Travel"] },
    { id: 7, date: "11 Jan, 2026", merchant: "Reliance Fresh", category: "Groceries", account: "ICICI Bank", type: "Expense", amount: "₹2,450", status: "confirmed", tags: ["Home"] },
    { id: 8, date: "10 Jan, 2026", merchant: "Netflix", category: "Entertainment", account: "HDFC Card", type: "Expense", amount: "₹649", status: "confirmed", tags: ["Family"] },
];

export default function TransactionsScreen() {
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedTxn, setSelectedTxn] = useState<any>(null);

    const openDrawer = (txn: any) => {
        setSelectedTxn(txn);
        setIsDrawerOpen(true);
    };

    const toggleSelectAll = () => {
        if (selectedRows.length === TRANSACTIONS.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(TRANSACTIONS.map(t => t.id));
        }
    };

    const toggleSelectRow = (id: number) => {
        if (selectedRows.includes(id)) {
            setSelectedRows(selectedRows.filter(rowId => rowId !== id));
        } else {
            setSelectedRows([...selectedRows, id]);
        }
    };

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
                            <button className="px-3 py-1.5 text-xs font-bold text-accent bg-accent/10 rounded-lg">All</button>
                            <button className="px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900">Expenses</button>
                            <button className="px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900">Income</button>
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
                            <select className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-2.5 text-sm outline-none">
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
                            <select className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-2.5 text-sm outline-none">
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
                            <button className="w-full bg-accent text-white py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-accent/20">Apply Filters</button>
                        </div>
                    </div>
                )}

                {/* Transactions Table Section */}
                <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-border shadow-sm overflow-hidden flex flex-col relative">

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

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-border">
                                    <th className="p-5 w-12">
                                        <button
                                            onClick={toggleSelectAll}
                                            className={cn(
                                                "w-5 h-5 rounded border-2 transition-all flex items-center justify-center",
                                                selectedRows.length === TRANSACTIONS.length ? "bg-accent border-accent text-white" : "border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900"
                                            )}
                                        >
                                            {selectedRows.length === TRANSACTIONS.length && <Check className="w-3 h-3" />}
                                        </button>
                                    </th>
                                    <th className="p-5 text-xs font-bold uppercase tracking-widest text-zinc-400">Date <ArrowUpDown className="w-3 h-3 inline ml-1" /></th>
                                    <th className="p-5 text-xs font-bold uppercase tracking-widest text-zinc-400">Merchant</th>
                                    <th className="p-5 text-xs font-bold uppercase tracking-widest text-zinc-400">Category</th>
                                    <th className="p-5 text-xs font-bold uppercase tracking-widest text-zinc-400">Account</th>
                                    <th className="p-5 text-xs font-bold uppercase tracking-widest text-zinc-400">Amount <ArrowUpDown className="w-3 h-3 inline ml-1" /></th>
                                    <th className="p-5 text-xs font-bold uppercase tracking-widest text-zinc-400 text-center">Status</th>
                                    <th className="p-5 text-xs font-bold uppercase tracking-widest text-zinc-400"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {TRANSACTIONS.map((row) => (
                                    <tr
                                        key={row.id}
                                        onClick={() => openDrawer(row)}
                                        className={cn(
                                            "border-b border-border group hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer",
                                            selectedRows.includes(row.id) && "bg-accent/5 dark:bg-accent/10"
                                        )}
                                    >
                                        <td className="p-5" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => toggleSelectRow(row.id)}
                                                className={cn(
                                                    "w-5 h-5 rounded border-2 transition-all flex items-center justify-center",
                                                    selectedRows.includes(row.id) ? "bg-accent border-accent text-white" : "border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900"
                                                )}
                                            >
                                                {selectedRows.includes(row.id) && <Check className="w-3 h-3" />}
                                            </button>
                                        </td>
                                        <td className="p-5 text-sm font-medium text-zinc-500 whitespace-nowrap">{row.date}</td>
                                        <td className="p-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold dark:text-white">{row.merchant}</span>
                                                <div className="flex gap-1 mt-1.5 overflow-hidden">
                                                    {row.tags.slice(0, 2).map((tag, i) => (
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
                                                {row.account}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className={cn("text-sm font-bold", row.amount.startsWith("+") ? "text-green-500" : "dark:text-white")}>{row.amount}</span>
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
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 text-zinc-400 hover:text-accent rounded-lg transition-colors"><ExternalLink className="w-4 h-4" /></button>
                                                <button className="p-2 text-zinc-400 hover:text-red-500 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                <button className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Info / Pagination */}
                    <div className="p-5 flex items-center justify-between border-t border-border bg-zinc-50 dark:bg-zinc-800/30">
                        <div className="flex items-center gap-3 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                            <span>Showing 1-25 of 1,240</span>
                            <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700" />
                            <span className="flex items-center gap-1"><Info className="w-3 h-3" /> Press <span className="bg-white dark:bg-zinc-800 px-1 rounded border border-border">E</span> to quick-edit row</span>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-3 py-2 text-sm font-bold border border-border rounded-xl hover:bg-white dark:hover:bg-zinc-800 opacity-50 cursor-not-allowed transition-all">Previous</button>
                            <button className="px-3 py-2 text-sm font-bold border border-border rounded-xl hover:bg-white dark:hover:bg-zinc-800 transition-all">Next</button>
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
