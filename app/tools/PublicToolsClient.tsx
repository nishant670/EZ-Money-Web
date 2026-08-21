"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Calculator,
  ChartLine,
  CheckCircle2,
  ChevronDown,
  IndianRupee,
  Menu,
  ShieldCheck,
  TrendingUp,
  X,
} from "lucide-react";
import { formatMoney } from "@/app/lib/format";
import { cn } from "@/app/lib/utils";
import {
  calculateEMI,
  calculateSIP,
  type EMICalculation,
  type SIPCalculation,
  type SIPInput,
  PROJECTION_DISCLAIMER,
  SIP_PRESETS,
  type SIPPresetID,
  validateEMIInput,
  validateSIPInput,
} from "@/app/lib/calculators";

type ActiveCalculator = "sip" | "emi";

export default function PublicToolsClient() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCalculator, setActiveCalculator] = useState<ActiveCalculator>("sip");
  const [activeSIPPresetID, setActiveSIPPresetID] = useState<SIPPresetID>("mutual_fund");
  const [sipInput, setSipInput] = useState<SIPInput>(SIP_PRESETS[0]);
  const [sipResult, setSipResult] = useState<SIPCalculation | null>(() => calculateSIP(SIP_PRESETS[0]));
  const [sipError, setSipError] = useState("");
  const [showSIPBreakdown, setShowSIPBreakdown] = useState(false);
  const [principal, setPrincipal] = useState(1000000);
  const [rate, setRate] = useState(9);
  const [months, setMonths] = useState(60);
  const [emiResult, setEmiResult] = useState<EMICalculation | null>(() => calculateEMI({ principalAmount: 1000000, annualInterestRatePercent: 9, tenureMonths: 60 }));
  const [emiError, setEmiError] = useState("");
  const [showEMISchedule, setShowEMISchedule] = useState(false);

  const applySIPPreset = (preset: SIPInput) => {
    setActiveSIPPresetID(preset.id);
    setSipInput(preset);
    setSipResult(calculateSIP(preset));
    setSipError("");
    setShowSIPBreakdown(false);
  };

  const updateSIPInput = (patch: Partial<SIPInput>) => {
    setSipInput((current) => ({ ...current, ...patch, id: "custom", label: "Custom" }));
    setActiveSIPPresetID("custom");
  };

  const submitSIP = (event: FormEvent) => {
    event.preventDefault();
    const errors = validateSIPInput(sipInput);
    if (errors.length) {
      setSipError(errors.join(" "));
      return;
    }
    setSipError("");
    setSipResult(calculateSIP(sipInput));
    setShowSIPBreakdown(false);
  };

  const submitEMI = (event: FormEvent) => {
    event.preventDefault();
    const roundedMonths = Math.round(months);
    const input = { principalAmount: principal, annualInterestRatePercent: rate, tenureMonths: roundedMonths };
    const errors = validateEMIInput(input);
    if (errors.length) {
      setEmiError(errors.join(" "));
      return;
    }
    setMonths(roundedMonths);
    setEmiError("");
    setEmiResult(calculateEMI(input));
    setShowEMISchedule(false);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="container mx-auto flex min-h-20 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3" aria-label="Finnri home">
            <span className="relative flex h-11 w-28 items-center justify-center overflow-hidden rounded-xl bg-zinc-950 shadow-lg shadow-zinc-950/15">
              <Image src="/finnri-logo.png" alt="Finnri" fill sizes="112px" className="scale-[2.35] object-contain" priority />
            </span>
          </Link>
          <div className="hidden items-center gap-8 lg:flex">
            <a href="#calculators" className="text-sm font-medium transition-colors hover:text-accent">Calculators</a>
            <a href="#how-to-use" className="text-sm font-medium transition-colors hover:text-accent">How to use</a>
            <a href="#faq" className="text-sm font-medium transition-colors hover:text-accent">FAQ</a>
            <Link href="/login" className="text-sm font-semibold text-accent transition-opacity hover:opacity-80">Web Dashboard</Link>
            <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-bold text-background">
              Get Finnri <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <button className="rounded-xl p-2 lg:hidden" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle navigation">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-border bg-white px-6 py-5 dark:bg-zinc-900 lg:hidden">
            <div className="flex flex-col gap-4 text-base font-semibold">
              <a href="#calculators" onClick={() => setMenuOpen(false)}>Calculators</a>
              <a href="#how-to-use" onClick={() => setMenuOpen(false)}>How to use</a>
              <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
              <Link href="/login" className="text-accent">Web Dashboard</Link>
            </div>
          </div>
        )}
      </nav>

      <section className="overflow-hidden border-b border-border bg-white dark:bg-zinc-950">
        <div className="container mx-auto grid min-h-[calc(100vh-5rem)] gap-10 px-6 py-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:py-14">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-accent-secondary px-4 py-1.5 text-sm font-bold text-accent">
              <Calculator className="h-4 w-4" />
              Free financial calculators
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight font-rounded sm:text-5xl lg:text-6xl">
              EMI calculator and SIP calculator
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-text-muted">
              Estimate loan repayments and SIP maturity value instantly. No login, no account, no dashboard required.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => setActiveCalculator("sip")} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-accent px-6 text-sm font-bold text-white shadow-lg shadow-accent/20">
                Use SIP calculator <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => setActiveCalculator("emi")} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-white px-6 text-sm font-bold shadow-sm dark:bg-zinc-900">
                Use EMI calculator
              </button>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {["Free for everyone", "Built for INR", "Works without login"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm font-medium text-text-muted">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <section id="calculators" className="rounded-panel border border-border bg-background p-4 shadow-2xl shadow-zinc-950/10 sm:p-5">
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white p-1 dark:bg-zinc-900">
              {[
                { id: "sip" as const, label: "SIP Calculator", icon: ChartLine },
                { id: "emi" as const, label: "EMI Calculator", icon: Calculator },
              ].map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActiveCalculator(tool.id)}
                  className={cn(
                    "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl text-sm font-bold transition",
                    activeCalculator === tool.id ? "bg-accent text-white shadow-sm" : "text-text-muted hover:bg-zinc-50 dark:hover:bg-zinc-800",
                  )}
                >
                  <tool.icon className="h-4 w-4" />
                  {tool.label}
                </button>
              ))}
            </div>

            {activeCalculator === "sip" ? (
              <div className="mt-5 grid gap-5 xl:grid-cols-[0.88fr_1.12fr]">
                <form onSubmit={submitSIP} className="space-y-4 rounded-surface border border-border bg-white p-5 dark:bg-zinc-900">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">SIP details</p>
                    <h2 className="mt-1 text-xl font-bold font-rounded">Investment projection</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SIP_PRESETS.map((preset) => (
                      <button key={preset.id} type="button" onClick={() => applySIPPreset(preset)} className={cn("rounded-full border px-3 py-2 text-xs font-bold", activeSIPPresetID === preset.id ? "border-accent bg-accent text-white" : "border-border bg-zinc-50 text-zinc-500 dark:bg-zinc-800")}>
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <NumberField label="Monthly investment" value={sipInput.monthlyInvestment} min={1} onChange={(value) => updateSIPInput({ monthlyInvestment: value })} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <NumberField label="Expected return % p.a." value={sipInput.expectedAnnualReturnPercent} min={0} max={100} step={0.01} onChange={(value) => updateSIPInput({ expectedAnnualReturnPercent: value })} />
                    <NumberField label="Tenure in years" value={sipInput.tenureYears} min={0.08} max={60} step={0.01} onChange={(value) => updateSIPInput({ tenureYears: value })} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <NumberField label="Annual step-up %" value={sipInput.annualStepUpPercent} min={0} max={100} step={0.01} onChange={(value) => updateSIPInput({ annualStepUpPercent: value })} />
                    <NumberField label="Current corpus" value={sipInput.currentCorpus} min={0} onChange={(value) => updateSIPInput({ currentCorpus: value })} />
                  </div>
                  {sipError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30">{sipError}</p>}
                  <button className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-bold text-white">
                    <TrendingUp className="h-4 w-4" /> Calculate SIP
                  </button>
                </form>
                <ResultPanel
                  title="Estimated maturity value"
                  primary={sipResult ? formatMoney(sipResult.maturityValue) : "Calculate to view"}
                  empty={!sipResult}
                  metrics={sipResult ? [
                    { label: "Invested amount", value: formatMoney(sipResult.investedAmount) },
                    { label: "Estimated returns", value: formatMoney(sipResult.estimatedReturns), accent: true },
                  ] : []}
                >
                  {sipResult && (
                    <>
                      <button onClick={() => setShowSIPBreakdown((show) => !show)} className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-zinc-500">
                        {showSIPBreakdown ? "Hide" : "View"} yearly breakdown <ChevronDown className={cn("h-4 w-4 transition", showSIPBreakdown && "rotate-180")} />
                      </button>
                      {showSIPBreakdown && (
                        <ScheduleTable
                          headers={["Year", "Invested", "Value"]}
                          rows={sipResult.breakdown.map((row) => [String(row.year), formatMoney(row.yearlyInvestment), formatMoney(row.yearEndValue)])}
                        />
                      )}
                    </>
                  )}
                </ResultPanel>
              </div>
            ) : (
              <div className="mt-5 grid gap-5 xl:grid-cols-[0.88fr_1.12fr]">
                <form onSubmit={submitEMI} className="space-y-4 rounded-surface border border-border bg-white p-5 dark:bg-zinc-900">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">EMI details</p>
                    <h2 className="mt-1 text-xl font-bold font-rounded">Loan repayment estimate</h2>
                  </div>
                  <NumberField label="Loan amount" value={principal} min={1} onChange={setPrincipal} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <NumberField label="Annual interest %" value={rate} min={0} max={100} step={0.01} onChange={setRate} />
                    <NumberField label="Tenure in months" value={months} min={1} max={360} step={1} onChange={setMonths} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[12, 36, 60, 120, 240].map((preset) => (
                      <button key={preset} type="button" onClick={() => setMonths(preset)} className={cn("rounded-full border px-3 py-2 text-xs font-bold", months === preset ? "border-accent bg-accent text-white" : "border-border bg-zinc-50 text-zinc-500 dark:bg-zinc-800")}>
                        {preset < 12 ? `${preset}M` : `${preset / 12}Y`}
                      </button>
                    ))}
                  </div>
                  {emiError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30">{emiError}</p>}
                  <button className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-bold text-white">
                    <IndianRupee className="h-4 w-4" /> Calculate EMI
                  </button>
                </form>
                <ResultPanel
                  title="Estimated monthly EMI"
                  primary={emiResult ? formatMoney(emiResult.monthlyEMI) : "Calculate to view"}
                  empty={!emiResult}
                  metrics={emiResult ? [
                    { label: "Total payment", value: formatMoney(emiResult.totalPayment) },
                    { label: "Total interest", value: formatMoney(emiResult.totalInterest), accent: true },
                  ] : []}
                >
                  {emiResult && (
                    <>
                      <button onClick={() => setShowEMISchedule((show) => !show)} className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-zinc-500">
                        {showEMISchedule ? "Hide" : "View"} amortization schedule <ChevronDown className={cn("h-4 w-4 transition", showEMISchedule && "rotate-180")} />
                      </button>
                      {showEMISchedule && (
                        <ScheduleTable
                          headers={["Month", "Principal", "Interest", "Balance"]}
                          rows={emiResult.schedule.map((row) => [String(row.month), formatMoney(row.principalAmount), formatMoney(row.interestAmount), formatMoney(row.closingBalance)])}
                        />
                      )}
                    </>
                  )}
                </ResultPanel>
              </div>
            )}
          </section>
        </div>
      </section>

      <section id="how-to-use" className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Simple planning</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight font-rounded">Use the calculators before opening an account</h2>
              <p className="mt-4 text-text-muted leading-7">These tools are free public utilities. Finnri accounts are only needed when you want to track expenses, budgets, subscriptions, and dashboard reports.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { icon: ChartLine, title: "SIP calculator", body: "Enter monthly investment, expected return, tenure, step-up, and current corpus." },
                { icon: Calculator, title: "EMI calculator", body: "Enter loan amount, annual interest rate, and tenure to estimate repayment." },
                { icon: ShieldCheck, title: "No login needed", body: "Calculations run in your browser and do not require a Finnri account." },
              ].map((item) => (
                <article key={item.title} className="rounded-2xl border border-border bg-white p-6 dark:bg-zinc-900">
                  <item.icon className="h-6 w-6 text-accent" />
                  <h3 className="mt-5 text-lg font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-text-muted">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="py-20">
        <div className="container mx-auto max-w-4xl px-6">
          <h2 className="text-3xl font-bold tracking-tight font-rounded">Calculator FAQ</h2>
          <div className="mt-8 grid gap-4">
            {[
              { q: "Is the EMI calculator free?", a: "Yes. The EMI calculator on this page is free and does not require login." },
              { q: "Is the SIP calculator free?", a: "Yes. You can estimate SIP maturity value, invested amount, returns, and yearly growth without an account." },
              { q: "Are the calculations financial advice?", a: PROJECTION_DISCLAIMER },
            ].map((faq) => (
              <details key={faq.q} className="rounded-2xl border border-border bg-white p-6 dark:bg-zinc-900">
                <summary className="cursor-pointer text-lg font-bold">{faq.q}</summary>
                <p className="mt-3 leading-7 text-text-muted">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="container mx-auto flex flex-col gap-5 px-6 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="relative flex h-10 w-24 items-center justify-center overflow-hidden rounded-xl bg-zinc-950 shadow-lg shadow-zinc-950/15">
            <Image src="/finnri-logo.png" alt="Finnri" fill sizes="96px" className="scale-[2.35] object-contain" />
          </Link>
          <div className="flex flex-wrap gap-5 text-sm font-medium text-text-muted">
            <Link href="/">Home</Link>
            <Link href="/login">Web Dashboard</Link>
            <a href="#calculators">Calculators</a>
          </div>
          <p className="text-xs text-text-muted">© 2026 Finnri Technologies.</p>
        </div>
      </footer>
    </main>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-bold text-zinc-500">{label}</span>
      <input
        type="number"
        required
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(value) ? value : ""}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full rounded-xl border border-border bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-accent dark:bg-zinc-800"
      />
    </label>
  );
}

function ResultPanel({
  title,
  primary,
  empty,
  metrics,
  children,
}: {
  title: string;
  primary: string;
  empty: boolean;
  metrics: Array<{ label: string; value: string; accent?: boolean }>;
  children: ReactNode;
}) {
  return (
    <div className="rounded-surface border border-border bg-white p-5 dark:bg-zinc-900 sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">{title}</p>
      <p className={cn("mt-3 text-4xl font-bold font-rounded sm:text-5xl", empty && "text-zinc-400")}>{primary}</p>
      {metrics.length > 0 && (
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800">
              <p className="text-xs text-zinc-400">{metric.label}</p>
              <p className={cn("mt-1 text-lg font-bold", metric.accent && "text-accent")}>{metric.value}</p>
            </div>
          ))}
        </div>
      )}
      {children}
    </div>
  );
}

function ScheduleTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="mt-4 max-h-64 overflow-auto rounded-xl border border-border">
      <table className="w-full min-w-[520px] text-left text-xs">
        <thead className="sticky top-0 bg-zinc-50 text-zinc-400 dark:bg-zinc-800">
          <tr>
            {headers.map((header) => <th key={header} className="p-3">{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join("-")} className="border-t border-border">
              {row.map((cell, index) => <td key={`${cell}-${index}`} className="p-3">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
