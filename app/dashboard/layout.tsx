import { Suspense } from "react";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";

export default function DashboardRouteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <Suspense fallback={<div className="grid min-h-screen place-items-center bg-zinc-50 text-sm font-semibold text-zinc-500">Opening your dashboard…</div>}>
            <DashboardLayout>{children}</DashboardLayout>
        </Suspense>
    );
}
