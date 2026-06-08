import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PortfolioBuilder - Create Your Perfect Portfolio",
  description: "Build and deploy your professional portfolio with AI assistance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
      <body className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:bg-none dark:bg-zinc-950 text-slate-800 dark:text-zinc-50 min-h-screen flex flex-col transition-colors duration-300" suppressHydrationWarning>
        <ClerkProvider>
          <ThemeProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <ToastProvider />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
