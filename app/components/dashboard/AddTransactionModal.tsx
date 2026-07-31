"use client";

import React, { useEffect, useState } from "react";
import {
    X,
    Info,
    Plus,
    Check,
    Brain,
    Search,
    Zap,
    Tag,
    Calendar,
    Wallet,
    ArrowRight,
    Loader2
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Account, AccountsAPI, apiErrorMessage, EntriesAPI, EntrySplitInput, SplitAPI, SplitFriend, SplitGroup } from "@/app/lib/api";
import InlineSplitEditor from "@/app/components/dashboard/InlineSplitEditor";

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddTransactionModal({ isOpen, onClose }: AddTransactionModalProps) {
    const [mode, setMode] = useState<"quick" | "manual">("quick");
    const [extracting, setExtracting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [text, setText] = useState("");
    const [success, setSuccess] = useState(false);

    // Form State
    const [type, setType] = useState<"expense" | "income">("expense");
    const [amount, setAmount] = useState("");
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Food & Drinks");
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16));
    const [accountID, setAccountID] = useState<number | "">("");
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [splitFriends, setSplitFriends] = useState<SplitFriend[]>([]);
    const [splitGroups, setSplitGroups] = useState<SplitGroup[]>([]);
    const [entrySplit, setEntrySplit] = useState<EntrySplitInput | null>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState("");
    const [showTagInput, setShowTagInput] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isOpen) return;
        let active = true;
        Promise.allSettled([AccountsAPI.list(), SplitAPI.listFriends(), SplitAPI.listGroups()]).then(([accountsResult, friendsResult, groupsResult]) => {
            if (!active) return;
            if (accountsResult.status === "fulfilled") {
                setAccounts(accountsResult.value.data);
                const preferred = accountsResult.value.data.find((item) => item.is_default) || accountsResult.value.data[0];
                setAccountID((current) => current || preferred?.id || "");
            } else setError(apiErrorMessage(accountsResult.reason, "We couldn’t load your accounts."));
            if (friendsResult.status === "fulfilled") setSplitFriends(friendsResult.value.data);
            if (groupsResult.status === "fulfilled") setSplitGroups(groupsResult.value.data);
        });
        return () => { active = false; };
    }, [isOpen]);

    const resetForm = () => {
        setText("");
        setType("expense");
        setAmount("");
        setTitle("");
        setCategory("Food & Drinks");
        setDate(new Date().toISOString().slice(0, 16));
        setAccountID("");
        setTags([]);
        setEntrySplit(null);
        setMode("quick");
        setSuccess(false);
        setError("");
    };

    const handleExtract = async () => {
        if (!text.trim()) return;
        setExtracting(true);
        try {
            const formData = new FormData();
            formData.append("hint_text", text);
            // formData.append("timezone", ...); // Backend handles timezone usually?

            const res = await EntriesAPI.parse(formData);
            const data = res.data; // Should return a partial Transaction/Entry

            // Map response to form
            if (data) {
                if (data.type) setType(data.type as "expense" | "income");
                if (data.amount) setAmount(data.amount.toString());
                if (data.title || data.merchant) setTitle(data.merchant || data.title || "");
                if (data.category) setCategory(data.category);
                if (data.date) setDate(data.date + (data.time ? "T" + data.time : "T12:00")); // Rough iso conversion
                if (data.account_hint || data.mode) {
                    const hint = (data.account_hint || data.mode || "").toLowerCase();
                    const match = accounts.find((item) => item.name.toLowerCase().includes(hint) || item.type.replace("_", " ").includes(hint));
                    if (match) setAccountID(match.id);
                }
                if (data.tags) setTags(data.tags);
            }
            setMode("manual");
        } catch (requestError) {
            setError(apiErrorMessage(requestError, "AI extraction is unavailable. You can still enter the transaction manually."));
            setMode("manual");
        } finally {
            setExtracting(false);
        }
    };

    const handleSave = async () => {
        if (!amount || !title || !accountID) {
            setError("Amount, merchant, and account are required.");
            return;
        }
        const numericAmount = parseFloat(amount);
        if (entrySplit) {
            const invalidParticipant = entrySplit.participants.some((participant) => !participant.friend_id || participant.share_amount <= 0);
            const totalShares = entrySplit.participants.reduce((sum, participant) => sum + Number(participant.share_amount || 0), 0);
            if (invalidParticipant) { setError("Choose a friend and positive share for every split participant."); return; }
            if (totalShares > numericAmount) { setError("Friend shares cannot exceed the transaction amount."); return; }
        }
        setSaving(true);
        setError("");
        try {
            const selectedAccount = accounts.find((item) => item.id === accountID);
            const entryMode = selectedAccount?.type === "upi" ? "UPI" : selectedAccount?.type === "credit_card" || selectedAccount?.type === "debit_card" || selectedAccount?.type === "bank" ? "Credit Card" : selectedAccount?.type === "wallet" ? "Wallets" : "Cash";
            await EntriesAPI.create({
                type,
                amount: numericAmount,
                currency: "INR",
                source: text.trim() ? "text" : "manual",
                title, // or merchant
                merchant: title,
                category,
                date: date.split("T")[0],
                time: date.split("T")[1] || "00:00:00",
                mode: entryMode,
                account_id: accountID,
                tags,
                split: type === "expense" ? entrySplit || undefined : undefined,
            });
            setSuccess(true);
            setTimeout(() => {
                onClose();
                resetForm();
            }, 1000);
        } catch (requestError) {
            setError(apiErrorMessage(requestError, "We couldn’t save this transaction."));
        } finally {
            setSaving(false);
        }
    };

    // Add Tag
    const handleAddTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag("");
            setShowTagInput(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-[3rem] shadow-2xl overflow-hidden border border-border max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-border flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50 sticky top-0 z-10 backdrop-blur-md">
                            <div>
                                <h3 className="text-2xl font-bold font-rounded">Add Transaction</h3>
                                <p className="text-sm text-zinc-500 font-medium">Capture your expenses & income instantly.</p>
                            </div>
                            <button onClick={onClose} className="p-3 bg-white dark:bg-zinc-700 rounded-2xl hover:text-accent transition-colors shadow-sm">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Mode Switcher */}
                        <div className="px-8 pt-8">
                            <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-2xl">
                                <button
                                    onClick={() => setMode("quick")}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
                                        mode === "quick" ? "bg-white dark:bg-zinc-700 text-accent shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                                    )}
                                >
                                    <Brain className="w-4 h-4" /> Quick Add
                                </button>
                                <button
                                    onClick={() => setMode("manual")}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
                                        mode === "manual" ? "bg-white dark:bg-zinc-700 text-accent shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                                    )}
                                >
                                    <Plus className="w-4 h-4" /> Manual Entry
                                </button>
                            </div>
                        </div>

                        <div className="p-8 min-h-[400px]">
                            {mode === "quick" ? (
                                <div className="space-y-8 animate-in fade-in duration-500">
                                    <div className="relative">
                                        <textarea
                                            value={text}
                                            onChange={(e) => setText(e.target.value)}
                                            placeholder="Paste transaction text here... e.g. 'Paid 250 lunch UPI'"
                                            className="w-full h-48 bg-zinc-50 dark:bg-zinc-800 border-none rounded-[2rem] p-8 text-xl font-medium outline-none focus:ring-4 focus:ring-accent/10 transition-all resize-none placeholder:text-zinc-300"
                                        />
                                        <div className="absolute top-6 left-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-2 py-0.5 rounded-full pointer-events-none">
                                            <Zap className="w-3 h-3" /> AI Engine Ready
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <button
                                            onClick={handleExtract}
                                            disabled={extracting || !text}
                                            className={cn(
                                                "flex items-center justify-center gap-3 bg-accent text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-accent/20 transition-all",
                                                (extracting || !text) ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.98]"
                                            )}
                                        >
                                            {extracting ? (
                                                <div className="flex items-center gap-3">
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Extracting...
                                                </div>
                                            ) : (
                                                <>
                                                    <Brain className="w-6 h-6" />
                                                    Extract with AI
                                                </>
                                            )}
                                        </button>
                                        <div className="flex items-center gap-4 px-6 bg-zinc-50 dark:bg-zinc-800 rounded-2xl text-zinc-400">
                                            <Info className="w-5 h-5 shrink-0" />
                                            <p className="text-xs font-medium leading-snug">Simply paste messages or type notes. Our AI will fill the form.</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Type</label>
                                            <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                                                <button
                                                    onClick={() => setType("expense")}
                                                    className={cn("flex-1 py-2 text-xs font-bold rounded-lg transition-all", type === "expense" ? "bg-white dark:bg-zinc-700 text-accent shadow-sm" : "text-zinc-400")}
                                                >
                                                    Expense
                                                </button>
                                                <button
                                                    onClick={() => { setType("income"); setEntrySplit(null); }}
                                                    className={cn("flex-1 py-2 text-xs font-bold rounded-lg transition-all", type === "income" ? "bg-white dark:bg-zinc-700 text-green-500 shadow-sm" : "text-zinc-400")}
                                                >
                                                    Income
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Amount</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-zinc-400">₹</span>
                                                <input
                                                    type="number"
                                                    placeholder="0.00"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl pl-8 pr-4 py-3 text-lg font-bold outline-none focus:ring-2 focus:ring-accent/20"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Merchant / Title</label>
                                            <div className="relative">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Starbucks"
                                                    value={title}
                                                    onChange={(e) => setTitle(e.target.value)}
                                                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Category</label>
                                            <select
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                                            >
                                                <option>Food & Drinks</option>
                                                <option>Shopping</option>
                                                <option>Electronics</option>
                                                <option>Bills</option>
                                                <option>Transport</option>
                                                <option>Entertainment</option>
                                                <option>Health</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Date & Time</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                                <input
                                                    type="datetime-local"
                                                    value={date}
                                                    onChange={(e) => setDate(e.target.value)}
                                                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Account</label>
                                            <div className="relative">
                                                <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                                <select
                                                    value={accountID}
                                                    onChange={(e) => setAccountID(Number(e.target.value))}
                                                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                                                >
                                                    <option value="" disabled>Select an account</option>
                                                    {accounts.map((item) => <option key={item.id} value={item.id}>{item.name}{item.is_default ? " (Default)" : ""}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {type === "expense" && <InlineSplitEditor amount={Number(amount || 0)} friends={splitFriends} groups={splitGroups} value={entrySplit} onChange={setEntrySplit} />}

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Tags</label>
                                        <div className="flex flex-wrap gap-2">
                                            {tags.map((tag, i) => (
                                                <span key={i} onClick={() => setTags(tags.filter(t => t !== tag))} className="flex items-center gap-1.5 px-3 py-1 bg-accent/10 text-accent text-xs font-bold rounded-lg group cursor-pointer hover:bg-red-500/10 hover:text-red-500 transition-colors">
                                                    <Tag className="w-3 h-3" /> {tag} <X className="w-2.5 h-2.5 ml-1" />
                                                </span>
                                            ))}
                                            {showTagInput ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        value={newTag}
                                                        onChange={(e) => setNewTag(e.target.value)}
                                                        onBlur={handleAddTag}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                                                        placeholder="New tag..."
                                                        className="w-24 px-2 py-1 bg-white border border-accent rounded-lg text-xs outline-none"
                                                    />
                                                </div>
                                            ) : (
                                                <button onClick={() => setShowTagInput(true)} className="flex items-center gap-1.5 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-xs font-bold rounded-lg border border-dashed border-zinc-300 hover:border-accent transition-colors">
                                                    <Plus className="w-3 h-3" /> Add tag
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {error && <p className="mx-8 mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30">{error}</p>}

                        {/* Footer */}
                        <div className="p-8 border-t border-border bg-zinc-50 dark:bg-zinc-800/50 flex justify-between items-center sticky bottom-0 z-10">
                            <button onClick={onClose} className="px-6 py-3 text-sm font-bold text-zinc-400 hover:text-zinc-900 transition-colors">Cancel</button>
                            <div className="flex gap-4">
                                <button
                                    onClick={handleSave}
                                    disabled={saving || mode === "quick" || !accountID}
                                    className={cn(
                                        "group flex items-center justify-center gap-2 px-10 py-3 bg-accent text-white rounded-xl font-bold text-sm shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-70",
                                        success && "bg-green-500 shadow-green-500/20"
                                    )}
                                >
                                    {saving ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : success ? (
                                        <>
                                            <Check className="w-5 h-5" /> Saved!
                                        </>
                                    ) : (
                                        <>
                                            Save Transaction
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
