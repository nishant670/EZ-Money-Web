import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finnri | Financial insights and planning tools",
  description: "Understand your spending, review recurring patterns, and plan with FINNRI's explainable financial dashboard.",
};

import { AuthProvider } from "./context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className="antialiased font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
