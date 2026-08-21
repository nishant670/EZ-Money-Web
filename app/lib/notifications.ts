export function notificationDestination(actionURL?: string): string | null {
    if (!actionURL) return null;

    const entryMatch = actionURL.match(/^\/entry\/(\d+)$/);
    if (entryMatch) return `/dashboard/transactions?entry_id=${entryMatch[1]}`;

    if (/^\/subscriptions\/?$/.test(actionURL) || /^\/subscription-occurrences\/\d+$/.test(actionURL)) {
        return "/dashboard/tools#subscriptions";
    }

    const monthlyReviewMatch = actionURL.match(/^\/monthly-review\/(\d{4})-(\d{2})$/);
    if (monthlyReviewMatch) {
        const year = Number(monthlyReviewMatch[1]);
        const month = Number(monthlyReviewMatch[2]);
        if (month >= 1 && month <= 12) {
            const startDate = `${monthlyReviewMatch[1]}-${monthlyReviewMatch[2]}-01`;
            const endDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
            const endDate = `${monthlyReviewMatch[1]}-${monthlyReviewMatch[2]}-${String(endDay).padStart(2, "0")}`;
            return `/dashboard/reports?range=custom&start_date=${startDate}&end_date=${endDate}`;
        }
    }

    if (/^\/accounts\/\d+$/.test(actionURL)) return "/dashboard/accounts";
    if (/^\/split\/groups\/\d+$/.test(actionURL) || /^\/invite\/split\/[A-Za-z0-9_-]+$/.test(actionURL)) {
        return "/dashboard/splits";
    }
    if (actionURL.startsWith("/dashboard")) return actionURL;

    return "/dashboard";
}
