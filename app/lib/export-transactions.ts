import { EntriesAPI, EntryListParams } from "@/app/lib/api";
import { toLocalISO } from "@/app/lib/format";

export async function downloadTransactionsCSV(params: EntryListParams) {
    const response = await EntriesAPI.exportCSV(params);
    const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `finnri-transactions-${toLocalISO()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}
