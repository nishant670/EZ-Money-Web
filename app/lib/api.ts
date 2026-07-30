import axios, { AxiosError } from "axios";

export interface User {
    id: number;
    uuid: string;
    username: string;
    email?: string;
    phone?: string;
    is_guest: boolean;
    has_pin: boolean;
    device_id?: string;
    biometrics_enabled: boolean;
    created_at?: string;
}

export interface AuthResponse {
    token: string;
    expires_at?: string;
    user: User;
}

export interface Account {
    id: number;
    user_id: number;
    type: "cash" | "upi" | "bank" | "credit_card" | "debit_card" | "wallet" | "other";
    name: string;
    color: string;
    provider: string;
    identifier: string;
    credit_limit: number;
    due_day: number;
    fee_month: string;
    balance: number;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}

export type AccountInput = Omit<Account, "id" | "user_id" | "created_at" | "updated_at">;

export interface Transaction {
    id: number;
    user_id: number;
    title: string;
    amount: number;
    currency: string;
    source: "manual" | "text" | "voice";
    type: "income" | "expense";
    category: string;
    mode: string;
    date: string;
    time?: string;
    merchant?: string;
    tags: string[];
    notes?: string;
    source_text?: string;
    account_id: number;
    account?: Account;
    created_at: string;
    updated_at?: string;
}

export interface EntryListResponse {
    entries: Transaction[];
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
}

export interface EntryListParams {
    page?: number;
    page_size?: number;
    type?: "expense" | "income";
    category?: string;
    account_id?: number;
    min_amount?: number;
    max_amount?: number;
    start_date?: string;
    end_date?: string;
    tag?: string;
    q?: string;
}

export interface TransactionInput {
    title: string;
    type: "income" | "expense";
    amount: number;
    currency: "INR";
    source: "manual" | "text" | "voice";
    mode: "Cash" | "UPI" | "Credit Card" | "Wallets";
    category: string;
    merchant?: string;
    tags?: string[];
    notes?: string;
    date: string;
    time?: string;
    source_text?: string;
    account_id: number;
}

export interface ParsedTransaction {
    title?: string;
    type?: "income" | "expense";
    amount?: number;
    currency?: string;
    source?: string;
    mode?: string;
    category?: string;
    merchant?: string;
    tags?: string[];
    note?: string;
    date?: string;
    time?: string;
    account_hint?: string;
    confidence?: Record<string, number>;
    needs_confirmation?: Record<string, boolean>;
    missing_fields?: string[];
    clarifications?: string[];
}

export interface DashboardSummary {
    total_spent: number;
    total_income: number;
    daily_average: number;
    transaction_count: number;
}

export interface DashboardCategory {
    category: string;
    amount: number;
    percentage: number;
    change: number;
}

export interface DashboardMerchant {
    merchant: string;
    amount: number;
    transaction_count: number;
}

export interface DashboardAccountSpend {
    account_id: number | null;
    account_name: string;
    amount: number;
    percentage: number;
}

export interface DashboardInsight {
    kind: string;
    severity: "info" | "warning";
    title: string;
    body: string;
}

export interface RecurringCandidate {
    label: string;
    merchant: string;
    category: string;
    average_amount: number;
    interval_guess: string;
    confidence: number;
    occurrences: number;
    last_seen_date: string;
    next_expected_date: string;
    review_due: boolean;
}

export interface DashboardResponse {
    period: { start: string; end: string };
    summary: DashboardSummary;
    top_categories: DashboardCategory[];
    top_merchants: DashboardMerchant[];
    account_spending: DashboardAccountSpend[];
    recent_transactions: Transaction[];
    insights: DashboardInsight[];
    recurring_candidates: RecurringCandidate[];
}

export interface Budget {
    id: number;
    user_id: number;
    name: string;
    period: "monthly";
    category: string;
    limit_amount: number;
    currency: "INR";
    alert_threshold_percent: number;
    active: boolean;
    created_at: string;
    updated_at: string;
}

export type BudgetInput = Omit<Budget, "id" | "user_id" | "created_at" | "updated_at">;

export interface Subscription {
    id: number;
    user_id: number;
    account_id?: number | null;
    account?: Account;
    name: string;
    merchant: string;
    category: string;
    amount: number;
    currency: "INR";
    billing_interval: "daily" | "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly";
    next_due_date: string;
    last_charged_date: string;
    status: "active" | "paused" | "cancelled";
    reminder_days: number;
    cancel_before_due: boolean;
    notes: string;
    days_until_due: number;
    due_state: "scheduled" | "due_soon" | "overdue" | "paused" | "cancelled" | "unknown";
    created_at: string;
    updated_at: string;
}

export type SubscriptionInput = Omit<
    Subscription,
    "id" | "user_id" | "account" | "days_until_due" | "due_state" | "created_at" | "updated_at"
>;

export interface EMICalculation {
    principal_amount: number;
    currency: "INR";
    annual_interest_rate_percent: number;
    tenure_months: number;
    monthly_emi: number;
    total_payment: number;
    total_interest: number;
    schedule: Array<{
        month: number;
        opening_balance: number;
        payment_amount: number;
        principal_amount: number;
        interest_amount: number;
        closing_balance: number;
    }>;
}

export interface AppNotification {
    id: number;
    user_id: number;
    type: string;
    title: string;
    body: string;
    action_url?: string;
    read_at?: string | null;
    created_at: string;
    updated_at: string;
}

export interface NotificationListResponse {
    notifications: AppNotification[];
    unread_count: number;
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("finnri_token");
        if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        const isAuthenticationRequest = error.config?.url?.startsWith("/v1/auth/");
        if (error.response?.status === 401 && !isAuthenticationRequest && typeof window !== "undefined") {
            localStorage.removeItem("finnri_token");
            localStorage.removeItem("finnri_user");
        }
        return Promise.reject(error);
    },
);

export function apiErrorMessage(error: unknown, fallback: string) {
    if (!axios.isAxiosError(error)) return fallback;
    if (!error.response) {
        return "Cannot reach the FINNRI API. Confirm the backend is running and allows this web address.";
    }
    const payload = error.response?.data as { message?: string; error?: string; fields?: Record<string, string> } | undefined;
    const fieldMessage = payload?.fields ? Object.values(payload.fields)[0] : undefined;
    return payload?.message || fieldMessage || payload?.error?.replaceAll("_", " ") || fallback;
}

export const AuthAPI = {
    loginGuest: (deviceId?: string) => api.post<AuthResponse>("/v1/auth/guest", { device_id: deviceId }),
    identify: (identifier: string) => api.post<{ exists: boolean; is_guest?: boolean }>("/v1/auth/identify", { identifier }),
    sendOTP: (identifier: string) => api.post<{ message: string; expires_at: string; dev_otp?: string }>("/v1/auth/otp/send", { identifier }),
    verifyOTP: (identifier: string, otp: string) => api.post<{ claim_token: string }>("/v1/auth/otp/verify", { identifier, otp }),
    register: (payload: { claim_token: string; pin: string; guest_uuid?: string; device_id?: string; biometrics_enabled: boolean }) =>
        api.post<AuthResponse>("/v1/auth/register", payload),
    login: (payload: { identifier: string; pin: string; device_id?: string }) => api.post<AuthResponse>("/v1/auth/login", payload),
    resetPIN: (payload: { claim_token: string; pin: string; device_id?: string; biometrics_enabled?: boolean }) =>
        api.post<AuthResponse>("/v1/auth/pin/reset", payload),
};

export const EntriesAPI = {
    list: (params?: EntryListParams) => api.get<EntryListResponse>("/v1/entries", { params }),
    create: (data: TransactionInput) => api.post<Transaction>("/v1/entries", data),
    parse: (formData: FormData) => api.post<ParsedTransaction>("/v1/parse", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    }),
    update: (id: number, data: TransactionInput) => api.put<Transaction>(`/v1/entries/${id}`, data),
    delete: (id: number) => api.delete(`/v1/entries/${id}`),
};

export const DashboardAPI = {
    get: (params?: { start_date?: string; end_date?: string; tz?: string }) =>
        api.get<DashboardResponse>("/v1/dashboard", { params }),
};

export const AccountsAPI = {
    list: () => api.get<Account[]>("/v1/accounts"),
    create: (data: AccountInput) => api.post<Account>("/v1/accounts", data),
    update: (id: number, data: AccountInput) => api.put<Account>(`/v1/accounts/${id}`, data),
    delete: (id: number) => api.delete(`/v1/accounts/${id}`),
};

export const BudgetsAPI = {
    list: () => api.get<Budget[]>("/v1/budgets"),
    create: (data: BudgetInput) => api.post<Budget>("/v1/budgets", data),
    update: (id: number, data: BudgetInput) => api.put<Budget>(`/v1/budgets/${id}`, data),
    delete: (id: number) => api.delete(`/v1/budgets/${id}`),
};

export const SubscriptionsAPI = {
    list: (status: "all" | Subscription["status"] = "all") => api.get<Subscription[]>("/v1/subscriptions", { params: { status } }),
    create: (data: SubscriptionInput) => api.post<Subscription>("/v1/subscriptions", data),
    update: (id: number, data: SubscriptionInput) => api.put<Subscription>(`/v1/subscriptions/${id}`, data),
    delete: (id: number) => api.delete(`/v1/subscriptions/${id}`),
    markPaid: (id: number, paidDate?: string) => api.post<Subscription>(`/v1/subscriptions/${id}/mark-paid`, { paid_date: paidDate }),
    createReminders: () => api.post<{ created: number }>("/v1/subscriptions/reminders"),
};

export const ToolsAPI = {
    calculateEMI: (data: { principal_amount: number; annual_interest_rate_percent: number; tenure_months: number; currency: "INR" }) =>
        api.post<EMICalculation>("/v1/tools/emi/calculate", data),
};

export const UserAPI = {
    updateProfile: (data: { username: string }) => api.put<{ user: User }>("/v1/user", data),
};

export const NotificationsAPI = {
    list: (status: "all" | "unread" | "read" = "all") => api.get<NotificationListResponse>("/v1/notifications", { params: { status } }),
    unreadCount: () => api.get<{ unread_count: number }>("/v1/notifications/unread-count"),
    markRead: (id: number) => api.patch<AppNotification>(`/v1/notifications/${id}/read`),
    markAllRead: () => api.patch<{ updated: number }>("/v1/notifications/read-all"),
    delete: (id: number) => api.delete(`/v1/notifications/${id}`),
};
