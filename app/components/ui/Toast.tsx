"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

type ToastInput = { title: string; description?: string; actionLabel?: string; onAction?: () => void | Promise<void> };
type ToastRecord = ToastInput & { id: number };
const ToastContext = createContext<{ toast: (input: ToastInput) => void }>({ toast: () => undefined });

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastRecord[]>([]);
    const dismiss = useCallback((id: number) => setToasts((current) => current.filter((item) => item.id !== id)), []);
    const toast = useCallback((input: ToastInput) => {
        const id = Date.now() + Math.random();
        setToasts((current) => [...current, { ...input, id }]);
        window.setTimeout(() => dismiss(id), input.actionLabel ? 8000 : 4500);
    }, [dismiss]);
    const value = useMemo(() => ({ toast }), [toast]);
    return <ToastContext.Provider value={value}>{children}<div className="pointer-events-none fixed inset-x-4 bottom-4 z-[200] flex flex-col items-end gap-3 sm:left-auto sm:w-96" aria-live="polite" aria-atomic="false">{toasts.map((item) => <div key={item.id} role="status" className="pointer-events-auto w-full rounded-2xl border border-border bg-card p-4 text-foreground shadow-2xl"><div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" /><div className="min-w-0 flex-1"><p className="text-sm font-bold">{item.title}</p>{item.description && <p className="mt-1 text-xs leading-5 text-text-muted">{item.description}</p>}{item.actionLabel && <button type="button" onClick={async () => { await item.onAction?.(); dismiss(item.id); }} className="mt-2 rounded-lg px-2 py-1 text-xs font-bold text-accent hover:bg-accent/10">{item.actionLabel}</button>}</div><button type="button" onClick={() => dismiss(item.id)} className="rounded-lg p-1 text-text-muted hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Dismiss notification"><X className="h-4 w-4" /></button></div></div>)}</div></ToastContext.Provider>;
}

export const useToast = () => useContext(ToastContext);
