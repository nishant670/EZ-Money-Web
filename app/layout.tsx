import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finnri | Financial insights and planning tools",
  description: "Understand your spending, review recurring patterns, and plan with FINNRI's explainable financial dashboard.",
};

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./components/ui/ThemeProvider";

const themeScript = `(function(){try{var t=localStorage.getItem('finnri_theme')||'system';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light'}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body className="antialiased font-sans">
        <ThemeProvider><AuthProvider>{children}</AuthProvider></ThemeProvider>
      </body>
    </html>
  );
}
