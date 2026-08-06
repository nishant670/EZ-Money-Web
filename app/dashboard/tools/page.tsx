"use client";

import React, { FormEvent, useCallback, useEffect, useState } from "react";
import {
    AlertTriangle,
    BellRing,
    Calculator,
    CalendarClock,
    ChartLine,
    Check,
    ChevronDown,
    CircleAlert,
    FileText,
    Gauge,
    Grid2X2,
    Home,
    IndianRupee,
    Loader2,
    Pause,
    Play,
    Plus,
    ReceiptText,
    Trash2,
    TrendingUp,
    X,
} from "lucide-react";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import {
    Account,
    AccountsAPI,
    apiErrorMessage,
    Budget,
    BudgetInput,
    BudgetsAPI,
    EMICalculation,
    Subscription,
    SubscriptionInput,
    SubscriptionsAPI,
    ToolsAPI,
} from "@/app/lib/api";
import { cn } from "@/app/lib/utils";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

type SIPPresetID = "mutual_fund" | "ppf" | "nps" | "rd" | "custom";

type SIPPreset = {
    id: SIPPresetID;
    label: string;
    monthlyInvestment: number;
    expectedAnnualReturnPercent: number;
    tenureYears: number;
    annualStepUpPercent: number;
    currentCorpus: number;
};

type SIPYearBreakdown = {
    year: number;
    yearlyInvestment: number;
    yearEndValue: number;
};

type SIPCalculation = SIPPreset & {
    investedAmount: number;
    estimatedReturns: number;
    maturityValue: number;
    breakdown: SIPYearBreakdown[];
};

const sipPresets: SIPPreset[] = [
    { id: "mutual_fund", label: "Mutual Funds", monthlyInvestment: 10000, expectedAnnualReturnPercent: 12, tenureYears: 10, annualStepUpPercent: 10, currentCorpus: 0 },
    { id: "ppf", label: "PPF", monthlyInvestment: 12500, expectedAnnualReturnPercent: 7, tenureYears: 15, annualStepUpPercent: 0, currentCorpus: 0 },
    { id: "nps", label: "NPS", monthlyInvestment: 10000, expectedAnnualReturnPercent: 10, tenureYears: 20, annualStepUpPercent: 5, currentCorpus: 0 },
    { id: "rd", label: "RD", monthlyInvestment: 5000, expectedAnnualReturnPercent: 6.5, tenureYears: 5, annualStepUpPercent: 0, currentCorpus: 0 },
    { id: "custom", label: "Custom", monthlyInvestment: 10000, expectedAnnualReturnPercent: 8, tenureYears: 10, annualStepUpPercent: 0, currentCorpus: 0 },
];

const calculateSIP = (input: SIPPreset): SIPCalculation => {
    const monthlyRate = input.expectedAnnualReturnPercent / 12 / 100;
    const tenureMonths = Math.round(input.tenureYears * 12);
    let value = input.currentCorpus;
    let monthlyInvestment = input.monthlyInvestment;
    let investedAmount = input.currentCorpus;
    const breakdown: SIPYearBreakdown[] = [];

    for (let month = 1; month <= tenureMonths; month += 1) {
        value = value * (1 + monthlyRate) + monthlyInvestment;
        investedAmount += monthlyInvestment;

        if (month % 12 === 0 || month === tenureMonths) {
            breakdown.push({
                year: Math.ceil(month / 12),
                yearlyInvestment: monthlyInvestment * (month % 12 === 0 ? 12 : month % 12),
                yearEndValue: value,
            });
            monthlyInvestment *= 1 + input.annualStepUpPercent / 100;
        }
    }

    return { ...input, investedAmount, estimatedReturns: value - investedAmount, maturityValue: value, breakdown };
};

const validateSIPInput = (input: SIPPreset) => {
    const errors: string[] = [];
    if (!Number.isFinite(input.monthlyInvestment) || input.monthlyInvestment <= 0) errors.push("Monthly investment must be positive.");
    if (!Number.isFinite(input.expectedAnnualReturnPercent) || input.expectedAnnualReturnPercent < 0 || input.expectedAnnualReturnPercent > 100) errors.push("Expected return must be between 0 and 100.");
    if (!Number.isFinite(input.tenureYears) || input.tenureYears <= 0 || input.tenureYears > 60) errors.push("Tenure must be between 1 month and 60 years.");
    if (!Number.isFinite(input.annualStepUpPercent) || input.annualStepUpPercent < 0 || input.annualStepUpPercent > 100) errors.push("Annual step-up must be between 0 and 100.");
    if (!Number.isFinite(input.currentCorpus) || input.currentCorpus < 0) errors.push("Current corpus cannot be negative.");
    return errors;
};

function futureDate(days: number) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 10);
}

function ModalShell({ title, description, onClose, children }: { title: string; description: string; onClose: () => void; children: React.ReactNode }) {
    return <div className="fixed inset-0 z-[100] grid place-items-center bg-zinc-950/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true"><div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[2rem] border border-border bg-white shadow-2xl dark:bg-zinc-900"><div className="sticky top-0 z-10 flex items-start justify-between border-b border-border bg-white/95 p-6 backdrop-blur dark:bg-zinc-900/95"><div><h2 className="text-xl font-bold font-rounded">{title}</h2><p className="mt-1 text-xs leading-5 text-zinc-400">{description}</p></div><button onClick={onClose} className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Close"><X className="h-5 w-5" /></button></div>{children}</div></div>;
}

function BudgetForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
    const [form, setForm] = useState<BudgetInput>({ name: "Monthly spending", period: "monthly", category: "", limit_amount: 25000, currency: "INR", alert_threshold_percent: 80, active: true });
    const [saving, setSaving] = useState(false); const [error, setError] = useState("");
    const submit = async (event: FormEvent) => { event.preventDefault(); setSaving(true); setError(""); try { await BudgetsAPI.create(form); onSaved(); } catch (requestError) { setError(apiErrorMessage(requestError, "We couldn’t create this budget.")); } finally { setSaving(false); } };
    return <ModalShell title="Create a monthly budget" description="Set a total or category-specific INR limit. Alerts are generated when confirmed spending crosses the threshold." onClose={onClose}><form onSubmit={submit} className="space-y-5 p-6"><label className="block space-y-2"><span className="text-xs font-bold text-zinc-500">Budget name</span><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full rounded-xl border border-border bg-zinc-50 px-4 py-3 text-sm outline-none dark:bg-zinc-800" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2"><span className="text-xs font-bold text-zinc-500">Monthly limit</span><input required type="number" min="1" step="0.01" value={form.limit_amount} onChange={(event) => setForm({ ...form, limit_amount: Number(event.target.value) })} className="w-full rounded-xl border border-border bg-zinc-50 px-4 py-3 text-sm outline-none dark:bg-zinc-800" /></label><label className="space-y-2"><span className="text-xs font-bold text-zinc-500">Alert at</span><div className="relative"><input required type="number" min="1" max="100" value={form.alert_threshold_percent} onChange={(event) => setForm({ ...form, alert_threshold_percent: Number(event.target.value) })} className="w-full rounded-xl border border-border bg-zinc-50 px-4 py-3 pr-10 text-sm outline-none dark:bg-zinc-800" /><span className="absolute right-4 top-3 text-sm text-zinc-400">%</span></div></label></div><label className="block space-y-2"><span className="text-xs font-bold text-zinc-500">Category (optional)</span><input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Leave blank for all expenses" className="w-full rounded-xl border border-border bg-zinc-50 px-4 py-3 text-sm outline-none dark:bg-zinc-800" /></label>{error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30">{error}</p>}<div className="flex justify-end gap-3 pt-2"><button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-zinc-500">Cancel</button><button disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-6 text-sm font-bold text-white disabled:opacity-60">{saving && <Loader2 className="h-4 w-4 animate-spin" />} Create budget</button></div></form></ModalShell>;
}

function SubscriptionForm({ accounts, onClose, onSaved }: { accounts: Account[]; onClose: () => void; onSaved: () => void }) {
    const [form, setForm] = useState<SubscriptionInput>({ account_id: null, name: "", merchant: "", category: "Subscriptions", amount: 0, currency: "INR", billing_interval: "monthly", next_due_date: futureDate(30), last_charged_date: "", status: "active", reminder_days: 3, cancel_before_due: false, notes: "" });
    const [saving, setSaving] = useState(false); const [error, setError] = useState("");
    const submit = async (event: FormEvent) => { event.preventDefault(); setSaving(true); setError(""); try { await SubscriptionsAPI.create(form); onSaved(); } catch (requestError) { setError(apiErrorMessage(requestError, "We couldn’t add this subscription.")); } finally { setSaving(false); } };
    return <ModalShell title="Track a recurring payment" description="FINNRI stores a schedule and reminders. Marking it paid advances the date but does not create a transaction." onClose={onClose}><form onSubmit={submit} className="space-y-5 p-6"><div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2"><span className="text-xs font-bold text-zinc-500">Name</span><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Netflix" className="w-full rounded-xl border border-border bg-zinc-50 px-4 py-3 text-sm outline-none dark:bg-zinc-800" /></label><label className="space-y-2"><span className="text-xs font-bold text-zinc-500">Merchant</span><input value={form.merchant} onChange={(event) => setForm({ ...form, merchant: event.target.value })} className="w-full rounded-xl border border-border bg-zinc-50 px-4 py-3 text-sm outline-none dark:bg-zinc-800" /></label><label className="space-y-2"><span className="text-xs font-bold text-zinc-500">Amount</span><input required type="number" min="1" step="0.01" value={form.amount || ""} onChange={(event) => setForm({ ...form, amount: Number(event.target.value) })} className="w-full rounded-xl border border-border bg-zinc-50 px-4 py-3 text-sm outline-none dark:bg-zinc-800" /></label><label className="space-y-2"><span className="text-xs font-bold text-zinc-500">Interval</span><select value={form.billing_interval} onChange={(event) => setForm({ ...form, billing_interval: event.target.value as SubscriptionInput["billing_interval"] })} className="w-full rounded-xl border border-border bg-zinc-50 px-4 py-3 text-sm outline-none dark:bg-zinc-800"><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option></select></label><label className="space-y-2"><span className="text-xs font-bold text-zinc-500">Next due date</span><input required type="date" value={form.next_due_date} onChange={(event) => setForm({ ...form, next_due_date: event.target.value })} className="w-full rounded-xl border border-border bg-zinc-50 px-4 py-3 text-sm outline-none dark:bg-zinc-800" /></label><label className="space-y-2"><span className="text-xs font-bold text-zinc-500">Account (optional)</span><select value={form.account_id || ""} onChange={(event) => setForm({ ...form, account_id: event.target.value ? Number(event.target.value) : null })} className="w-full rounded-xl border border-border bg-zinc-50 px-4 py-3 text-sm outline-none dark:bg-zinc-800"><option value="">No account</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select></label></div><label className="flex items-center gap-3 rounded-xl border border-border p-4"><input type="checkbox" checked={form.cancel_before_due} onChange={(event) => setForm({ ...form, cancel_before_due: event.target.checked })} className="h-4 w-4 accent-[#FF8865]" /><span><span className="block text-sm font-bold">Remind me to review before renewal</span><span className="block text-xs text-zinc-400">Uses the configured reminder window.</span></span></label>{error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30">{error}</p>}<div className="flex justify-end gap-3 pt-2"><button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-zinc-500">Cancel</button><button disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-6 text-sm font-bold text-white disabled:opacity-60">{saving && <Loader2 className="h-4 w-4 animate-spin" />} Add subscription</button></div></form></ModalShell>;
}

function FeatureError({ message }: { message: string }) { return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200"><AlertTriangle className="mb-3 h-5 w-5" /><p className="font-bold">This workspace isn’t available right now</p><p className="mt-1 leading-6 opacity-75">{message}</p></div>; }

export default function ToolsScreen() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [budgetError, setBudgetError] = useState(""); const [subscriptionError, setSubscriptionError] = useState("");
    const [loading, setLoading] = useState(true); const [workingId, setWorkingId] = useState<string | null>(null);
    const [showBudgetForm, setShowBudgetForm] = useState(false); const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
    const [activeSIPPresetID, setActiveSIPPresetID] = useState<SIPPresetID>("mutual_fund");
    const [sipInput, setSipInput] = useState<SIPPreset>(sipPresets[0]);
    const [sipResult, setSipResult] = useState<SIPCalculation | null>(null);
    const [sipError, setSipError] = useState("");
    const [showSIPBreakdown, setShowSIPBreakdown] = useState(false);
    const [principal, setPrincipal] = useState(1000000); const [rate, setRate] = useState(9); const [months, setMonths] = useState(60);
    const [emiResult, setEmiResult] = useState<EMICalculation | null>(null); const [emiError, setEmiError] = useState(""); const [calculating, setCalculating] = useState(false);
    const [showSchedule, setShowSchedule] = useState(false);

    const loadPlanning = useCallback(async () => {
        setLoading(true); setBudgetError(""); setSubscriptionError("");
        const [accountsResult, budgetsResult, subscriptionsResult] = await Promise.allSettled([AccountsAPI.list(), BudgetsAPI.list(), SubscriptionsAPI.list()]);
        if (accountsResult.status === "fulfilled") setAccounts(accountsResult.value.data);
        if (budgetsResult.status === "fulfilled") setBudgets(budgetsResult.value.data); else setBudgetError(apiErrorMessage(budgetsResult.reason, "Budgets may require a plan that includes budget alerts."));
        if (subscriptionsResult.status === "fulfilled") setSubscriptions(subscriptionsResult.value.data); else setSubscriptionError(apiErrorMessage(subscriptionsResult.reason, "Subscriptions could not be loaded."));
        setLoading(false);
    }, []);
    useEffect(() => { void loadPlanning(); }, [loadPlanning]);

    const applySIPPreset = (preset: SIPPreset) => {
        setActiveSIPPresetID(preset.id);
        setSipInput(preset);
        setSipResult(null);
        setSipError("");
        setShowSIPBreakdown(false);
    };
    const updateSIPInput = (patch: Partial<SIPPreset>) => {
        setSipInput((current) => ({ ...current, ...patch, id: "custom", label: "Custom" }));
        setActiveSIPPresetID("custom");
    };
    const calculateSIPProjection = (event: FormEvent) => {
        event.preventDefault();
        const errors = validateSIPInput(sipInput);
        if (errors.length > 0) {
            setSipError(errors.join(" "));
            return;
        }
        setSipError("");
        setSipResult(calculateSIP(sipInput));
        setShowSIPBreakdown(false);
    };
    const calculate = async (event: FormEvent) => { event.preventDefault(); setCalculating(true); setEmiError(""); try { const response = await ToolsAPI.calculateEMI({ principal_amount: principal, annual_interest_rate_percent: rate, tenure_months: months, currency: "INR" }); setEmiResult(response.data); } catch (requestError) { setEmiError(apiErrorMessage(requestError, "We couldn’t calculate this EMI.")); } finally { setCalculating(false); } };
    const toggleBudget = async (budget: Budget) => { setWorkingId(`budget-${budget.id}`); try { await BudgetsAPI.update(budget.id, { name: budget.name, period: "monthly", category: budget.category, limit_amount: budget.limit_amount, currency: "INR", alert_threshold_percent: budget.alert_threshold_percent, active: !budget.active }); await loadPlanning(); } catch (requestError) { setBudgetError(apiErrorMessage(requestError, "We couldn’t update this budget.")); } finally { setWorkingId(null); } };
    const deleteBudget = async (budget: Budget) => { if (!window.confirm(`Delete ${budget.name}?`)) return; setWorkingId(`budget-${budget.id}`); try { await BudgetsAPI.delete(budget.id); await loadPlanning(); } catch (requestError) { setBudgetError(apiErrorMessage(requestError, "We couldn’t delete this budget.")); } finally { setWorkingId(null); } };
    const toggleSubscription = async (subscription: Subscription) => { setWorkingId(`subscription-${subscription.id}`); const nextStatus = subscription.status === "active" ? "paused" : "active"; try { await SubscriptionsAPI.update(subscription.id, { account_id: subscription.account_id, name: subscription.name, merchant: subscription.merchant, category: subscription.category, amount: subscription.amount, currency: "INR", billing_interval: subscription.billing_interval, next_due_date: subscription.next_due_date, last_charged_date: subscription.last_charged_date, status: nextStatus, reminder_days: subscription.reminder_days, cancel_before_due: subscription.cancel_before_due, notes: subscription.notes }); await loadPlanning(); } catch (requestError) { setSubscriptionError(apiErrorMessage(requestError, "We couldn’t update this subscription.")); } finally { setWorkingId(null); } };
    const markPaid = async (subscription: Subscription) => { setWorkingId(`subscription-${subscription.id}`); try { await SubscriptionsAPI.markPaid(subscription.id); await loadPlanning(); } catch (requestError) { setSubscriptionError(apiErrorMessage(requestError, "We couldn’t mark this subscription paid.")); } finally { setWorkingId(null); } };
    const deleteSubscription = async (subscription: Subscription) => { if (!window.confirm(`Stop tracking ${subscription.name}?`)) return; setWorkingId(`subscription-${subscription.id}`); try { await SubscriptionsAPI.delete(subscription.id); await loadPlanning(); } catch (requestError) { setSubscriptionError(apiErrorMessage(requestError, "We couldn’t delete this subscription.")); } finally { setWorkingId(null); } };

    return <DashboardLayout><div className="space-y-8 pb-16"><header><p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Plan with context</p><h1 className="mt-2 text-3xl font-bold tracking-tight font-rounded sm:text-4xl">Planning & tools</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">Calculate loan and SIP scenarios, set monthly guardrails, and review recurring payments. Calculators are informational and are not financial advice.</p></header>
        <section aria-label="Available calculators" className="grid gap-3 md:grid-cols-5">
            {[
                { href: "#sip", label: "SIP", caption: "Investments", icon: ChartLine, active: true },
                { href: "#emi", label: "EMI", caption: "Loans", icon: Calculator, active: true },
                { href: "#planned-tools", label: "HRA", caption: "Tax rent", icon: Home, active: false },
                { href: "#planned-tools", label: "ITR", caption: "Tax filing", icon: FileText, active: false },
                { href: "#planned-tools", label: "More", caption: "Planned", icon: Grid2X2, active: false },
            ].map((tool) => <a key={tool.label} href={tool.href} className={cn("rounded-2xl border border-border bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-sm dark:bg-zinc-900", !tool.active && "opacity-65")}><div className="flex items-center justify-between"><span className={cn("grid h-10 w-10 place-items-center rounded-xl", tool.active ? "bg-accent-secondary text-accent" : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800")}><tool.icon className="h-5 w-5" /></span><span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", tool.active ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800")}>{tool.active ? "Live" : "Soon"}</span></div><p className="mt-4 font-bold">{tool.label}</p><p className="mt-1 text-xs text-zinc-400">{tool.caption}</p></a>)}
        </section>
        <section id="sip" className="grid gap-6 rounded-[2rem] border border-border bg-white p-6 dark:bg-zinc-900 sm:p-8 xl:grid-cols-[.85fr_1.15fr]"><form onSubmit={calculateSIPProjection}><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent-secondary text-accent"><ChartLine className="h-5 w-5" /></span><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">SIP calculator</p><h2 className="mt-1 text-xl font-bold font-rounded">Project an investment plan</h2></div></div><div className="mt-6 flex flex-wrap gap-2">{sipPresets.map((preset) => <button key={preset.id} type="button" onClick={() => applySIPPreset(preset)} className={cn("rounded-full border px-3 py-2 text-xs font-bold transition", activeSIPPresetID === preset.id ? "border-accent bg-accent text-white" : "border-border bg-zinc-50 text-zinc-500 hover:border-accent dark:bg-zinc-800")}>{preset.label}</button>)}</div><div className="mt-7 space-y-4"><label className="block space-y-2"><span className="text-xs font-bold text-zinc-500">Monthly investment</span><input type="number" required min="1" step="0.01" value={sipInput.monthlyInvestment} onChange={(event) => updateSIPInput({ monthlyInvestment: Number(event.target.value) })} className="w-full rounded-xl border border-border bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-accent dark:bg-zinc-800" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2"><span className="text-xs font-bold text-zinc-500">Expected return % p.a.</span><input type="number" required min="0" max="100" step="0.01" value={sipInput.expectedAnnualReturnPercent} onChange={(event) => updateSIPInput({ expectedAnnualReturnPercent: Number(event.target.value) })} className="w-full rounded-xl border border-border bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-accent dark:bg-zinc-800" /></label><label className="space-y-2"><span className="text-xs font-bold text-zinc-500">Tenure in years</span><input type="number" required min="0.08" max="60" step="0.01" value={sipInput.tenureYears} onChange={(event) => updateSIPInput({ tenureYears: Number(event.target.value) })} className="w-full rounded-xl border border-border bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-accent dark:bg-zinc-800" /></label></div><div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2"><span className="text-xs font-bold text-zinc-500">Annual step-up %</span><input type="number" min="0" max="100" step="0.01" value={sipInput.annualStepUpPercent} onChange={(event) => updateSIPInput({ annualStepUpPercent: Number(event.target.value) })} className="w-full rounded-xl border border-border bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-accent dark:bg-zinc-800" /></label><label className="space-y-2"><span className="text-xs font-bold text-zinc-500">Current corpus</span><input type="number" min="0" step="0.01" value={sipInput.currentCorpus} onChange={(event) => updateSIPInput({ currentCorpus: Number(event.target.value) })} className="w-full rounded-xl border border-border bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-accent dark:bg-zinc-800" /></label></div>{sipError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30">{sipError}</p>}<button className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-bold text-white"><TrendingUp className="h-4 w-4" /> Calculate projection</button></div></form>
            <div className="rounded-[1.5rem] border border-border bg-zinc-50 p-5 dark:bg-zinc-800/50 sm:p-6">{sipResult ? <><p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">Estimated maturity value</p><p className="mt-3 text-4xl font-bold font-rounded sm:text-5xl">{currency.format(sipResult.maturityValue)}</p><div className="mt-7 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-white p-4 dark:bg-zinc-900"><p className="text-xs text-zinc-400">Invested amount</p><p className="mt-1 text-lg font-bold">{currency.format(sipResult.investedAmount)}</p></div><div className="rounded-2xl bg-white p-4 dark:bg-zinc-900"><p className="text-xs text-zinc-400">Estimated returns</p><p className="mt-1 text-lg font-bold text-accent">{currency.format(sipResult.estimatedReturns)}</p></div></div><button onClick={() => setShowSIPBreakdown((show) => !show)} className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-zinc-500">{showSIPBreakdown ? "Hide" : "View"} yearly breakdown <ChevronDown className={cn("h-4 w-4 transition", showSIPBreakdown && "rotate-180")} /></button>{showSIPBreakdown && <div className="mt-4 max-h-64 overflow-auto rounded-xl border border-border bg-white dark:bg-zinc-900"><table className="w-full min-w-[460px] text-left text-xs"><thead className="sticky top-0 bg-zinc-50 text-zinc-400 dark:bg-zinc-900"><tr><th className="p-3">Year</th><th className="p-3">Invested</th><th className="p-3">Value</th></tr></thead><tbody>{sipResult.breakdown.map((row) => <tr key={row.year} className="border-t border-border"><td className="p-3">{row.year}</td><td className="p-3">{currency.format(row.yearlyInvestment)}</td><td className="p-3">{currency.format(row.yearEndValue)}</td></tr>)}</tbody></table></div>}</> : <div className="grid h-full min-h-72 place-items-center text-center"><div><ChartLine className="mx-auto h-8 w-8 text-zinc-300" /><h3 className="mt-4 font-bold">Your SIP projection will appear here</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">Choose a preset or enter custom assumptions to estimate maturity value, invested amount, and yearly growth.</p></div></div>}</div>
        </section>
        <section id="emi" className="grid gap-6 overflow-hidden rounded-[2rem] bg-zinc-950 p-6 text-white sm:p-8 xl:grid-cols-[.85fr_1.15fr]"><form onSubmit={calculate}><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent text-white"><Calculator className="h-5 w-5" /></span><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">EMI calculator</p><h2 className="mt-1 text-xl font-bold font-rounded">Test a loan scenario</h2></div></div><div className="mt-7 space-y-4"><label className="block space-y-2"><span className="text-xs font-bold text-zinc-400">Principal amount</span><input type="number" required min="1" step="0.01" value={principal} onChange={(event) => setPrincipal(Number(event.target.value))} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-accent" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2"><span className="text-xs font-bold text-zinc-400">Annual interest %</span><input type="number" required min="0" max="100" step="0.01" value={rate} onChange={(event) => setRate(Number(event.target.value))} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-accent" /></label><label className="space-y-2"><span className="text-xs font-bold text-zinc-400">Tenure in months</span><input type="number" required min="1" max="360" value={months} onChange={(event) => setMonths(Number(event.target.value))} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-accent" /></label></div>{emiError && <p className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{emiError}</p>}<button disabled={calculating} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-bold text-white disabled:opacity-60">{calculating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gauge className="h-4 w-4" />} Calculate repayment</button></div></form>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 sm:p-6">{emiResult ? <><p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Estimated monthly EMI</p><p className="mt-3 text-4xl font-bold font-rounded sm:text-5xl">{currency.format(emiResult.monthly_emi)}</p><div className="mt-7 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-white/5 p-4"><p className="text-xs text-zinc-400">Total payment</p><p className="mt-1 text-lg font-bold">{currency.format(emiResult.total_payment)}</p></div><div className="rounded-2xl bg-white/5 p-4"><p className="text-xs text-zinc-400">Total interest</p><p className="mt-1 text-lg font-bold text-accent">{currency.format(emiResult.total_interest)}</p></div></div><button onClick={() => setShowSchedule((show) => !show)} className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-zinc-300">{showSchedule ? "Hide" : "View"} amortization schedule <ChevronDown className={cn("h-4 w-4 transition", showSchedule && "rotate-180")} /></button>{showSchedule && <div className="mt-4 max-h-64 overflow-auto rounded-xl border border-white/10"><table className="w-full min-w-[520px] text-left text-xs"><thead className="sticky top-0 bg-zinc-900 text-zinc-400"><tr><th className="p-3">Month</th><th className="p-3">Principal</th><th className="p-3">Interest</th><th className="p-3">Balance</th></tr></thead><tbody>{emiResult.schedule.map((row) => <tr key={row.month} className="border-t border-white/10"><td className="p-3">{row.month}</td><td className="p-3">{currency.format(row.principal_amount)}</td><td className="p-3">{currency.format(row.interest_amount)}</td><td className="p-3">{currency.format(row.closing_balance)}</td></tr>)}</tbody></table></div>}</> : <div className="grid h-full min-h-72 place-items-center text-center"><div><IndianRupee className="mx-auto h-8 w-8 text-zinc-600" /><h3 className="mt-4 font-bold">Your repayment view will appear here</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">FINNRI uses the backend calculator to return EMI, total interest, and a month-by-month schedule.</p></div></div>}</div>
        </section>

        <section id="budgets" className="rounded-[2rem] border border-border bg-white p-6 dark:bg-zinc-900 sm:p-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex items-center gap-2 text-accent"><BellRing className="h-4 w-4" /><p className="text-xs font-bold uppercase tracking-[0.18em]">Monthly guardrails</p></div><h2 className="mt-2 text-2xl font-bold font-rounded">Budgets</h2><p className="mt-1 text-sm text-zinc-500">Get an in-app alert when confirmed expenses reach your threshold.</p></div><button disabled={Boolean(budgetError)} onClick={() => setShowBudgetForm(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 text-sm font-bold text-white disabled:opacity-40 dark:bg-white dark:text-zinc-900"><Plus className="h-4 w-4" /> New budget</button></div>{loading ? <div className="grid min-h-48 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div> : budgetError ? <div className="mt-6"><FeatureError message={budgetError} /></div> : budgets.length === 0 ? <p className="mt-6 rounded-2xl bg-zinc-50 p-8 text-center text-sm text-zinc-400 dark:bg-zinc-800">No budgets yet. Add a monthly total or category guardrail.</p> : <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{budgets.map((budget) => <article key={budget.id} className={cn("rounded-2xl border border-border p-5", !budget.active && "opacity-60")}><div className="flex items-start justify-between"><div><p className="font-bold">{budget.name}</p><p className="mt-1 text-xs text-zinc-400">{budget.category || "All expenses"}</p></div><span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider", budget.active ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800")}>{budget.active ? "Active" : "Paused"}</span></div><p className="mt-5 text-2xl font-bold font-rounded">{currency.format(budget.limit_amount)}</p><p className="mt-1 text-xs text-zinc-400">Alert at {budget.alert_threshold_percent}% · monthly</p><div className="mt-5 flex gap-2 border-t border-border pt-4"><button disabled={workingId === `budget-${budget.id}`} onClick={() => void toggleBudget(budget)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-100 py-2.5 text-xs font-bold dark:bg-zinc-800">{budget.active ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}{budget.active ? "Pause" : "Resume"}</button><button onClick={() => void deleteBudget(budget)} className="rounded-xl p-3 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30" aria-label={`Delete ${budget.name}`}><Trash2 className="h-4 w-4" /></button></div></article>)}</div>}</section>

        <section id="subscriptions" className="rounded-[2rem] border border-border bg-white p-6 dark:bg-zinc-900 sm:p-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex items-center gap-2 text-indigo-600"><CalendarClock className="h-4 w-4" /><p className="text-xs font-bold uppercase tracking-[0.18em]">Recurring payments</p></div><h2 className="mt-2 text-2xl font-bold font-rounded">Subscriptions</h2><p className="mt-1 text-sm text-zinc-500">Review due dates and advance schedules after payment.</p></div><button disabled={Boolean(subscriptionError)} onClick={() => setShowSubscriptionForm(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 text-sm font-bold text-white disabled:opacity-40 dark:bg-white dark:text-zinc-900"><Plus className="h-4 w-4" /> Track payment</button></div>{loading ? <div className="grid min-h-48 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div> : subscriptionError ? <div className="mt-6"><FeatureError message={subscriptionError} /></div> : subscriptions.length === 0 ? <p className="mt-6 rounded-2xl bg-zinc-50 p-8 text-center text-sm text-zinc-400 dark:bg-zinc-800">No recurring payments are being tracked.</p> : <div className="mt-6 divide-y divide-border">{subscriptions.map((subscription) => <article key={subscription.id} className="grid gap-4 py-5 lg:grid-cols-[1fr_auto] lg:items-center"><div className="flex items-start gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30"><ReceiptText className="h-5 w-5" /></span><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{subscription.name}</h3><span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", subscription.due_state === "overdue" ? "bg-red-50 text-red-600 dark:bg-red-950/30" : subscription.due_state === "due_soon" ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800")}>{subscription.due_state.replace("_", " ")}</span></div><p className="mt-1 text-sm text-zinc-500">{currency.format(subscription.amount)} · {subscription.billing_interval} · due {subscription.next_due_date}</p><p className="mt-1 text-xs text-zinc-400">{subscription.account?.name || "No account linked"}</p></div></div><div className="flex flex-wrap gap-2"><button disabled={workingId === `subscription-${subscription.id}`} onClick={() => void markPaid(subscription)} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-accent/10 px-4 text-xs font-bold text-accent"><Check className="h-3.5 w-3.5" /> Mark paid</button><button onClick={() => void toggleSubscription(subscription)} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-zinc-100 px-4 text-xs font-bold dark:bg-zinc-800">{subscription.status === "active" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}{subscription.status === "active" ? "Pause" : "Resume"}</button><button onClick={() => void deleteSubscription(subscription)} className="rounded-xl p-3 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30" aria-label={`Delete ${subscription.name}`}><Trash2 className="h-4 w-4" /></button></div></article>)}</div>}</section>
        <section id="planned-tools" className="rounded-[2rem] border border-dashed border-border bg-white p-6 dark:bg-zinc-900 sm:p-8"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800"><Grid2X2 className="h-5 w-5" /></span><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">Coming next</p><h2 className="mt-1 text-2xl font-bold font-rounded">More financial tools</h2></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><article className="rounded-2xl border border-border p-5"><Home className="h-5 w-5 text-accent" /><h3 className="mt-4 font-bold">HRA calculator</h3><p className="mt-1 text-sm leading-6 text-zinc-500">Estimate rent exemption scenarios once web tax inputs are ready.</p></article><article className="rounded-2xl border border-border p-5"><FileText className="h-5 w-5 text-accent" /><h3 className="mt-4 font-bold">ITR helper</h3><p className="mt-1 text-sm leading-6 text-zinc-500">Organize tax filing checkpoints and record summaries.</p></article><article className="rounded-2xl border border-border p-5"><Grid2X2 className="h-5 w-5 text-accent" /><h3 className="mt-4 font-bold">More calculators</h3><p className="mt-1 text-sm leading-6 text-zinc-500">A placeholder for upcoming mobile-aligned planning tools.</p></article></div></section>
        <aside className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-200"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /><p>SIP and EMI results are estimates. Budget and subscription tools organize your own records; they do not connect to lenders, banks, fund houses, or merchants.</p></aside>
    </div>{showBudgetForm && <BudgetForm onClose={() => setShowBudgetForm(false)} onSaved={() => { setShowBudgetForm(false); void loadPlanning(); }} />}{showSubscriptionForm && <SubscriptionForm accounts={accounts} onClose={() => setShowSubscriptionForm(false)} onSaved={() => { setShowSubscriptionForm(false); void loadPlanning(); }} />}</DashboardLayout>;
}
