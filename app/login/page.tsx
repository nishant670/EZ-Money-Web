"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail, Phone, Lock, ChevronRight, Smartphone } from "lucide-react";
import { cn } from "@/app/lib/utils";

export default function LoginPage() {
    const [step, setStep] = useState(1); // 1: Login choice, 2: Details
    const [loginType, setLoginType] = useState<"email" | "phone" | null>(null);

    return (
        <div className="min-h-screen bg-[#FDF5F7] dark:bg-zinc-950 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl shadow-accent/5 overflow-hidden border border-border">
                <div className="p-10">
                    <div className="flex justify-center mb-8">
                        <Link href="/" className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 relative bg-accent rounded-2xl flex items-center justify-center shadow-2xl shadow-accent/20">
                                <Image src="/logo.png" alt="Finnri" fill className="p-2 object-contain" />
                            </div>
                            <div className="text-center">
                                <h1 className="text-3xl font-bold font-rounded tracking-tight">Finnri</h1>
                                <p className="text-sm text-zinc-400 font-medium tracking-tight mt-1">Money, made intelligent.</p>
                            </div>
                        </Link>
                    </div>

                    {step === 1 ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <button
                                onClick={() => { setLoginType("email"); setStep(2); }}
                                className="w-full group flex items-center justify-between p-5 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-transparent hover:border-accent/30 hover:bg-white dark:hover:bg-zinc-800 transition-all text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg leading-none">Login via Email</p>
                                        <p className="text-sm text-zinc-400 mt-1">Get an OTP on your email</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                            </button>

                            <button
                                onClick={() => { setLoginType("phone"); setStep(2); }}
                                className="w-full group flex items-center justify-between p-5 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-transparent hover:border-accent/30 hover:bg-white dark:hover:bg-zinc-800 transition-all text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg leading-none">Login via Phone</p>
                                        <p className="text-sm text-zinc-400 mt-1">Quick sign-in with mobile</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                            </button>

                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
                                <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold text-zinc-300 bg-white dark:bg-zinc-900 px-4">Or</div>
                            </div>

                            <Link
                                href="/dashboard"
                                className="w-full flex flex-col items-center justify-center p-6 bg-accent-secondary rounded-2xl border-2 border-dashed border-accent/20 hover:bg-accent/5 transition-all group"
                            >
                                <p className="font-bold text-accent text-lg">Continue as guest demo</p>
                                <p className="text-sm text-accent/60 mt-1">Exploration with sample data</p>
                                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-accent group-hover:gap-3 transition-all">
                                    ENTER DASHBOARD <ArrowRight className="w-3 h-3" />
                                </div>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div>
                                <label className="block text-sm font-bold mb-2">
                                    {loginType === "email" ? "Email Address" : "Phone Number"}
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                                        {loginType === "email" ? <Mail className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                                    </div>
                                    <input
                                        type={loginType === "email" ? "email" : "tel"}
                                        placeholder={loginType === "email" ? "name@company.com" : "+91 99999 99999"}
                                        className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl pl-12 pr-4 py-4 text-lg focus:ring-2 focus:ring-accent/20 transition-all outline-none"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(1)}
                                className="w-full bg-accent text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Send OTP
                            </button>

                            <button
                                onClick={() => setStep(1)}
                                className="w-full text-zinc-400 hover:text-accent font-medium text-sm transition-colors"
                            >
                                Back to choices
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-8 bg-zinc-50 dark:bg-zinc-800/50 border-t border-border flex items-center gap-4">
                    <div className="w-10 h-10 bg-white dark:bg-zinc-700 rounded-xl flex items-center justify-center text-accent shrink-0">
                        <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold leading-none mb-1">Coming from Mobile?</p>
                        <p className="text-[10px] text-zinc-400 leading-tight">Use the same credentials to sync your data instantly.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
