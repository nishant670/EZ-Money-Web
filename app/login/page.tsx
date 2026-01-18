"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail, Phone, ChevronRight, Smartphone, Lock, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { AuthAPI } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";

export default function LoginPage() {
    const router = useRouter();
    const { login, loginAsGuest } = useAuth();

    // States
    const [step, setStep] = useState(1); // 1: Choice, 2: Identify, 3: OTP, 4: PIN/Create PIN
    const [loginType, setLoginType] = useState<"email" | "phone">("phone");
    const [identifier, setIdentifier] = useState("");
    const [otp, setOtp] = useState("");
    const [pin, setPin] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isNewUser, setIsNewUser] = useState(false);
    const [claimToken, setClaimToken] = useState<string | null>(null);

    // Handlers
    const handleIdentify = async () => {
        if (!identifier) return setError("Please enter your details.");
        setIsLoading(true);
        setError(null);
        try {
            const res = await AuthAPI.identify(identifier);
            if (res.data.exists) {
                // Existing User: Go to Login (PIN) directly if OTP logic differs, 
                // but standard flow here seems to be check -> if exists -> Login(PIN). 
                // However, based on API, Login requires PIN. Some flows might require OTP first if forgotten.
                // Let's assume for this web dashboard we ask for PIN directly if they exist.
                // Wait, typically we might want OTP for 2FA or just PIN? 
                // API `authLogin` takes identifier + pin. So we can skip OTP for existing user login 
                // UNLESS we want to verify device. Let's start simple:
                // Identify -> Exists? -> PIN Input -> Login.
                setIsNewUser(false);
                setStep(4); // Go to PIN
            } else {
                // New User: Send OTP
                setIsNewUser(true);
                await AuthAPI.sendOTP(identifier);
                setStep(3); // Go to OTP
            }
        } catch (err) {
            console.error(err);
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp || otp.length < 4) return setError("Invalid OTP");
        setIsLoading(true);
        setError(null);
        try {
            const res = await AuthAPI.verifyOTP(identifier, otp);
            setClaimToken(res.data.claim_token);
            setStep(4); // Go to PIN creation
        } catch (err) {
            setError("Invalid OTP. Try '1234'."); // hinting for mock
        } finally {
            setIsLoading(false);
        }
    };

    const handleFinalAuth = async () => {
        if (!pin || pin.length < 4) return setError("PIN must be 4 digits");
        setIsLoading(true);
        setError(null);
        try {
            let res;
            if (isNewUser) {
                if (!claimToken) return setError("Session expired. Restart.");
                res = await AuthAPI.register({
                    claim_token: claimToken,
                    pin: pin,
                    biometrics_enabled: false
                });
            } else {
                res = await AuthAPI.login({
                    identifier,
                    pin
                });
            }
            login(res.data.token, res.data.user);
            router.push("/dashboard");
        } catch (err) {
            setError("Authentication failed. Check PIN.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGuest = async () => {
        setIsLoading(true);
        try {
            await loginAsGuest();
        } catch (err) {
            setError("Guest login failed.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDF5F7] dark:bg-zinc-950 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl shadow-accent/5 overflow-hidden border border-border flex flex-col min-h-[600px]">
                <div className="p-10 flex-1 flex flex-col">
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

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-3 bg-red-50 text-red-500 rounded-xl text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <button
                                onClick={() => { setLoginType("email"); setStep(2); setError(null); }}
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
                                onClick={() => { setLoginType("phone"); setStep(2); setError(null); }}
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

                            <button
                                onClick={handleGuest}
                                disabled={isLoading}
                                className="w-full flex flex-col items-center justify-center p-6 bg-accent-secondary rounded-2xl border-2 border-dashed border-accent/20 hover:bg-accent/5 transition-all group disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-6 h-6 animate-spin text-accent" />
                                ) : (
                                    <>
                                        <p className="font-bold text-accent text-lg">Continue as guest demo</p>
                                        <p className="text-sm text-accent/60 mt-1">Exploration with sample data</p>
                                        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-accent group-hover:gap-3 transition-all">
                                            ENTER DASHBOARD <ArrowRight className="w-3 h-3" />
                                        </div>
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {step === 2 && (
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
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl pl-12 pr-4 py-4 text-lg focus:ring-2 focus:ring-accent/20 transition-all outline-none"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleIdentify}
                                disabled={isLoading}
                                className="w-full bg-accent text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 flex justify-center"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : "Continue"}
                            </button>

                            <button
                                onClick={() => setStep(1)}
                                className="w-full text-zinc-400 hover:text-accent font-medium text-sm transition-colors"
                            >
                                Back to choices
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="text-center">
                                <h2 className="text-xl font-bold">Verify OTP</h2>
                                <p className="text-zinc-500 text-sm mt-1">Sent to {identifier}</p>
                            </div>

                            <input
                                type="text"
                                placeholder="Enter OTP (1234)"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-4 py-4 text-center text-2xl tracking-[0.5em] font-bold focus:ring-2 focus:ring-accent/20 transition-all outline-none"
                                autoFocus
                                maxLength={6}
                            />

                            <button
                                onClick={handleVerifyOTP}
                                disabled={isLoading}
                                className="w-full bg-accent text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 flex justify-center"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : "Verify Code"}
                            </button>
                            <button
                                onClick={() => setStep(2)}
                                className="w-full text-zinc-400 hover:text-accent font-medium text-sm transition-colors"
                            >
                                Change {loginType}
                            </button>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="text-center">
                                <h2 className="text-xl font-bold">{isNewUser ? "Create 4-Digit PIN" : "Enter PIN"}</h2>
                                <p className="text-zinc-500 text-sm mt-1">{isNewUser ? "Secure your account" : "Welcome back!"}</p>
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                                <input
                                    type="password"
                                    placeholder="••••"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl pl-12 pr-4 py-4 text-center text-2xl tracking-[0.5em] font-bold focus:ring-2 focus:ring-accent/20 transition-all outline-none"
                                    autoFocus
                                    maxLength={4}
                                />
                            </div>

                            <button
                                onClick={handleFinalAuth}
                                disabled={isLoading}
                                className="w-full bg-accent text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 flex justify-center"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : (isNewUser ? "Create Account" : "Login")}
                            </button>
                            <button
                                onClick={() => setStep(2)}
                                className="w-full text-zinc-400 hover:text-accent font-medium text-sm transition-colors"
                            >
                                Back
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
