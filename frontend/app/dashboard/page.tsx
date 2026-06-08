"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { GitHubConnect } from "@/components/GitHubConnect";
import { DeployButton } from "@/components/DeployButton";
import { useEffect, useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Download, ExternalLink, Settings, Trash2, Rocket } from "lucide-react";

export default function DashboardPage() {
  const { user } = useUser();
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('portfolio');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchPortfolio() {
      if (!user) return;
      try {
        const res = await fetch(`/api/portfolio?user_id=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setPortfolio(data.portfolio);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPortfolio();
  }, [user]);

  const copyLink = () => {
    if (!portfolio?.username) return;
    const url = `${window.location.origin}/portfolio/${portfolio.username}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = async () => {
    if (!portfolio) return;
    setIsExporting(true);
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...portfolio,
          name: portfolio.name || portfolio.full_name,
          socialLinks: portfolio.socialLinks || portfolio.social_links,
          profileImage: portfolio.profileImage || portfolio.profile_image,
        }),
      });
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${portfolio.username}-portfolio.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Error exporting: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !portfolio?.username) return;
    
    const confirmed = window.confirm("Are you sure you want to delete this portfolio? This action cannot be undone.");
    if (!confirmed) return;
    
    try {
      const res = await fetch('/api/portfolio', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });
      
      if (!res.ok) throw new Error("Delete failed");
      setPortfolio(null);
      alert("Portfolio deleted successfully");
    } catch (err: any) {
      alert("Error deleting portfolio: " + err.message);
    }
  };

  // Helper function to generate HTML from portfolio
  const generatePortfolioHTML = (portfolio: any): string => {
    if (!portfolio) return "";
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${portfolio.fullName} - Portfolio</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="portfolio-container">
        <header>
            <h1>${portfolio.fullName}</h1>
            <p class="bio">${portfolio.bio}</p>
        </header>
        
        <section class="skills">
            <h2>Skills</h2>
            <div class="skills-list">
                ${portfolio.skills?.map((skill: string) => `<span class="skill-tag">${skill}</span>`).join("") || ""}
            </div>
        </section>
        
        <section class="projects">
            <h2>Projects</h2>
            <div class="projects-grid">
                ${portfolio.projects?.map((project: any) => `
                    <div class="project-card">
                        <h3>${project.title}</h3>
                        <p>${project.description}</p>
                        ${project.link ? `<a href="${project.link}" target="_blank">View Project</a>` : ""}
                    </div>
                `).join("") || ""}
            </div>
        </section>
        
        <footer>
            <h2>Connect</h2>
            <div class="social-links">
                ${portfolio.socialLinks?.github ? `<a href="${portfolio.socialLinks.github}" target="_blank">GitHub</a>` : ""}
                ${portfolio.socialLinks?.linkedin ? `<a href="${portfolio.socialLinks.linkedin}" target="_blank">LinkedIn</a>` : ""}
                ${portfolio.socialLinks?.twitter ? `<a href="${portfolio.socialLinks.twitter}" target="_blank">Twitter</a>` : ""}
            </div>
        </footer>
    </div>
    <script src="script.js"></script>
</body>
</html>`;
  };

  // Helper function to generate CSS from portfolio
  const generatePortfolioCSS = (portfolio: any): string => {
    const theme = portfolio.theme || {};
    const primaryColor = theme.primaryColor || "#3b82f6";
    const bgColor = theme.backgroundColor || "#ffffff";
    const font = theme.font || "Inter, sans-serif";
    
    return `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: ${font};
    background-color: ${bgColor};
    color: #333;
    line-height: 1.6;
}

.portfolio-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 60px 20px;
}

header {
    text-align: center;
    margin-bottom: 60px;
    padding-bottom: 40px;
    border-bottom: 2px solid ${primaryColor};
}

header h1 {
    font-size: 3em;
    color: ${primaryColor};
    margin-bottom: 15px;
}

header .bio {
    font-size: 1.2em;
    color: #666;
    max-width: 600px;
    margin: 0 auto;
}

section {
    margin-bottom: 60px;
}

section h2 {
    font-size: 2em;
    color: ${primaryColor};
    margin-bottom: 30px;
    border-left: 4px solid ${primaryColor};
    padding-left: 15px;
}

.skills-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.skill-tag {
    display: inline-block;
    padding: 8px 16px;
    background-color: ${primaryColor}20;
    color: ${primaryColor};
    border-radius: 20px;
    font-weight: 500;
    border: 1px solid ${primaryColor};
}

.projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
}

.project-card {
    padding: 25px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #fafafa;
    transition: transform 0.3s, box-shadow 0.3s;
}

.project-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.project-card h3 {
    color: ${primaryColor};
    margin-bottom: 10px;
}

.project-card a {
    display: inline-block;
    margin-top: 15px;
    color: ${primaryColor};
    text-decoration: none;
    font-weight: 600;
    border-bottom: 2px solid ${primaryColor};
    padding-bottom: 2px;
    transition: opacity 0.3s;
}

.project-card a:hover {
    opacity: 0.7;
}

footer {
    text-align: center;
    padding-top: 40px;
    border-top: 2px solid ${primaryColor};
}

.social-links {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;
}

.social-links a {
    display: inline-block;
    padding: 10px 20px;
    background-color: ${primaryColor};
    color: white;
    text-decoration: none;
    border-radius: 5px;
    transition: opacity 0.3s;
}

.social-links a:hover {
    opacity: 0.8;
}

@media (max-width: 768px) {
    header h1 {
        font-size: 2em;
    }
    
    section h2 {
        font-size: 1.5em;
    }
    
    .projects-grid {
        grid-template-columns: 1fr;
    }
}`;
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Nav */}
          <div className="w-full md:w-64 space-y-2">
            {[
              { id: 'portfolio', label: 'My Portfolio', icon: ExternalLink },
              { id: 'deploy', label: 'Deploy & Publish', icon: Rocket },
              { id: 'analytics', label: 'Analytics', icon: Settings },
              { id: 'settings', label: 'Account Settings', icon: UserButton },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400'}`}
              >
                <tab.icon size={18} /> {tab.label}
              </button>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {activeTab === 'portfolio' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-zinc-100 dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-4">
                     <img src={user?.imageUrl} className="w-12 h-12 rounded-full border-2 border-white dark:border-zinc-700 shadow-md" alt="Avatar" />
                     <div>
                       <h2 className="text-xl font-bold leading-tight">{user?.fullName || "User"}</h2>
                       <p className="text-sm text-zinc-500">{user?.primaryEmailAddress?.emailAddress}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href="/editor" className="px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-bold hover:scale-105 transition shadow-lg">
                      Open Editor Studio
                    </Link>
                  </div>
                </div>

                {loading ? (
                  <div className="animate-pulse bg-zinc-200 dark:bg-zinc-800/50 h-64 rounded-3xl"></div>
                ) : portfolio ? (
                  <div className="grid grid-cols-1 gap-6">
                    <div className="p-8 rounded-3xl border border-indigo-500/10 dark:border-zinc-800 bg-white/70 backdrop-blur-xl dark:bg-zinc-950 shadow-xl shadow-indigo-500/5 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-6">
                        <span className="px-3 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded-full border border-green-500/20">Publicly Active</span>
                      </div>
                      
                      <h3 className="text-3xl font-black tracking-tighter mb-2">{portfolio.name}</h3>
                      <div className="flex items-center gap-2 text-blue-500 font-mono text-sm mb-8">
                         <span>localhost:3000/portfolio/{portfolio.username}</span>
                         <button onClick={copyLink} className="p-1.5 hover:bg-blue-500/10 rounded-md transition-colors">
                           {copied ? "✅ Copied" : "📋 Copy"}
                         </button>
                      </div>
                      
                      <div className="flex flex-wrap gap-3">
                        <Link href={`/portfolio/${portfolio.username}`} target="_blank" className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-600/20">
                          <ExternalLink size={18} /> View Live
                        </Link>
                        <button onClick={handleExport} disabled={isExporting} className="px-6 py-3 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-800 transition flex items-center gap-2 disabled:opacity-50">
                          <Download size={18} /> {isExporting ? "Zipping..." : "Download Code"}
                        </button>
                        <button onClick={handleDelete} className="px-6 py-3 bg-red-500/10 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold hover:bg-red-500/20 dark:hover:bg-red-500/20 transition flex items-center gap-2 border border-red-500/20 dark:border-red-500/20">
                          <Trash2 size={18} /> Delete Portfolio
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center rounded-3xl border-2 border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
                    <h2 className="text-2xl font-bold mb-4">No portfolio found.</h2>
                    <p className="text-zinc-500 mb-8 max-w-sm mx-auto">Start by entering your details in the editor to publish your site instantly.</p>
                    <Link href="/editor" className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:scale-105 transition shadow-xl shadow-blue-600/20">
                      Create My Portfolio
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'deploy' && (
              <div className="space-y-6">
                <div className="p-8 rounded-3xl border border-indigo-500/10 dark:border-zinc-800 bg-white/70 backdrop-blur-xl dark:bg-zinc-950 shadow-xl shadow-indigo-500/5">
                  <h3 className="text-2xl font-bold mb-2">Deploy & Publish</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-6">Deploy your portfolio to GitHub Pages for free hosting with a custom GitHub Pages URL.</p>
                  
                  <div className="space-y-6">
                    {/* GitHub Connection */}
                    <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Rocket size={18} /> GitHub Pages Deployment
                      </h4>
                      <GitHubConnect />
                    </div>

                    {/* Deploy Button */}
                    <div>
                      <h4 className="font-semibold mb-4">Launch Your Site</h4>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                        Deploy your portfolio to GitHub Pages. Your site will be available at:
                        <br />
                        <code className="text-blue-600 font-mono mt-2 block">https://[your-github-username].github.io/[username]-portfolio-builder/</code>
                      </p>
                      {portfolio && (
                        <DeployButton
                          htmlContent={generatePortfolioHTML(portfolio)}
                          cssContent={generatePortfolioCSS(portfolio)}
                          disabled={!portfolio}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="p-12 text-center rounded-3xl border border-indigo-500/10 dark:border-zinc-800 bg-white/70 backdrop-blur-xl dark:bg-zinc-950 shadow-xl shadow-indigo-500/5">
                <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Settings size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-2">Detailed Analytics</h3>
                <p className="text-zinc-500 max-w-sm mx-auto mb-8">Visitor tracking, region heatmaps, and click analytics are being prepared for the next release.</p>
                <div className="inline-block px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-xs font-bold text-zinc-500">
                  DEVELOPMENT MODE
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
               <div className="p-8 rounded-3xl border border-indigo-500/10 dark:border-zinc-800 bg-white/70 backdrop-blur-xl dark:bg-zinc-950 shadow-xl shadow-indigo-500/5">
                 <h3 className="text-2xl font-bold mb-6">Account Settings</h3>
                 <div className="space-y-6">
                   <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                     <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Clerk User ID</label>
                     <code className="text-sm font-mono break-all opacity-70">{user?.id}</code>
                   </div>
                   <div className="flex gap-4">
                     <UserButton showName />
                   </div>
                 </div>
               </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
