"use client";

import Link from 'next/link';
import { LayoutDashboard, LogIn, LogOut, PenTool, Moon, Sun } from 'lucide-react';
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { useTheme } from './ThemeProvider';

export default function Navbar() {
  const { isSignedIn } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-indigo-500/10 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/80 backdrop-blur-xl transition-all duration-300 shadow-sm shadow-indigo-500/5 dark:shadow-none">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <span className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">PortfolioBuilder</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          <Link href="/editor" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
            <PenTool size={18} />
            Editor
          </Link>


          {/* Auth Section */}
          {!isSignedIn ? (
            <SignInButton mode="modal">
              <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                <LogIn size={18} />
                Login
              </button>
            </SignInButton>
          ) : (
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 rounded-lg"
                }
              }}
            />
          )}
        </div>
      </div>
    </nav>
  );
}
