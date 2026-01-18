"use client";

import React, { useState } from "react";
import {
    X,
    Edit3,
    Trash2,
    Check,
    Brain,
    Tag,
    Wallet,
    Clock,
    ShieldCheck,
    Copy,
    Loader2
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { EntriesAPI } from "@/app/lib/api";

interface TransactionDetailsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: any;
}

export default function TransactionDetailsDrawer({ isOpen, onClose, transaction }: TransactionDetailsDrawerProps) {
    const [loading, setLoading] = useState(false);

    if (!transaction) return null;

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this transaction?")) return;
        setLoading(true);
        try {
            await EntriesAPI.delete(transaction.ID);
            onClose(); // Parent should refresh on close
        } catch (err) {
            console.error("Failed to delete", err);
            alert("Failed to delete transaction.");
            setLoading(false);
        }
    };

    const handleDuplicate = async () => {
        setLoading(true);
        try {
            const { ID, created_at, ...rest } = transaction;
            // Create copy
            await EntriesAPI.create({
                ...rest,
                date: new Date().toISOString().split('T')[0], // Today
                title: (rest.merchant || rest.title) + " (Copy)"
            });
            onClose();
        } catch (err) {
            console.error("Failed to duplicate", err);
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex justify-end">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-zinc-950/20 backdrop-blur-[2px]"
                    />

                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-md bg-white dark:bg-zinc-900 shadow-2xl h-screen flex flex-col border-l border-border"
                    >
                        {/* Drawer Header */}
                        <div className="p-8 border-b border-border flex items-center justify-between">
                            <h3 className="text-xl font-bold font-rounded">Transaction Details</h3>
                            <div className="flex items-center gap-2">
                                <button className="p-2.5 text-zinc-400 hover:text-accent hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all"><Edit3 className="w-5 h-5" /></button>
                                <button onClick={onClose} className="p-2.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl transition-all"><X className="w-5 h-5" /></button>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-10">
                            {/* Hero Detail */}
                            <div className="text-center space-y-4">
                                <div className="w-20 h-20 bg-accent/10 rounded-[2rem] flex items-center justify-center text-accent mx-auto shadow-sm">
                                    {transaction.merchant ? transaction.merchant[0] : (transaction.title?.[0] || <Wallet className="w-8 h-8" />)}
                                </div>
                                <div>
                                    <h4 className="text-2xl font-bold font-rounded">{transaction.merchant || transaction.title || "Untitled"}</h4>
                                    <p className="text-sm text-zinc-400 font-medium">{transaction.category}</p>
                                </div>
                                <h5 className={cn("text-4xl font-bold font-rounded", transaction.type === "income" ? "text-green-500" : "dark:text-white")}>
                                    ₹{transaction.amount}
                                </h5>
                            </div>

                            {/* Meta Grid */}
                            <div className="grid grid-cols-1 gap-6">
                                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-3xl space-y-4">
                                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-zinc-400">
                                        <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Timeline</span>
                                        <span className="text-zinc-900 dark:text-white">{transaction.date}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-zinc-400">
                                        <span className="flex items-center gap-2"><Wallet className="w-3.5 h-3.5" /> Account</span>
                                        <span className="text-zinc-900 dark:text-white">{transaction.mode || "Cash"}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-zinc-400">
                                        <span className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5" /> Status</span>
                                        <span className="text-green-500 flex items-center gap-1"><Check className="w-3 h-3" /> Confirmed</span>
                                    </div>
                                </div>

                                {transaction.needs_confirmation && (
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block ml-2 text-center">AI Extraction Insights</label>
                                        <div className="bg-accent/5 border border-accent/20 p-6 rounded-3xl relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform"><Brain className="w-12 h-12" /></div>
                                            <p className="text-xs font-medium text-zinc-500 leading-relaxed italic">
                                                "Automated extraction."
                                            </p>
                                            <div className="mt-4 flex items-center gap-4">
                                                <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-accent w-[90%] rounded-full shadow-sm" />
                                                </div>
                                                <span className="text-[10px] font-bold text-accent">90%</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between ml-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Attached Tags</label>
                                        <button className="text-[10px] font-bold uppercase tracking-widest text-accent hover:underline">+ Manage</button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {transaction.tags?.map((tag: string, i: number) => (
                                            <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-border text-xs font-bold rounded-xl shadow-sm">
                                                <Tag className="w-3 h-3 text-zinc-400" /> {tag}
                                            </span>
                                        ))}
                                        {(!transaction.tags || transaction.tags.length === 0) && <span className="text-xs text-zinc-400 px-3">No tags</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="p-8 border-t border-border bg-zinc-50 dark:bg-zinc-800/50 space-y-3">
                            <button
                                onClick={handleDuplicate}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-3 bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white py-4 rounded-2xl font-bold text-sm shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70"
                            >
                                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <><Copy className="w-4 h-4" /> Duplicate Transaction</>}
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-3 border border-red-500/20 text-red-500 py-4 rounded-2xl font-bold text-sm hover:bg-red-500/5 transition-all disabled:opacity-70"
                            >
                                <Trash2 className="w-4 h-4" /> Delete Permanently
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
