import { EntryListParams } from "@/app/lib/api";

/** Builds the reload-safe transaction URL owned by D6. */
export function transactionHref(params: EntryListParams) {
    const search = new URLSearchParams();
    if (params.q) search.set("q", params.q);
    if (params.type) search.set("type", params.type);
    if (params.account_id) search.set("account_id", String(params.account_id));
    if (params.category) search.set("category", params.category);
    if (params.tag) search.set("tag", params.tag);
    if (params.min_amount !== undefined) search.set("min_amount", String(params.min_amount));
    if (params.max_amount !== undefined) search.set("max_amount", String(params.max_amount));
    if (params.start_date || params.end_date) {
        search.set("range", "custom");
        if (params.start_date) search.set("start_date", params.start_date);
        if (params.end_date) search.set("end_date", params.end_date);
    } else {
        search.set("range", "all");
    }
    return `/dashboard/transactions?${search.toString()}`;
}
