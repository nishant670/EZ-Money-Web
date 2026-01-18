"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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
        // Hydrate from localStorage
        const savedToken = localStorage.getItem("finnri_token");
        const savedUser = localStorage.getItem("finnri_user");

        if (savedToken && savedUser) {
            setToken(savedToken);
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error("Failed to parse user", e);
                localStorage.removeItem("finnri_user");
            }
        }
        setIsLoading(false);
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
        router.push("/login"); // Redirect to login
    };

    const loginAsGuest = async () => {
        try {
            // Mock device ID for web guest
            const deviceId = "web_guest_" + Math.random().toString(36).substring(7);
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
