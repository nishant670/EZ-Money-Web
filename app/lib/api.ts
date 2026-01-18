import axios, { AxiosError } from "axios";

// --- Types based on Backend Models ---

export interface User {
    ID: number;
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
    user: User;
}

export interface Transaction {
    ID: number;
    user_id: number;
    title?: string;
    amount: number;
    type: "income" | "expense" | "transfer";
    category: string;
    mode: string;
    date: string; // YYYY-MM-DD
    time?: string;
    merchant?: string;
    status: "confirmed" | "pending"; // inferred from needs_confirmation logic in BE, or just string
    tags: string[];
    notes?: string;
    needs_confirmation?: any;
    created_at: string;
}

// --- API Client Setup ---

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Interceptor: Add Token
api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("finnri_token");
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Response Interceptor: Handle 401
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
                // Only redirect if we aren't already on login (avoids loops)
                // Also check if it's a guest auth failure vs normal -> usually logout
                // For now, let's just clear token
                // localStorage.removeItem("finnri_token");
                // window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

// --- API Definitions ---

export const AuthAPI = {
    loginGuest: async (deviceId?: string) => {
        return api.post<AuthResponse>("/v1/auth/guest", { device_id: deviceId });
    },
    identify: async (identifier: string) => {
        return api.post<{ exists: boolean; is_guest: boolean }>("/v1/auth/identify", { identifier });
    },
    sendOTP: async (identifier: string) => {
        return api.post("/v1/auth/otp/send", { identifier });
    },
    verifyOTP: async (identifier: string, otp: string) => {
        return api.post<{ claim_token: string }>("/v1/auth/otp/verify", { identifier, otp });
    },
    register: async (payload: { claim_token: string; pin: string; guest_uuid?: string; device_id?: string; biometrics_enabled: boolean }) => {
        return api.post<AuthResponse>("/v1/auth/register", payload);
    },
    login: async (payload: { identifier: string; pin: string; device_id?: string }) => {
        return api.post<AuthResponse>("/v1/auth/login", payload);
    },
};

export const EntriesAPI = {
    list: async (params?: any) => {
        return api.get<Transaction[]>("/v1/entries", { params });
    },
    create: async (data: Partial<Transaction>) => {
        return api.post<Transaction>("/v1/entries", data);
    },
    parse: async (formData: FormData) => {
        // For audio/text parsing
        return api.post("/v1/parse", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
    update: async (id: number, data: Partial<Transaction>) => {
        return api.put<Transaction>(`/v1/entries/${id}`, data);
    },
    delete: async (id: number) => {
        return api.delete(`/v1/entries/${id}`);
    },
};

export const UserAPI = {
    updateProfile: async (data: any) => {
        return api.put<{ user: User }>("/v1/user", data);
    }
}
