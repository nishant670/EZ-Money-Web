"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, AuthAPI } from "@/app/lib/api";
import { useRouter } from "next/navigation";

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    loginAsGuest: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    isLoading: true,
    login: () => { },
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

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem("finnri_token", newToken);
        localStorage.setItem("finnri_user", JSON.stringify(newUser));
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
        <AuthContext.Provider value={{ user, token, isLoading, login, logout, loginAsGuest }}>
            {children}
        </AuthContext.Provider>
    );
};
