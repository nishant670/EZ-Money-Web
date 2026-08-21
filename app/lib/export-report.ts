import type { TransactionReportResponse } from "@/app/lib/api";
import { toLocalISO } from "@/app/lib/format";

type ReportCSVRow = [
    section: string,
    label: string,
    amount: number | "",
    percentage: number | "",
    transactionCount: number | "",
    expense: number | "",
    income: number | "",
    netCashflow: number | "",
];

function csvCell(value: string | number) {
    const text = String(value);
    return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function buildReportRollupCSV(report: TransactionReportResponse) {
    const rows: ReportCSVRow[] = [
        ["Summary", "Expense", report.summary.total_expense, "", report.summary.expense_count, "", "", ""],
        ["Summary", "Income", report.summary.total_income, "", report.summary.income_count, "", "", ""],
        ["Summary", "Net cash flow", report.summary.net_cashflow, "", report.summary.transaction_count, "", "", ""],
        ...report.by_category.map((item): ReportCSVRow => ["Category", item.label, item.amount, item.percentage, item.transaction_count, "", "", ""]),
        ...report.by_merchant.map((item): ReportCSVRow => ["Merchant", item.label, item.amount, item.percentage, item.transaction_count, "", "", ""]),
        ...report.by_account.map((item): ReportCSVRow => ["Account", item.account_name, item.amount, item.percentage, item.transaction_count, "", "", ""]),
        ...report.by_month.map((item): ReportCSVRow => ["Month", item.month, "", "", item.transaction_count, item.expense, item.income, item.net_cashflow]),
        ...report.by_type.map((item): ReportCSVRow => ["Type", item.type === "expense" ? "Expense" : "Income", item.amount, "", item.transaction_count, "", "", ""]),
    ];
    const header = ["Section", "Label", "Amount (INR)", "Percentage", "Transaction count", "Expense (INR)", "Income (INR)", "Net cash flow (INR)"];
    return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
}

export function downloadReportRollupsCSV(report: TransactionReportResponse) {
    const blob = new Blob(["\uFEFF", buildReportRollupCSV(report)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `finnri-report-rollups-${toLocalISO()}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}
