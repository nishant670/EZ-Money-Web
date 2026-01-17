"use client";

import React from "react";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import {
    Plus,
    CreditCard,
    Building2,
    Wallet as WalletIcon,
    Smartphone,
    MoreVertical,
    ExternalLink,
    ChevronRight,
    ShieldCheck,
    Zap
} from "lucide-react";
import { cn } from "@/app/lib/utils";

const ACCOUNTS = {
    bank: [
        { name: "ICICI Salary Account", identifier: "**** 4829", balance: "₹1,45,200", status: "Connected", primary: true },
        { name: "HDFC Savings", identifier: "**** 1192", balance: "₹42,000", status: "Manual", primary: false },
    ],
    cards: [
        { name: "HDFC Millenia CC", identifier: "**** 9021", balance: "₹12,400", status: "Connected", limit: "₹2.5L", color: "bg-zinc-900" },
        { name: "ICICI Amazon Pay", identifier: "**** 3302", balance: "₹4,200", status: "Connected", limit: "₹1.5L", color: "bg-blue-900" },
    ],
    wallets: [
        { name: "Paytm Wallet", identifier: "99999 88888", balance: "₹1,240", status: "Connected", icon: "Paytm" },
        { name: "Amazon Pay", identifier: "99220 11223", balance: "₹5,800", status: "Connected", icon: "Amazon" },
    ]
};

export default function AccountsScreen() {
    return (
        <DashboardLayout>
            <div className="space-y-10 pb-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-rounded tracking-tight dark:text-white">Accounts & Wallets</h1>
                        <p className="text-zinc-500 text-sm font-medium mt-1">Manage where your money comes from and goes to.</p>
                    </div>
                    <button className="flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-accent/20 hover:scale-105 transition-all">
                        <Plus className="w-5 h-5" />
                        Add Account
                    </button>
                </div>

                {/* Bank Accounts Section */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                            <Building2 className="w-4 h-4" /> Bank Accounts
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {ACCOUNTS.bank.map((acc, i) => (
                            <div key={i} className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-border shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                                {acc.primary && <div className="absolute top-0 right-0 bg-accent text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-bl-xl">Primary</div>}
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:text-accent transition-colors">
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <button className="text-zinc-300 hover:text-zinc-900 transition-colors"><MoreVertical className="w-5 h-5" /></button>
                                </div>
                                <h4 className="text-xl font-bold font-rounded group-hover:text-accent transition-colors leading-tight">{acc.name}</h4>
                                <p className="text-sm text-zinc-400 mt-1 font-medium">{acc.identifier}</p>
                                <div className="mt-8 flex items-end justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase text-zinc-400">Available Balance</p>
                                        <p className="text-2xl font-bold mt-1 font-rounded">{acc.balance}</p>
                                    </div>
                                    <div className={cn(
                                        "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full",
                                        acc.status === "Connected" ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"
                                    )}>
                                        {acc.status === "Connected" ? <Zap className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                                        {acc.status}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Credit Cards Section */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                            <CreditCard className="w-4 h-4" /> Credit Cards
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {ACCOUNTS.cards.map((card, i) => (
                            <div key={i} className={cn("p-8 rounded-[2rem] text-white shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden", card.color)}>
                                <div className="absolute top-0 right-0 p-8 opacity-20"><CreditCard className="w-24 h-24" /></div>
                                <div className="relative z-10 flex flex-col h-full justify-between">
                                    <div>
                                        <h4 className="text-lg font-bold font-rounded mb-1">{card.name}</h4>
                                        <p className="text-xs text-white/60 font-medium tracking-widest leading-none">{card.identifier}</p>
                                    </div>
                                    <div className="mt-12">
                                        <p className="text-[10px] uppercase font-bold tracking-widest text-white/50 mb-1">Current Balance</p>
                                        <h5 className="text-xl font-bold font-rounded">{card.balance}</h5>
                                        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-white/50">
                                            <span>Limit: {card.limit}</span>
                                            <span className="flex items-center gap-1 text-green-400"><Zap className="w-3 h-3" /> Auto Sync</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button className="p-8 rounded-[2rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-accent/40 hover:bg-accent/5 transition-all group flex flex-col items-center justify-center text-center gap-4">
                            <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:text-accent transition-colors">
                                <Plus className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-bold group-hover:text-accent transition-colors">Add New Card</p>
                                <p className="text-xs text-zinc-400 mt-1">Amex, Visa, Mastercard</p>
                            </div>
                        </button>
                    </div>
                </section>

                {/* Wallets Section */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                            <WalletIcon className="w-4 h-4" /> Wallets & Others
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {ACCOUNTS.wallets.map((wallet, i) => (
                            <div key={i} className="flex items-center gap-4 p-6 bg-white dark:bg-zinc-900 border border-border rounded-2xl hover:border-accent transition-colors cursor-pointer group">
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-accent transition-colors font-bold text-xs uppercase overflow-hidden">
                                    {wallet.icon}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold dark:text-white leading-tight">{wallet.name}</p>
                                    <p className="text-xs text-zinc-500 mt-0.5">{wallet.identifier}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold group-hover:text-accent transition-colors">{wallet.balance}</p>
                                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Active</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* UPI IDs Management */}
                <div className="bg-zinc-100 dark:bg-zinc-800 p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 border border-border">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white dark:bg-zinc-700 rounded-2xl flex items-center justify-center text-accent shadow-sm">
                            <Smartphone className="w-8 h-8" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold font-rounded">Manage UPI IDs</h4>
                            <p className="text-sm text-zinc-500">Add or edit UPI handles linked to your bank accounts.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex -space-x-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="w-10 h-10 border-4 border-zinc-100 dark:border-zinc-800 rounded-full bg-accent-secondary flex items-center justify-center text-accent text-[10px] font-bold">BHIM</div>
                            ))}
                        </div>
                        <button className="flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-xl flex-1 md:flex-none">
                            Configure <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
