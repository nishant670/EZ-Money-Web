"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
    CheckCheck,
    ChevronDown,
    LogOut,
    Inbox
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import { useAuth } from "@/app/context/AuthContext";
import { AppNotification, NotificationsAPI } from "@/app/lib/api";

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
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
    const notificationPanelRef = useRef<HTMLDivElement | null>(null);
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();

    const loadNotifications = async () => {
        setIsNotificationsLoading(true);
        try {
            const res = await NotificationsAPI.list("all");
            setNotifications(res.data.notifications.slice(0, 5));
            setUnreadCount(res.data.unread_count);
        } catch (error) {
            console.error("Failed to load notifications", error);
        } finally {
            setIsNotificationsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            loadNotifications();
        }
    }, [user, pathname]);

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (
                notificationPanelRef.current &&
                !notificationPanelRef.current.contains(event.target as Node)
            ) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const formatNotificationTime = (value: string) => {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "";
        const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000);
        if (diffMinutes < 1) return "Just now";
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    };

    const handleNotificationClick = async (notification: AppNotification) => {
        try {
            if (!notification.read_at) {
                await NotificationsAPI.markRead(notification.id);
            }
            await loadNotifications();
            setIsNotificationsOpen(false);
            const entryMatch = notification.action_url?.match(/^\/entry\/(\d+)$/);
            if (entryMatch) {
                router.push("/dashboard/transactions");
            }
        } catch (error) {
            console.error("Failed to open notification", error);
        }
    };

    const handleMarkAllRead = async () => {
        if (unreadCount === 0) return;
        try {
            await NotificationsAPI.markAllRead();
            await loadNotifications();
        } catch (error) {
            console.error("Failed to mark notifications read", error);
        }
    };

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
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 w-full px-3 py-2.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all text-sm font-medium"
                        >
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
                        <div className="relative" ref={notificationPanelRef}>
                            <button
                                onClick={() => setIsNotificationsOpen((open) => !open)}
                                className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors relative"
                                aria-label="Notifications"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 rounded-full bg-accent px-1 text-[10px] font-bold text-white flex items-center justify-center border-2 border-white dark:border-zinc-900">
                                        {unreadCount > 99 ? "99+" : unreadCount}
                                    </span>
                                )}
                            </button>

                            {isNotificationsOpen && (
                                <div className="absolute right-0 mt-3 w-[360px] max-w-[calc(100vw-2rem)] bg-white dark:bg-zinc-900 border border-border rounded-2xl shadow-2xl shadow-zinc-900/10 overflow-hidden z-50">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                                        <div>
                                            <p className="text-sm font-bold dark:text-white">Notifications</p>
                                            <p className="text-xs text-zinc-400">{unreadCount} unread</p>
                                        </div>
                                        <button
                                            onClick={handleMarkAllRead}
                                            disabled={unreadCount === 0}
                                            className="p-2 rounded-xl text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40"
                                            aria-label="Mark all read"
                                        >
                                            <CheckCheck className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="max-h-[360px] overflow-y-auto">
                                        {isNotificationsLoading ? (
                                            <div className="p-6 text-center text-sm text-zinc-400">Loading notifications...</div>
                                        ) : notifications.length === 0 ? (
                                            <div className="p-8 text-center">
                                                <Inbox className="w-8 h-8 mx-auto text-zinc-300 mb-3" />
                                                <p className="text-sm font-bold text-zinc-500">No notifications yet</p>
                                            </div>
                                        ) : (
                                            notifications.map((notification) => {
                                                const unread = !notification.read_at;
                                                return (
                                                    <button
                                                        key={notification.id}
                                                        onClick={() => handleNotificationClick(notification)}
                                                        className="w-full text-left px-4 py-3 flex gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-b border-border last:border-b-0"
                                                    >
                                                        <span className={cn(
                                                            "mt-1 h-2 w-2 rounded-full shrink-0",
                                                            unread ? "bg-accent" : "bg-transparent"
                                                        )} />
                                                        <span className="min-w-0 flex-1">
                                                            <span className="flex items-start justify-between gap-3">
                                                                <span className="text-sm font-bold dark:text-white truncate">{notification.title}</span>
                                                                <span className="text-[11px] text-zinc-400 shrink-0">{formatNotificationTime(notification.created_at)}</span>
                                                            </span>
                                                            <span className="mt-1 block text-xs leading-5 text-zinc-500 line-clamp-2">{notification.body}</span>
                                                        </span>
                                                    </button>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="h-8 w-px bg-border mx-2" />

                        <button className="flex items-center gap-2 pl-2 group">
                            <div className="w-8 h-8 rounded-lg bg-accent-secondary text-accent flex items-center justify-center font-bold text-xs uppercase">
                                {user?.username?.substring(0, 2).toUpperCase() || "GU"}
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-xs font-bold leading-none dark:text-white">{user?.username || "Guest User"}</p>
                                <p className="text-[10px] text-zinc-400 font-medium tracking-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]">{user?.is_guest ? "Guest Mode" : (user?.email || user?.phone || "Pro Plan")}</p>
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
