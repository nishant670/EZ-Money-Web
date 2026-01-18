"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    AlertCircle,
    Plus,
    ArrowUpRight,
    CheckCircle2,
    Info
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { cn } from "@/app/lib/utils";
import AddTransactionModal from "@/app/components/dashboard/AddTransactionModal";
import TransactionDetailsDrawer from "@/app/components/dashboard/TransactionDetailsDrawer";
import { EntriesAPI, Transaction } from "@/app/lib/api";

const COLORS = ["#FF8865", "#FFB09C", "#FFE8E5", "#2D2D2D", "#F0E5E7"];

export default function DashboardHome() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedTxn, setSelectedTxn] = useState<any>(null);

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Derived State
    const [summary, setSummary] = useState({
        income: 0,
        expense: 0,
        savings: 0
    });
    const [chartData, setChartData] = useState<{ name: string, income: number, expense: number }[]>([]);
    const [categoryData, setCategoryData] = useState<{ name: string, value: number, color: string }[]>([]);
    const [reviewItems, setReviewItems] = useState<Transaction[]>([]);

    useEffect(() => {
        fetchData();
    }, [isModalOpen, isDrawerOpen]); // Refresh when modal/drawer closes (naive invalidation)

    const fetchData = async () => {
        try {
            const res = await EntriesAPI.list();
            const txns = res.data;
            setTransactions(txns);
            processData(txns);
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
        } finally {
            setIsLoading(false);
        }
    };

    const processData = (txns: Transaction[]) => {
        // 1. Summary
        let inc = 0, exp = 0;
        txns.forEach(t => {
            if (t.type === 'income') inc += t.amount;
            if (t.type === 'expense') exp += t.amount;
        });
        setSummary({ income: inc, expense: exp, savings: inc - exp });

        // 2. Chart Data (Group by Date - Last 7 unique dates or last 7 days)
        // Simple aggregation by date string
        const daysMap = new Map<string, { income: number, expense: number }>();
        txns.forEach(t => {
            // Parse date to "DD MMM"
            const dateObj = new Date(t.date);
            const key = dateObj.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });

            if (!daysMap.has(key)) daysMap.set(key, { income: 0, expense: 0 });
            const curr = daysMap.get(key)!;
            if (t.type === 'income') curr.income += t.amount;
            if (t.type === 'expense') curr.expense += t.amount;
        });
        // Sort and take top 7
        const chart = Array.from(daysMap.entries())
            .map(([name, val]) => ({ name, ...val }))
            .slice(-7)
            .reverse();
        setChartData(chart);

        // 3. Category Data
        const catMap = new Map<string, number>();
        txns.filter(t => t.type === 'expense').forEach(t => {
            catMap.set(t.category, (catMap.get(t.category) || 0) + t.amount);
        });
        const cat = Array.from(catMap.entries())
            .map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
        setCategoryData(cat);

        // 4. Review Items (Pending status)
        setReviewItems(txns.filter(t => t.status === "pending").slice(0, 3));
    };

    const openDrawer = (txn: Transaction) => {
        setSelectedTxn(txn);
        setIsDrawerOpen(true);
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex h-[80vh] items-center justify-center">
                    <div className="animate-pulse text-zinc-300 font-bold text-xl">Loading your finances...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-10 animate-in fade-in duration-700">
                {/* Top Section: Header + CTA */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-rounded tracking-tight dark:text-white">Overview</h1>
                        <p className="text-zinc-500 text-sm font-medium mt-1">Here's what's happening with your money this month.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-accent/20 hover:scale-105 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Add Transaction
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: "Total Spent", amount: `₹${summary.expense.toLocaleString()}`, trend: "This Month", icon: TrendingUp, color: "text-red-500", bg: "bg-red-500/10" },
                        { label: "Total Income", amount: `₹${summary.income.toLocaleString()}`, trend: "This Month", icon: TrendingDown, color: "text-green-500", bg: "bg-green-500/10" },
                        { label: "Net Savings", amount: `₹${summary.savings.toLocaleString()}`, trend: "This Month", icon: Wallet, color: "text-accent", bg: "bg-accent/10" },
                    ].map((card, i) => (
                        <div key={i} className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-border shadow-sm hover:shadow-xl transition-all group">
                            <div className="flex justify-between items-start mb-6">
                                <div className={cn("p-3 rounded-2xl", card.bg, card.color)}>
                                    <card.icon className="w-6 h-6" />
                                </div>
                                <div className={cn("text-xs font-bold px-2.5 py-1 rounded-full", card.bg, card.color)}>
                                    {card.trend}
                                </div>
                            </div>
                            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">{card.label}</p>
                            <h3 className="text-3xl font-bold mt-2 font-rounded group-hover:scale-105 transition-transform origin-left">{card.amount}</h3>
                        </div>
                    ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Spend Trend */}
                    <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-border shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold font-rounded">Spending Trends</h3>
                            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-zinc-400 underline decoration-2 underline-offset-4 decoration-accent/20">
                                Last 7 Days
                            </div>
                        </div>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#FF8865" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#FF8865" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fontWeight: 500, fill: '#A0A0A0' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fontWeight: 500, fill: '#A0A0A0' }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="income" stroke="#FF8865" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                                    <Area type="monotone" dataKey="expense" stroke="#2D2D2D" strokeWidth={3} fill="transparent" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Category Breakdown */}
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-border shadow-sm flex flex-col">
                        <h3 className="text-xl font-bold font-rounded mb-8">Top Categories</h3>
                        {categoryData.length > 0 ? (
                            <>
                                <div className="h-[250px] w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={categoryData}
                                                innerRadius={80}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {categoryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <p className="text-xs font-bold text-zinc-400">Expenses</p>
                                        <p className="text-2xl font-bold font-rounded">₹{summary.expense.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="mt-8 space-y-3 flex-1 overflow-y-auto pr-2">
                                    {categoryData.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between group cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 transition-colors">{item.name}</span>
                                            </div>
                                            <span className="text-sm font-bold">₹{item.value.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-zinc-400 text-sm">No expense data</div>
                        )}
                    </div>
                </div>

                {/* Bottom Section: To Review & Recent */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* To Review */}
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-border shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <h3 className="text-xl font-bold font-rounded">Review Required</h3>
                                <span className="bg-accent/10 text-accent text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">{reviewItems.length} Items</span>
                            </div>
                            <button className="text-xs font-bold text-accent hover:underline">View All</button>
                        </div>

                        {reviewItems.length > 0 ? (
                            <div className="space-y-4">
                                {reviewItems.map((item, i) => (
                                    <div
                                        key={item.ID}
                                        onClick={() => openDrawer(item)}
                                        className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl group hover:bg-white border border-transparent hover:border-border transition-all cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-amber-500/10 text-amber-500">
                                                <AlertCircle className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold group-hover:text-accent transition-colors">{item.merchant || "Unknown Merchant"}</p>
                                                <p className="text-xs text-zinc-500">{item.title || "Review Needed"}</p>
                                            </div>
                                        </div>
                                        <ArrowUpRight className="w-4 h-4 text-zinc-300 group-hover:text-accent group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-10 text-center text-zinc-400 text-sm">All caught up! No reviews pending.</div>
                        )}
                    </div>

                    {/* Recent Transactions */}
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-border shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold font-rounded">Recent Transactions</h3>
                            <button className="text-xs font-bold text-accent hover:underline">Full Statement</button>
                        </div>

                        <div className="space-y-6">
                            {transactions.slice(0, 5).map((t, i) => (
                                <div
                                    key={t.ID}
                                    onClick={() => openDrawer(t)}
                                    className="flex items-center justify-between group cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center font-bold text-zinc-400 group-hover:text-accent group-hover:bg-accent/10 transition-all shadow-sm">
                                            {t.merchant ? t.merchant[0] : (t.title ? t.title[0] : '?')}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold dark:text-white">{t.merchant || t.title}</p>
                                            <p className="text-xs text-zinc-500 font-medium">{t.category} • {t.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={cn("text-sm font-bold", t.type === 'income' ? "text-green-500" : "text-zinc-900 dark:text-white")}>
                                            {t.type === 'income' ? '+' : '-'}₹{t.amount}
                                        </p>
                                        {t.status === "confirmed" ? (
                                            <div className="flex items-center justify-end gap-1 text-[10px] text-green-500 font-bold uppercase tracking-widest mt-0.5">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Confirmed
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-end gap-1 text-[10px] text-amber-500 font-bold uppercase tracking-widest mt-0.5">
                                                <Info className="w-3 h-3" />
                                                Pending AI
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {transactions.length === 0 && (
                                <div className="py-10 text-center text-zinc-400 text-sm">No transactions found. Adding one!</div>
                            )}
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
