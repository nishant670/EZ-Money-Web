"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/app/lib/utils";

const FOCUSABLE = "a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex='-1'])";

export default function Dialog({ open, onClose, labelledBy, children, className, panelClassName }: {
    open: boolean;
    onClose: () => void;
    labelledBy: string;
    children: React.ReactNode;
    className?: string;
    panelClassName?: string;
}) {
    const panelRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!open) return;
        triggerRef.current = document.activeElement as HTMLElement | null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const panel = panelRef.current;
        const focusables = () => Array.from(panel?.querySelectorAll<HTMLElement>(FOCUSABLE) || []).filter((element) => !element.hasAttribute("hidden"));
        window.requestAnimationFrame(() => (focusables()[0] || panel)?.focus());

        const onKeyDown = (event: KeyboardEvent) => {
            const dialogs = Array.from(document.querySelectorAll<HTMLElement>("[role='dialog']"));
            if (dialogs[dialogs.length - 1] !== panel) return;
            if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
            if (event.key !== "Tab") return;
            const items = focusables();
            if (!items.length) { event.preventDefault(); panel?.focus(); return; }
            const first = items[0];
            const last = items[items.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = previousOverflow;
            triggerRef.current?.focus?.();
        };
    }, [onClose, open]);

    if (!open || typeof document === "undefined") return null;
    return createPortal(
        <div className={cn("fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6", className)}>
            <button type="button" aria-label="Close dialog" tabIndex={-1} onClick={onClose} className="absolute inset-0 cursor-default bg-zinc-950/45 backdrop-blur-sm" />
            <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={labelledBy} tabIndex={-1} className={cn("relative w-full overflow-y-auto rounded-[2rem] border border-border bg-card shadow-2xl outline-none", panelClassName)}>
                {children}
            </div>
        </div>,
        document.body,
    );
}
