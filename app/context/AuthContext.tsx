"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AUTH_SESSION_EXPIRED_EVENT, User, AuthAPI } from "@/app/lib/api";
import { useRouter } from "next/navigation";

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    updateUser: (user: User) => void;
    logout: () => void;
    loginAsGuest: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    isLoading: true,
    login: () => { },
    updateUser: () => { },
    logout: () => { },
    loginAsGuest: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const savedUser = localStorage.getItem("finnri_user");
        let restoredUser: User | null = null;
        try {
            if (savedUser) restoredUser = JSON.parse(savedUser) as User;
        } catch {
            localStorage.removeItem("finnri_user");
        }
        const restoredToken = localStorage.getItem("finnri_token");
        const restoreTimer = window.setTimeout(() => {
            setUser(restoredUser);
            setToken(restoredToken);
            setIsLoading(false);
        }, 0);
        return () => window.clearTimeout(restoreTimer);
    }, []);

    useEffect(() => {
        const expireSession = () => {
            setToken(null);
            setUser(null);
            sessionStorage.setItem("finnri_auth_notice", "Your session expired. Sign in again to continue.");
            router.replace("/login");
        };
        window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, expireSession);
        return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, expireSession);
    }, [router]);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem("finnri_token", newToken);
        localStorage.setItem("finnri_user", JSON.stringify(newUser));
        sessionStorage.removeItem("finnri_auth_notice");
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem("finnri_user", JSON.stringify(updatedUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("finnri_token");
        localStorage.removeItem("finnri_user");
        router.push("/login");
    };

    const loginAsGuest = async () => {
        try {
            const storedDeviceId = localStorage.getItem("finnri_web_device_id");
            const deviceId = storedDeviceId || `web_${crypto.randomUUID()}`;
            localStorage.setItem("finnri_web_device_id", deviceId);
            const res = await AuthAPI.loginGuest(deviceId);

            const { token, user } = res.data;
            login(token, user);
            router.push("/dashboard");
        } catch (error) {
            console.error("Guest login failed", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, updateUser, logout, loginAsGuest }}>
            {children}
        </AuthContext.Provider>
    );
};
