"use client";

import { useState, useEffect } from "react";
import { Github, Check, X, Loader } from "lucide-react";
import toast from "react-hot-toast";

const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;

// Get the redirect URI based on the current domain
const getOAuthURL = () => {
  if (typeof window === "undefined") return "";
  const redirectUri = `${window.location.origin}/api/github/callback`;
  return `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,user`;
};

interface GitHubConnectionStatus {
  connected: boolean;
  username: string;
  deployedUrl: string;
}

export function GitHubConnect() {
  const [status, setStatus] = useState<GitHubConnectionStatus>({
    connected: false,
    username: "",
    deployedUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  // Fetch GitHub connection status and handle OAuth callback
  useEffect(() => {
    const initializeGitHub = async () => {
      // Check URL params first (OAuth callback)
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("github_token");
      const username = urlParams.get("github_username");
      const error = urlParams.get("github_error");

      if (error) {
        console.log("GitHub error:", error);
        toast.error(`GitHub Error: ${error}`);
        // Clear URL
        window.history.replaceState({}, document.title, window.location.pathname);
        setLoading(false);
        return;
      }

      if (token && username) {
        // OAuth callback - save the connection
        console.log("🎯 OAuth callback detected, saving connection...");
        await handleOAuthCallback(token, username);
        // Clear URL after processing
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      // No OAuth callback - fetch saved status from server
      await fetchStatus();
    };

    initializeGitHub();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      // First check localStorage for cached connection
      const cached = localStorage.getItem("github_connection");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.connected) {
            console.log("📄 Loaded GitHub connection from localStorage:", parsed.username);
            setStatus(parsed);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error("Failed to parse cached connection:", e);
        }
      }

      // Try to fetch from server (for future DB support)
      const response = await fetch("/api/github/connect");
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error("Failed to fetch GitHub status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthCallback = async (accessToken: string, githubUsername: string) => {
    try {
      setChecking(true);
      console.log("🔄 Saving GitHub connection...", { githubUsername });

      // Store token in backend
      const connectResponse = await fetch("/api/github/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: accessToken,
          githubUsername: githubUsername,
        }),
      });

      const data = await connectResponse.json();
      console.log("Server response:", data);

      if (connectResponse.ok && data.success) {
        // Save to localStorage immediately for persistence
        const connectionData = {
          connected: true,
          username: githubUsername,
          deployedUrl: "",
        };
        
        localStorage.setItem("github_connection", JSON.stringify(connectionData));
        console.log("✅ Saved to localStorage:", connectionData);
        
        toast.success("GitHub connected successfully! 🎉");
        setStatus(connectionData);
      } else {
        throw new Error(data.error || "Failed to save GitHub connection");
      }
    } catch (error: any) {
      console.error("❌ GitHub callback error:", error);
      toast.error(error.message || "Failed to connect GitHub");
      setStatus({
        connected: false,
        username: "",
        deployedUrl: "",
      });
    } finally {
      setChecking(false);
    }
  };

  const handleConnect = () => {
    if (GITHUB_CLIENT_ID) {
      window.location.href = getOAuthURL();
    } else {
      toast.error("GitHub OAuth not configured");
    }
  };

  const handleDisconnect = async () => {
    try {
      const response = await fetch("/api/github/connect", {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("GitHub disconnected");
        setStatus({
          connected: false,
          username: "",
          deployedUrl: "",
        });
      } else {
        throw new Error("Failed to disconnect");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to disconnect GitHub");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-600">
        <Loader className="w-4 h-4 animate-spin" />
        <span>Checking GitHub status...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <Github className="w-6 h-6 text-gray-800 dark:text-white" />
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              GitHub Connection
            </p>
            {status.connected ? (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <Check className="w-4 h-4" />
                Connected as @{status.username}
              </p>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Not connected yet
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {status.connected ? (
            <button
              onClick={handleDisconnect}
              disabled={checking}
              className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition disabled:opacity-50"
            >
              {checking ? <Loader className="w-4 h-4 animate-spin" /> : "Disconnect"}
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={checking}
              className="px-4 py-2 bg-gray-800 dark:bg-white text-white dark:text-gray-800 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-100 font-medium transition disabled:opacity-50 flex items-center gap-2"
            >
              {checking ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Github className="w-4 h-4" />
                  Connect GitHub
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {status.deployedUrl && (
        <div className="p-4 border border-green-200 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm font-semibold text-green-900 dark:text-green-200 mb-2">
            ✓ Portfolio Deployed
          </p>
          <a
            href={status.deployedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:underline text-sm break-all"
          >
            {status.deployedUrl}
          </a>
        </div>
      )}
    </div>
  );
}
