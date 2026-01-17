"use client";

import React from "react";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    PieChart as PieChartIcon,
    Download,
    FileText,
    Calendar,
    ChevronDown,
    ArrowRight
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    ComposedChart,
    Line,
    Area
} from "recharts";
import { cn } from "@/app/lib/utils";

const MONTHLY_STATS = [
    { name: "Jul", income: 65, expense: 42 },
    { name: "Aug", income: 72, expense: 38 },
    { name: "Sep", income: 84, expense: 51 },
    { name: "Oct", income: 78, expense: 45 },
    { name: "Nov", income: 92, expense: 48 },
    { name: "Dec", income: 110, expense: 55 },
    { name: "Jan", income: 95, expense: 49 },
];

const ACCOUNT_SPEND = [
    { name: "HDFC Card", value: 35 },
    { name: "ICICI Bank", value: 45 },
    { name: "Paytm Wallet", value: 15 },
    { name: "Cash", value: 5 },
];

const COLORS = ["#FF8865", "#FFB09C", "#FFE8E5", "#2D2D2D"];

export default function InsightsScreen() {
    return (
        <DashboardLayout>
            <div className="space-y-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-rounded tracking-tight dark:text-white">Financial Insights</h1>
                        <p className="text-zinc-500 text-sm font-medium mt-1">Deep dive into your spending and saving patterns.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-border px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm">
                            <Calendar className="w-4 h-4 text-accent" />
                            January 2026
                            <ChevronDown className="w-4 h-4" />
                        </button>
                        <button className="flex items-center gap-2 bg-accent text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-accent/20">
                            <Download className="w-4 h-4" />
                            Download Report
                        </button>
                    </div>
                </div>

                {/* High-level summary row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: "Savings Rate", value: "38.2%", desc: "15% higher than Dec", icon: TrendingUp, color: "text-green-500" },
                        { label: "Top Category", value: "Electronics", desc: "45% of total spend", icon: PieChartIcon, color: "text-accent" },
                        { label: "Avg. Daily Spend", value: "₹1,450", desc: "Steady since last week", icon: BarChart3, color: "text-blue-500" },
                        { label: "Predictive Balance", value: "₹2.4L", desc: "Estimate for end of Q1", icon: TrendingUp, color: "text-purple-500" },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-border shadow-sm">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">{stat.label}</p>
                            <h3 className="text-2xl font-bold font-rounded">{stat.value}</h3>
                            <div className="flex items-center gap-1.5 mt-2">
                                <stat.icon className={cn("w-3 h-3", stat.color)} />
                                <span className="text-xs text-zinc-500 font-medium">{stat.desc}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Income vs Expenses Bar Chart */}
                    <div className="bg-white dark:bg-zinc-900 p-10 rounded-[3rem] border border-border shadow-sm">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-xl font-bold font-rounded">Income vs Expenses</h3>
                                <p className="text-sm text-zinc-500 mt-1">Comparison over the last 7 months.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-accent" />
                                    <span className="text-[10px] font-bold uppercase text-zinc-400">Income</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                                    <span className="text-[10px] font-bold uppercase text-zinc-400">Expenses</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={MONTHLY_STATS} barGap={8}>
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
                                    <Bar dataKey="income" fill="#FF8865" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="expense" fill="#F0E5E7" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Account Wise Distribution */}
                    <div className="bg-white dark:bg-zinc-900 p-10 rounded-[3rem] border border-border shadow-sm">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-xl font-bold font-rounded">Account Distribution</h3>
                                <p className="text-sm text-zinc-500 mt-1">Where you spend the most from.</p>
                            </div>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-8 items-center h-full max-h-[350px]">
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={ACCOUNT_SPEND} layout="vertical">
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600 }} />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#FF8865" radius={[0, 6, 6, 0]} barSize={20} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-6">
                                {ACCOUNT_SPEND.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between border-l-4 border-accent/20 pl-4 py-1">
                                        <div>
                                            <p className="text-sm font-bold dark:text-white">{item.name}</p>
                                            <p className="text-xs text-zinc-500">Active Account</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold">{item.value}%</p>
                                            <p className="text-[10px] text-accent font-bold uppercase tracking-widest">Growing</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Top Merchants/Categories tables */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                    <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-border overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-border">
                            <h3 className="text-xl font-bold font-rounded">Top Merchants</h3>
                        </div>
                        <div className="p-4">
                            {[
                                { name: "Amazon India", category: "Shopping", transactions: 12, total: "₹24,500" },
                                { name: "Zomato", category: "Food", transactions: 24, total: "₹8,420" },
                                { name: "Uber", category: "Transport", transactions: 15, total: "₹3,100" },
                                { name: "Starbucks", category: "Coffee", transactions: 8, total: "₹2,840" },
                            ].map((m, i) => (
                                <div key={i} className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-2xl transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-700 rounded-xl flex items-center justify-center font-bold text-zinc-400 group-hover:text-accent transition-colors">
                                            {m.name[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold dark:text-white">{m.name}</p>
                                            <p className="text-xs text-zinc-500">{m.category} • {m.transactions} trans.</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold">{m.total}</p>
                                        <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium">
                                            Trend <TrendingUp className="w-3 h-3 text-green-500" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-accent rounded-[2.5rem] p-10 text-white flex flex-col justify-between shadow-2xl shadow-accent/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-20"><BarChart3 className="w-32 h-32" /></div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold font-rounded mb-4 leading-tight">Export your financial summary.</h3>
                            <p className="text-white/80 text-sm leading-relaxed mb-8">
                                Get a detailed PDF or CSV breakdown for your accountant or tax filings in one click.
                            </p>
                        </div>
                        <div className="space-y-3 relative z-10">
                            <button className="w-full bg-white text-accent py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:scale-105 transition-all">
                                <FileText className="w-5 h-5" />
                                Download PDF
                            </button>
                            <button className="w-full bg-zinc-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:scale-105 transition-all">
                                <Download className="w-5 h-5" />
                                Download CSV
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
