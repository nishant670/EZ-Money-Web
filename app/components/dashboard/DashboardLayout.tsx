"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
    LayoutDashboard,
    TableProperties,
    BarChart3,
    Wallet,
    Zap,
    Download,
    Settings,
    Menu,
    X,
    Search,
    Bell,
    ChevronDown,
    LogOut,
    Plus
} from "lucide-react";
import { cn } from "@/app/lib/utils";

const NAV_ITEMS = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Transactions", href: "/dashboard/transactions", icon: TableProperties },
    { name: "Insights", href: "/dashboard/insights", icon: BarChart3 },
    { name: "Accounts", href: "/dashboard/accounts", icon: Wallet },
    { name: "Rules", href: "#", icon: Zap, comingSoon: true },
    { name: "Imports", href: "#", icon: Download, comingSoon: true },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex">
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-white dark:bg-zinc-900 transition-transform lg:translate-x-0 lg:static lg:inset-0",
                    !isSidebarOpen && "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className="h-16 flex items-center px-6 border-b border-border">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 relative bg-accent rounded-lg flex items-center justify-center shadow-lg shadow-accent/20">
                                <Image src="/logo.png" alt="Finnri" fill className="p-1 object-contain" />
                            </div>
                            <span className="text-xl font-bold tracking-tight font-rounded dark:text-white">Finnri</span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative",
                                    pathname === item.href
                                        ? "bg-accent/10 text-accent font-bold"
                                        : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-400"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5", pathname === item.href ? "text-accent" : "text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200")} />
                                <span className="text-sm">{item.name}</span>
                                {item.comingSoon && (
                                    <span className="absolute right-3 text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">Soon</span>
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="p-4 border-t border-border">
                        <button className="flex items-center gap-3 w-full px-3 py-2.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all text-sm font-medium">
                            <LogOut className="w-5 h-5" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 bg-white dark:bg-zinc-900 border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
                    <div className="flex items-center gap-4 flex-1 max-w-xl">
                        <button
                            className="lg:hidden p-2 -ml-2 text-zinc-500"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        >
                            {isSidebarOpen ? <X /> : <Menu />}
                        </button>
                        <div className="relative group flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-accent" />
                            <input
                                type="text"
                                placeholder="Search transactions, accounts..."
                                className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-accent/20 transition-all outline-none"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400 border border-border px-1.5 py-0.5 rounded-md hidden sm:block">⌘K</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-white dark:border-zinc-900" />
                        </button>

                        <div className="h-8 w-px bg-border mx-2" />

                        <button className="flex items-center gap-2 pl-2 group">
                            <div className="w-8 h-8 rounded-lg bg-accent-secondary text-accent flex items-center justify-center font-bold text-xs uppercase">
                                NM
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-xs font-bold leading-none dark:text-white">Nishant</p>
                                <p className="text-[10px] text-zinc-400 font-medium tracking-tight">Pro Plan</p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                        </button>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-10">
                    {children}
                </main>
            </div>
        </div>
    );
}
