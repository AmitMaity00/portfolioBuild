"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import EditorForm from "@/components/EditorForm";
import LivePreview from "@/components/LivePreview";
import { useUser } from "@clerk/nextjs";

const initialState = {
  name: "",
  username: "",
  bio: "",
  skills: [],
  projects: [],
  socialLinks: { github: "", twitter: "", linkedin: "", website: "" },
  template: "minimal",
  vibe: "professional",
  theme: {
    primaryColor: "#3b82f6",
    mode: "dark",
  }
};

export default function EditorPage() {
  const { user } = useUser();
  const [portfolio, setPortfolio] = useState<any>(initialState);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const res = await fetch(`/api/portfolio?user_id=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.portfolio) {
            // Merge API data with initial state - load ONLY on first mount
            setPortfolio({
              name: data.portfolio.full_name || "",
              username: data.portfolio.username || "",
              bio: data.portfolio.bio || "",
              skills: data.portfolio.skills || [],
              projects: Array.isArray(data.portfolio.projects) ? data.portfolio.projects : [],
              socialLinks: data.portfolio.social_links || { github: "", twitter: "", linkedin: "", website: "" },
              template: data.portfolio.template || "minimal",
              vibe: data.portfolio.vibe || "professional",
              theme: data.portfolio.theme || { primaryColor: "#3b82f6", mode: "dark" },
              profileImage: data.portfolio.profile_image || ""
            });
          }
        }
      } catch (err) {
        console.error("Failed to load portfolio", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user?.id]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...portfolio, user_id: user.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShowSuccessModal(true);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const copyLink = () => {
    const url = `${window.location.origin}/portfolio/${portfolio.username}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ProtectedRoute>
      <>
        {isLoading ? (
          <div className="min-h-screen flex items-center justify-center font-bold text-zinc-500 animate-pulse">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-zinc-200 dark:border-zinc-800 border-t-blue-500 animate-spin"></div>
                <span>Preparing your editor...</span>
            </div>
          </div>
        ) : (
          <div className="flex h-[calc(100vh-4rem)]">
            {/* Sidebar Form */}
            <div className="w-1/3 border-r border-indigo-500/10 dark:border-zinc-800 p-6 overflow-y-auto bg-white/50 backdrop-blur-2xl dark:bg-zinc-950 relative">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-1">Edit Portfolio</h2>
                <p className="text-xs text-zinc-500 font-medium">Fill in your details & use AI to write your bio & project descriptions</p>
              </div>

              {/* AI Features Guide */}
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-lg p-3 mb-6 text-xs">
                <p className="font-bold text-blue-900 dark:text-blue-300 mb-2">✨ Smart AI Writing Features:</p>
                <ul className="space-y-1 text-blue-800 dark:text-blue-200 text-[11px] leading-snug">
                  <li>🤖 <strong>AI Auto-Write</strong>: Generates polished content from your keywords in seconds</li>
                  <li>✨ <strong>Elaborate</strong>: Enhances your existing text while keeping the meaning intact</li>
                  <li>🎨 <strong>Change Vibe</strong>: Switch personalities to regenerate with different tone (Professional/Hacker/Creative)</li>
                  <li>⚡ <strong>Instant & Local</strong>: No API calls needed - everything runs instantly in your browser!</li>
                </ul>
              </div>

              <EditorForm 
                portfolio={portfolio} 
                setPortfolio={setPortfolio} 
                onSave={handleSave} 
                isSaving={isSaving} 
              />
            </div>
            
            {/* Live Preview */}
            <div className="flex-1 bg-transparent dark:bg-zinc-900 overflow-y-auto relative p-8">
              <div className="max-w-5xl mx-auto transform origin-top scale-100 xl:scale-100 transition-transform">
                <LivePreview portfolio={portfolio} />
              </div>
            </div>
          </div>
        )}

          {/* Success Modal */}
          {showSuccessModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-white/95 backdrop-blur-2xl dark:bg-zinc-950 border border-indigo-500/20 dark:border-zinc-800 rounded-3xl p-8 max-w-lg w-full shadow-[0_0_40px_-10px_rgba(79,70,229,0.2)] animate-in zoom-in-95 duration-300">
                {/* Success icon with animated ring */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative w-20 h-20 mb-4">
                    <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping"></div>
                    <div className="relative w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter mb-1">Portfolio Published! 🎉</h2>
                  <p className="text-zinc-400 text-center text-sm">Your portfolio is live and accessible worldwide.</p>
                </div>

                {/* Clickable URL box */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-900/20 dark:to-violet-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 mb-6">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-blue-500 mb-2">🔗 LIVE PORTFOLIO URL</label>
                  <a 
                    href={`/portfolio/${portfolio.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 hover:text-blue-600 transition-colors"
                  >
                    <span className="text-sm font-bold truncate text-zinc-700 dark:text-zinc-300 group-hover:text-blue-500 transition-colors">
                      {typeof window !== 'undefined' ? window.location.origin : ''}/portfolio/{portfolio.username}
                    </span>
                    <svg className="w-4 h-4 flex-shrink-0 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setShowSuccessModal(false)} 
                    className="w-full py-4 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded-2xl font-bold hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"
                  >
                    Keep Editing
                  </button>
                  <a 
                    href={`/portfolio/${portfolio.username}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white rounded-2xl font-bold text-center transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                    Launch Site
                  </a>
                </div>
              </div>
            </div>
          )}
      </>
    </ProtectedRoute>
  );
}
