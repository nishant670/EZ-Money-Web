"use client";

import React, { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    ChevronRight,
    KeyRound,
    Loader2,
    Lock,
    Mail,
    Phone,
    ShieldCheck,
    Smartphone,
    UserRound,
} from "lucide-react";
import { apiErrorMessage, AuthAPI } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";

type LoginStep = "choice" | "identifier" | "otp" | "pin";
type AuthMode = "login" | "register" | "reset";

function webDeviceID() {
    const existing = localStorage.getItem("finnri_web_device_id");
    if (existing) return existing;
    const created = `web_${crypto.randomUUID()}`;
    localStorage.setItem("finnri_web_device_id", created);
    return created;
}

export default function LoginPage() {
    const router = useRouter();
    const { login, loginAsGuest, user } = useAuth();
    const [step, setStep] = useState<LoginStep>("choice");
    const [authMode, setAuthMode] = useState<AuthMode>("login");
    const [loginType, setLoginType] = useState<"email" | "phone">("email");
    const [identifier, setIdentifier] = useState("");
    const [otp, setOtp] = useState("");
    const [pin, setPin] = useState("");
    const [devOTP, setDevOTP] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const normalizedIdentifier = () => loginType === "email"
        ? identifier.trim().toLowerCase()
        : identifier.replace(/[\s()-]/g, "").trim();

    const validateIdentifier = (value: string) => {
        if (loginType === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address.";
        if (loginType === "phone" && value.replace(/\D/g, "").length < 8) return "Enter a valid phone number with country code.";
        return "";
    };

    const sendCode = async (value: string) => {
        const response = await AuthAPI.sendOTP(value);
        setDevOTP(response.data.dev_otp || "");
        setOtp("");
    };

    const handleIdentify = async (event: FormEvent) => {
        event.preventDefault();
        const value = normalizedIdentifier();
        const validationError = validateIdentifier(value);
        if (validationError) { setError(validationError); return; }
        setIsLoading(true); setError(null);
        try {
            setIdentifier(value);
            const response = await AuthAPI.identify(value);
            if (response.data.exists) {
                setAuthMode("login");
                setPin("");
                setStep("pin");
            } else {
                await sendCode(value);
                setAuthMode("register");
                setStep("otp");
            }
        } catch (requestError) {
            setError(apiErrorMessage(requestError, "We couldn’t check this account."));
        } finally { setIsLoading(false); }
    };

    const handleVerifyOTP = async (event: FormEvent) => {
        event.preventDefault();
        if (!/^\d{6}$/.test(otp)) { setError("Enter the 6-digit verification code."); return; }
        setIsLoading(true); setError(null);
        try {
            const response = await AuthAPI.verifyOTP(identifier, otp);
            sessionStorage.setItem("finnri_claim_token", response.data.claim_token);
            setPin("");
            setStep("pin");
        } catch (requestError) {
            setError(apiErrorMessage(requestError, "That verification code was not accepted."));
        } finally { setIsLoading(false); }
    };

    const handleFinalAuth = async (event: FormEvent) => {
        event.preventDefault();
        if (!/^\d{4}$/.test(pin)) { setError("Enter a 4-digit PIN."); return; }
        if (authMode !== "login" && /^(\d)\1{3}$/.test(pin)) { setError("Choose a PIN with more than one distinct digit."); return; }
        setIsLoading(true); setError(null);
        try {
            const deviceID = webDeviceID();
            let response;
            if (authMode === "register") {
                const claimToken = sessionStorage.getItem("finnri_claim_token");
                if (!claimToken) throw new Error("missing_claim");
                response = await AuthAPI.register({
                    claim_token: claimToken,
                    pin,
                    guest_uuid: user?.is_guest ? user.uuid : undefined,
                    device_id: deviceID,
                    biometrics_enabled: false,
                });
            } else if (authMode === "reset") {
                const claimToken = sessionStorage.getItem("finnri_claim_token");
                if (!claimToken) throw new Error("missing_claim");
                response = await AuthAPI.resetPIN({ claim_token: claimToken, pin, device_id: deviceID });
            } else {
                response = await AuthAPI.login({ identifier, pin, device_id: deviceID });
            }
            sessionStorage.removeItem("finnri_claim_token");
            login(response.data.token, response.data.user);
            router.replace("/dashboard");
        } catch (requestError) {
            setError(apiErrorMessage(requestError, authMode === "login" ? "Authentication failed. Check your PIN." : "Your verification session expired. Request a new code."));
        } finally { setIsLoading(false); }
    };

    const beginReset = async () => {
        setIsLoading(true); setError(null);
        try {
            await sendCode(identifier);
            setAuthMode("reset");
            setStep("otp");
        } catch (requestError) {
            setError(apiErrorMessage(requestError, "We couldn’t send a reset code."));
        } finally { setIsLoading(false); }
    };

    const resendCode = async () => {
        setIsLoading(true); setError(null);
        try { await sendCode(identifier); }
        catch (requestError) { setError(apiErrorMessage(requestError, "We couldn’t resend the code.")); }
        finally { setIsLoading(false); }
    };

    const chooseType = (type: "email" | "phone") => {
        setLoginType(type); setIdentifier(""); setError(null); setStep("identifier");
    };

    return (
        <main className="min-h-screen bg-[#FDF5F7] p-4 dark:bg-zinc-950 sm:grid sm:place-items-center sm:p-6">
            <div className="mx-auto flex min-h-[680px] w-full max-w-md flex-col overflow-hidden rounded-[2rem] border border-border bg-white shadow-2xl shadow-accent/5 dark:bg-zinc-900 sm:rounded-[2.5rem]">
                <div className="flex-1 p-6 sm:p-9">
                    <Link href="/" className="mx-auto flex w-fit flex-col items-center gap-3">
                        <span className="relative grid h-16 w-36 place-items-center overflow-hidden rounded-2xl bg-zinc-950 shadow-xl shadow-zinc-950/15 dark:bg-zinc-800"><Image src="/finnri-logo.png" alt="Finnri" fill sizes="144px" className="scale-[2.35] object-contain" priority /></span>
                        <span className="text-center text-xs font-medium text-zinc-400">Your money, understood.</span>
                    </Link>

                    <div className="mt-8">
                        {error && <div role="alert" className="mb-5 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600 dark:bg-red-950/30 dark:text-red-300"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div>}

                        {step === "choice" && <div className="space-y-3">
                            <div className="mb-6 text-center"><h1 className="text-2xl font-bold font-rounded">Open your dashboard</h1><p className="mt-2 text-sm leading-6 text-zinc-500">Sign in to your FINNRI account or start securely as a guest.</p></div>
                            <button onClick={() => chooseType("email")} className="group flex min-h-20 w-full items-center justify-between rounded-2xl border border-border bg-zinc-50 p-4 text-left transition hover:border-accent/30 hover:bg-white dark:bg-zinc-800/50 dark:hover:bg-zinc-800"><span className="flex items-center gap-4"><span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/10 text-accent"><Mail className="h-5 w-5" /></span><span><span className="block font-bold">Continue with email</span><span className="mt-1 block text-xs text-zinc-400">PIN for returning users, OTP to register</span></span></span><ChevronRight className="h-5 w-5 text-zinc-300 transition group-hover:translate-x-1 group-hover:text-accent" /></button>
                            <button onClick={() => chooseType("phone")} className="group flex min-h-20 w-full items-center justify-between rounded-2xl border border-border bg-zinc-50 p-4 text-left transition hover:border-accent/30 hover:bg-white dark:bg-zinc-800/50 dark:hover:bg-zinc-800"><span className="flex items-center gap-4"><span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/10 text-accent"><Phone className="h-5 w-5" /></span><span><span className="block font-bold">Continue with phone</span><span className="mt-1 block text-xs text-zinc-400">Use your number with country code</span></span></span><ChevronRight className="h-5 w-5 text-zinc-300 transition group-hover:translate-x-1 group-hover:text-accent" /></button>
                            <div className="relative py-3"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div><span className="relative mx-auto block w-fit bg-white px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300 dark:bg-zinc-900">or</span></div>
                            <button onClick={() => void loginAsGuest()} disabled={isLoading} className="flex min-h-20 w-full items-center justify-between rounded-2xl border border-dashed border-accent/30 bg-accent/5 p-4 text-left text-accent disabled:opacity-60"><span className="flex items-center gap-4"><span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-white">{isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserRound className="h-5 w-5" />}</span><span><span className="block font-bold">Continue as guest</span><span className="mt-1 block text-xs text-accent/70">A real private workspace—no sample data</span></span></span><ArrowRight className="h-4 w-4" /></button>
                        </div>}

                        {step === "identifier" && <form onSubmit={handleIdentify} className="space-y-5">
                            <button type="button" onClick={() => { setStep("choice"); setError(null); }} className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-accent"><ArrowLeft className="h-4 w-4" /> Sign-in options</button>
                            <div><h1 className="text-2xl font-bold font-rounded">Enter your {loginType}</h1><p className="mt-2 text-sm leading-6 text-zinc-500">We’ll check whether you already have a FINNRI account.</p></div>
                            <label className="block space-y-2"><span className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">{loginType === "email" ? "Email address" : "Phone number"}</span><span className="relative block">{loginType === "email" ? <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" /> : <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />}<input required type={loginType === "email" ? "email" : "tel"} inputMode={loginType === "email" ? "email" : "tel"} autoComplete={loginType === "email" ? "email" : "tel"} value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder={loginType === "email" ? "name@example.com" : "+91 98765 43210"} className="min-h-14 w-full rounded-2xl border border-transparent bg-zinc-100 pl-12 pr-4 text-base outline-none transition focus:border-accent/30 focus:bg-white focus:ring-4 focus:ring-accent/10 dark:bg-zinc-800 dark:focus:bg-zinc-900" autoFocus /></span></label>
                            <button disabled={isLoading} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-base font-bold text-white shadow-xl shadow-accent/20 disabled:opacity-60">{isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Continue <ArrowRight className="h-4 w-4" /></>}</button>
                        </form>}

                        {step === "otp" && <form onSubmit={handleVerifyOTP} className="space-y-5">
                            <button type="button" onClick={() => { setStep("identifier"); setError(null); }} className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-accent"><ArrowLeft className="h-4 w-4" /> Change {loginType}</button>
                            <div><h1 className="text-2xl font-bold font-rounded">Verify your {loginType}</h1><p className="mt-2 text-sm leading-6 text-zinc-500">Enter the 6-digit code sent to <strong>{identifier}</strong>.</p></div>
                            {devOTP && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200"><p className="text-[10px] font-bold uppercase tracking-[0.18em]">Local development code</p><div className="mt-2 flex items-center justify-between"><code className="text-xl font-bold tracking-[0.25em]">{devOTP}</code><button type="button" onClick={() => setOtp(devOTP)} className="rounded-lg bg-amber-100 px-3 py-2 text-xs font-bold dark:bg-amber-900/40">Use code</button></div></div>}
                            <input required type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} placeholder="000000" aria-label="Verification code" className="min-h-16 w-full rounded-2xl bg-zinc-100 px-4 text-center text-2xl font-bold tracking-[0.45em] outline-none focus:ring-4 focus:ring-accent/10 dark:bg-zinc-800" autoFocus />
                            <button disabled={isLoading} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-base font-bold text-white shadow-xl shadow-accent/20 disabled:opacity-60">{isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Verify code <CheckCircle2 className="h-4 w-4" /></>}</button>
                            <button type="button" onClick={() => void resendCode()} disabled={isLoading} className="w-full text-center text-xs font-bold text-zinc-400 hover:text-accent disabled:opacity-50">Send a new code</button>
                        </form>}

                        {step === "pin" && <form onSubmit={handleFinalAuth} className="space-y-5">
                            <button type="button" onClick={() => { setStep(authMode === "login" ? "identifier" : "otp"); setError(null); }} className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-accent"><ArrowLeft className="h-4 w-4" /> Back</button>
                            <div><h1 className="text-2xl font-bold font-rounded">{authMode === "login" ? "Enter your PIN" : authMode === "reset" ? "Choose a new PIN" : "Create your PIN"}</h1><p className="mt-2 text-sm leading-6 text-zinc-500">{authMode === "login" ? `Signing in as ${identifier}` : "Use four digits with more than one distinct number."}</p></div>
                            <span className="relative block"><Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" /><input required type="password" inputMode="numeric" autoComplete={authMode === "login" ? "current-password" : "new-password"} pattern="[0-9]{4}" maxLength={4} value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))} placeholder="••••" aria-label="Four digit PIN" className="min-h-16 w-full rounded-2xl bg-zinc-100 pl-12 pr-4 text-center text-2xl font-bold tracking-[0.45em] outline-none focus:ring-4 focus:ring-accent/10 dark:bg-zinc-800" autoFocus /></span>
                            <button disabled={isLoading} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-base font-bold text-white shadow-xl shadow-accent/20 disabled:opacity-60">{isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>{authMode === "login" ? "Sign in" : authMode === "reset" ? "Save new PIN" : "Create account"} <ArrowRight className="h-4 w-4" /></>}</button>
                            {authMode === "login" && <button type="button" onClick={() => void beginReset()} disabled={isLoading} className="flex w-full items-center justify-center gap-2 text-xs font-bold text-zinc-400 hover:text-accent disabled:opacity-50"><KeyRound className="h-4 w-4" /> Forgot PIN? Verify and reset it</button>}
                        </form>}
                    </div>
                </div>
                <div className="flex items-center gap-4 border-t border-border bg-zinc-50 p-5 dark:bg-zinc-800/50 sm:p-6"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-accent shadow-sm dark:bg-zinc-700"><Smartphone className="h-5 w-5" /></span><div className="min-w-0"><p className="text-xs font-bold">Coming from mobile?</p><p className="mt-1 text-[11px] leading-4 text-zinc-400">Use the same verified email or phone and PIN to access your FINNRI account.</p></div><ShieldCheck className="ml-auto h-5 w-5 shrink-0 text-emerald-500" /></div>
            </div>
        </main>
    );
}
