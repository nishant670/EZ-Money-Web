const PLAN_LABELS: Record<string, string> = {
    free: "Finnri Free",
    paid: "a paid Finnri plan",
};

export function planDisplayName(planCode: string): string {
    const normalized = planCode.trim().toLowerCase();
    if (!normalized) return "an upgraded Finnri plan";

    return PLAN_LABELS[normalized]
        ?? `Finnri ${normalized.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())}`;
}
