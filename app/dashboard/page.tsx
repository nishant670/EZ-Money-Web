"use client";

import React, { useState } from "react";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    AlertCircle,
    Plus,
    ArrowUpRight,
    ArrowDownLeft,
    Search,
    CheckCircle2
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

const TREND_DATA = [
    { name: "01 Jan", income: 4500, expense: 2100 },
    { name: "05 Jan", income: 5200, expense: 3400 },
    { name: "10 Jan", income: 4800, expense: 2800 },
    { name: "15 Jan", income: 6100, expense: 4100 },
    { name: "20 Jan", income: 5500, expense: 3200 },
    { name: "25 Jan", income: 6700, expense: 3800 },
    { name: "31 Jan", income: 7200, expense: 4500 },
];

const CATEGORY_DATA = [
    { name: "Food", value: 4500, color: "#FF8865" },
    { name: "Transport", value: 2100, color: "#FFB09C" },
    { name: "Shopping", value: 3400, color: "#FFE8E5" },
    { name: "Bills", value: 5800, color: "#2D2D2D" },
    { name: "Others", value: 1200, color: "#F0E5E7" },
];

export default function DashboardHome() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedTxn, setSelectedTxn] = useState<any>(null);

    const openDrawer = (txn: any) => {
        setSelectedTxn(txn);
        setIsDrawerOpen(true);
    };

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
                        { label: "Total Spent", amount: "₹45,200", trend: "+12.5%", icon: TrendingUp, color: "text-red-500", bg: "bg-red-500/10" },
                        { label: "Total Income", amount: "₹72,400", trend: "+5.2%", icon: TrendingDown, color: "text-green-500", bg: "bg-green-500/10" },
                        { label: "Net Savings", amount: "₹27,200", trend: "-2.1%", icon: Wallet, color: "text-accent", bg: "bg-accent/10" },
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
                                Last 30 Days
                            </div>
                        </div>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={TREND_DATA}>
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
                        <h3 className="text-xl font-bold font-rounded mb-8">Categories</h3>
                        <div className="h-[250px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={CATEGORY_DATA}
                                        innerRadius={80}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {CATEGORY_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <p className="text-xs font-bold text-zinc-400">Total Spent</p>
                                <p className="text-2xl font-bold font-rounded">₹18,200</p>
                            </div>
                        </div>
                        <div className="mt-8 space-y-3 flex-1 overflow-y-auto pr-2">
                            {CATEGORY_DATA.map((item, i) => (
                                <div key={i} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 transition-colors">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-bold">₹{item.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Section: To Review & Recent */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* To Review */}
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-border shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <h3 className="text-xl font-bold font-rounded">Review Required</h3>
                                <span className="bg-accent/10 text-accent text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">3 Items</span>
                            </div>
                            <button className="text-xs font-bold text-accent hover:underline">View All</button>
                        </div>

                        <div className="space-y-4">
                            {[
                                { title: "Missing Category", desc: "Transaction at Starbucks (₹350)", icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/10" },
                                { title: "Possible Duplicate", desc: "₹1,200 found twice on 12 Jan", icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
                                { title: "Uncategorized AI", desc: "Extraction needs verification (₹4,500)", icon: AlertCircle, color: "text-blue-500", bg: "bg-blue-500/10" },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    onClick={() => openDrawer({ merchant: item.title, cat: "AI Review", amount: "₹0", date: "System Alert", account: "N/A", tags: ["Review"] })}
                                    className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl group hover:bg-white border border-transparent hover:border-border transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", item.bg, item.color)}>
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold group-hover:text-accent transition-colors">{item.title}</p>
                                            <p className="text-xs text-zinc-500">{item.desc}</p>
                                        </div>
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 text-zinc-300 group-hover:text-accent group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-border shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold font-rounded">Recent Transactions</h3>
                            <button className="text-xs font-bold text-accent hover:underline">Full Statement</button>
                        </div>

                        <div className="space-y-6">
                            {[
                                { merchant: "Zomato", cat: "Food", amount: "-₹540", date: "Today, 2:30 PM", status: "confirmed" },
                                { merchant: "Salary Credit", cat: "Income", amount: "+₹85,000", date: "Yesterday", status: "confirmed" },
                                { merchant: "Apple Store", cat: "Electronics", amount: "-₹1,200", date: "14 Jan, 2026", status: "pending" },
                                { merchant: "Uber India", cat: "Transport", amount: "-₹210", date: "12 Jan, 2026", status: "confirmed" },
                            ].map((t, i) => (
                                <div
                                    key={i}
                                    onClick={() => openDrawer({ merchant: t.merchant, cat: t.cat, amount: t.amount, date: t.date, account: "ICICI Bank", tags: ["Recent"] })}
                                    className="flex items-center justify-between group cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center font-bold text-zinc-400 group-hover:text-accent group-hover:bg-accent/10 transition-all shadow-sm">
                                            {t.merchant[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold dark:text-white">{t.merchant}</p>
                                            <p className="text-xs text-zinc-500 font-medium">{t.cat} • {t.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={cn("text-sm font-bold", t.amount.startsWith("+") ? "text-green-500" : "text-zinc-900 dark:text-white")}>{t.amount}</p>
                                        {t.status === "confirmed" ? (
                                            <div className="flex items-center justify-end gap-1 text-[10px] text-green-500 font-bold uppercase tracking-widest mt-0.5">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Confirmed
                                            </div>
                                        ) : (
                                            <div className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mt-0.5">Pending AI</div>
                                        )}
                                    </div>
                                </div>
                            ))}
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
