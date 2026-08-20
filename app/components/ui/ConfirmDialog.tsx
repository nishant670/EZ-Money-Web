"use client";

import { Loader2, TriangleAlert, X } from "lucide-react";
import Dialog from "@/app/components/ui/Dialog";

export default function ConfirmDialog({ open, title, description, confirmLabel, onConfirm, onClose, busy = false, destructive = true }: {
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => void | Promise<void>;
    onClose: () => void;
    busy?: boolean;
    destructive?: boolean;
}) {
    return <Dialog open={open} onClose={onClose} labelledBy="confirm-dialog-title" panelClassName="max-w-md">
        <div className="p-6 sm:p-7"><div className="flex items-start justify-between gap-4"><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${destructive ? "bg-red-50 text-red-600 dark:bg-red-950/30" : "bg-accent/10 text-accent"}`}><TriangleAlert className="h-5 w-5" /></span><button type="button" onClick={onClose} aria-label="Close confirmation" className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"><X className="h-5 w-5" /></button></div><h2 id="confirm-dialog-title" className="mt-5 text-xl font-bold font-rounded">{title}</h2><p className="mt-2 text-sm leading-6 text-text-muted">{description}</p><div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} disabled={busy} className="min-h-11 rounded-xl px-5 text-sm font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">Cancel</button><button type="button" onClick={() => void onConfirm()} disabled={busy} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white disabled:opacity-60 ${destructive ? "bg-red-600" : "bg-accent"}`}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{confirmLabel}</button></div></div>
    </Dialog>;
}
