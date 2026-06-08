"use client";

import { useState } from "react";
import { Upload, ExternalLink, Loader } from "lucide-react";
import toast from "react-hot-toast";

interface DeployButtonProps {
  htmlContent: string;
  cssContent?: string;
  jsContent?: string;
  onSuccess?: (deployedUrl: string) => void;
  disabled?: boolean;
}

export function DeployButton({
  htmlContent,
  cssContent,
  jsContent,
  onSuccess,
  disabled = false,
}: DeployButtonProps) {
  const [deploying, setDeploying] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);

  const handleDeploy = async () => {
    if (!htmlContent.trim()) {
      toast.error("No portfolio content to deploy");
      return;
    }

    try {
      setDeploying(true);

      const response = await fetch("/api/github/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          htmlContent,
          cssContent,
          jsContent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Deployment failed");
      }

      setDeployedUrl(data.deployedUrl);
      toast.success("Portfolio Published 🎉");
      onSuccess?.(data.deployedUrl);
    } catch (error: any) {
      toast.error(error.message || "Failed to deploy");
      console.error("Deploy error:", error);
    } finally {
      setDeploying(false);
    }
  };

  if (deployedUrl) {
    return (
      <div className="space-y-3">
        <div className="p-4 border border-green-200 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm font-semibold text-green-900 dark:text-green-200 mb-2">
            ✓ Portfolio Deployed Successfully
          </p>
          <a
            href={deployedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-green-600 hover:underline text-sm break-all"
          >
            {deployedUrl}
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
        <button
          onClick={() => setDeployedUrl(null)}
          className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          Deploy again
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleDeploy}
      disabled={disabled || deploying}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition disabled:cursor-not-allowed"
    >
      {deploying ? (
        <>
          <Loader className="w-4 h-4 animate-spin" />
          Deploying...
        </>
      ) : (
        <>
          <Upload className="w-4 h-4" />
          Launch Site
        </>
      )}
    </button>
  );
}
