"use client";

import React from "react";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import {
    User,
    MapPin,
    Globe,
    Shield,
    Database,
    Bell,
    Eye,
    ChevronRight,
    Monitor,
    Smartphone,
    CreditCard,
    LogOut,
    Save
} from "lucide-react";
import { cn } from "@/app/lib/utils";

export default function SettingsScreen() {
    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-10 pb-20">
                <div>
                    <h1 className="text-3xl font-bold font-rounded tracking-tight dark:text-white">Settings</h1>
                    <p className="text-zinc-500 text-sm font-medium mt-1">Personalize your experience and manage your data.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Navigation Links */}
                    <div className="space-y-2">
                        {[
                            { name: "My Profile", icon: User },
                            { name: "Currency & Locale", icon: Globe },
                            { name: "Security", icon: Shield },
                            { name: "Sync & Data", icon: Database },
                            { name: "Notifications", icon: Bell },
                            { name: "Privacy", icon: Eye },
                        ].map((item, i) => (
                            <button key={i} className={cn(
                                "flex items-center justify-between w-full px-4 py-3.5 rounded-2xl transition-all group",
                                i === 0 ? "bg-accent/10 text-accent" : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                            )}>
                                <div className="flex items-center gap-4">
                                    <item.icon className={cn("w-5 h-5", i === 0 ? "text-accent" : "text-zinc-400 group-hover:text-zinc-900 transition-colors")} />
                                    <span className="text-sm font-bold">{item.name}</span>
                                </div>
                                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        {/* Profile Details Card */}
                        <div className="bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] border border-border shadow-sm">
                            <div className="flex flex-col sm:flex-row items-center gap-8 mb-10">
                                <div className="w-24 h-24 rounded-[2rem] bg-accent-secondary flex items-center justify-center text-accent text-3xl font-bold font-rounded relative group cursor-pointer shadow-xl shadow-accent/10">
                                    NM
                                    <div className="absolute inset-0 bg-black/40 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold uppercase">Change</div>
                                </div>
                                <div className="text-center sm:text-left">
                                    <h3 className="text-2xl font-bold font-rounded">Nishant Munjal</h3>
                                    <p className="text-zinc-500 text-sm font-medium">nishant@example.com • +91 99999 00000</p>
                                    <div className="flex items-center gap-2 mt-4 justify-center sm:justify-start">
                                        <span className="bg-accent/10 text-accent text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">Pro Member</span>
                                        <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">Beta User</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">First Name</label>
                                    <input type="text" defaultValue="Nishant" className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-5 py-3.5 text-sm outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Last Name</label>
                                    <input type="text" defaultValue="Munjal" className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-5 py-3.5 text-sm outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium" />
                                </div>
                                <div className="sm:col-span-2 space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Residence</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                        <input type="text" defaultValue="Bangalore, Karnataka, India" className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl pl-12 pr-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium" />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 pt-8 border-t border-border flex justify-end gap-3">
                                <button className="px-6 py-3 rounded-xl text-sm font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">Discard Changes</button>
                                <button className="flex items-center gap-2 bg-accent text-white px-8 py-3 rounded-xl font-bold text-sm shadow-xl shadow-accent/20 hover:scale-105 transition-all">
                                    <Save className="w-4 h-4" />
                                    Save Settings
                                </button>
                            </div>
                        </div>

                        {/* Preferences Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-border">
                                <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 mb-6">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <h4 className="text-lg font-bold font-rounded mb-2">Language & Currency</h4>
                                <p className="text-sm text-zinc-500 mb-6">Set your defaults for tracking.</p>
                                <div className="space-y-3">
                                    <button className="w-full flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-xs font-bold">
                                        <span>Primary Currency</span>
                                        <span className="text-accent underline">INR (₹)</span>
                                    </button>
                                    <button className="w-full flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-xs font-bold">
                                        <span>Locale Language</span>
                                        <span className="text-accent underline">English (IN)</span>
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-border">
                                <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 mb-6">
                                    <Monitor className="w-5 h-5" />
                                </div>
                                <h4 className="text-lg font-bold font-rounded mb-2">Display Theme</h4>
                                <p className="text-sm text-zinc-500 mb-6">Choose how Finnri looks to you.</p>
                                <div className="flex gap-2">
                                    <button className="flex-1 p-2 border-2 border-accent bg-accent/5 rounded-xl text-[10px] font-bold text-accent uppercase tracking-widest shadow-sm">Light</button>
                                    <button className="flex-1 p-2 border-2 border-border rounded-xl text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Dark</button>
                                    <button className="flex-1 p-2 border-2 border-border rounded-xl text-[10px] font-bold text-zinc-400 uppercase tracking-widest">System</button>
                                </div>
                            </div>
                        </div>

                        {/* Dangerous Area */}
                        <div className="p-8 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-red-500 shadow-sm shadow-red-500/10">
                                    <LogOut className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-red-600 dark:text-red-400 leading-tight">Sign out of all devices</h4>
                                    <p className="text-xs text-red-500/60 font-medium">Logged in on iPhone 15, MacBook Pro and 2 others.</p>
                                </div>
                            </div>
                            <button className="bg-red-500 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-xl shadow-red-500/20 hover:scale-105 transition-all w-full sm:w-auto">Logout Everywhere</button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
