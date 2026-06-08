"use client";

import { Plus, Trash2, Wand2, Image as ImageIcon, Download, Code, Copy, Check, X, Sparkles, Sun, HelpCircle } from "lucide-react";
import { CldUploadWidget } from 'next-cloudinary';
import { useState } from "react";
import { generateCode } from "@/lib/generateCode";
import { elaborateText, generateBioFromKeywords, generateProjectFromTitle } from "@/lib/demiAI";

export default function EditorForm({ portfolio, setPortfolio, onSave, isSaving }: any) {
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [generatingProjectIdx, setGeneratingProjectIdx] = useState<number | null>(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showHostingTips, setShowHostingTips] = useState(false);
  const [activeTab, setActiveTab] = useState<'html' | 'css'>('html');
  const [copied, setCopied] = useState(false);
  const [isPolishingBio, setIsPolishingBio] = useState(false);
  const [polishingProjectIdx, setPolishingProjectIdx] = useState<number | null>(null);

  const vibe = portfolio.vibe || 'professional';

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateAIContent = (type: 'bio' | 'project', prompt: string, index?: number) => {
    if (!prompt.trim()) return alert("Please enter some keywords or a title first to guide the AI.");
    
    if (type === 'bio') {
      setIsGeneratingBio(true);
      setTimeout(() => {
        const bioText = generateBioFromKeywords(prompt, vibe);
        handleChange('bio', bioText);
        setIsGeneratingBio(false);
      }, 300);
    } else {
      setGeneratingProjectIdx(index as number);
      setTimeout(() => {
        const projectText = generateProjectFromTitle(prompt, vibe);
        updateProject(index as number, 'description', projectText);
        setGeneratingProjectIdx(null);
      }, 300);
    }
  };

  const elaborateContent = (type: 'bio' | 'project', content: string, index?: number) => {
    if (!content || content.trim().length < 10) return alert("Please write a bit more first so AI has something to work with!");
    
    if (type === 'bio') {
      setIsPolishingBio(true);
      setTimeout(() => {
        const elaborated = elaborateText(content, vibe, type);
        handleChange('bio', elaborated);
        setIsPolishingBio(false);
      }, 300);
    } else {
      setPolishingProjectIdx(index as number);
      setTimeout(() => {
        const elaborated = elaborateText(content, vibe, type);
        updateProject(index as number, 'description', elaborated);
        setPolishingProjectIdx(null);
      }, 300);
    }
  };

  const handleChange = (field: string, value: any) => {
    setPortfolio({ ...portfolio, [field]: value });
  };

  const handleThemeChange = (field: string, value: any) => {
    setPortfolio({ ...portfolio, theme: { ...portfolio.theme, [field]: value } });
  };

  const handleSocialChange = (platform: string, value: string) => {
    setPortfolio({ ...portfolio, socialLinks: { ...portfolio.socialLinks, [platform]: value } });
  };

  const addProject = () => {
    setPortfolio({
      ...portfolio,
      projects: [...(portfolio.projects || []), { title: "", description: "", link: "", imageUrl: "" }],
    });
  };

  const updateProject = (index: number, field: string, value: string) => {
    const newProjects = [...portfolio.projects];
    newProjects[index][field] = value;
    setPortfolio({ ...portfolio, projects: newProjects });
  };

  const removeProject = (index: number) => {
    const newProjects = portfolio.projects.filter((_: any, i: number) => i !== index);
    setPortfolio({ ...portfolio, projects: newProjects });
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2">Profile Details</h3>
        
        <div>
          <label className="block text-sm font-medium mb-2">Profile Photo</label>
          <div className="flex items-center gap-4">
            {portfolio.profileImage ? (
              <img src={portfolio.profileImage} alt="Profile" className="w-16 h-16 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 shadow-md" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 shadow-inner">
                <ImageIcon size={24} />
              </div>
            )}
            <CldUploadWidget uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "portfolio_preset"} onSuccess={(result: any) => handleChange("profileImage", result.info.secure_url)}>
              {({ open }) => (
                <button type="button" onClick={() => open()} className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-md text-sm font-semibold transition-colors shadow-sm">
                  Upload Image
                </button>
              )}
            </CldUploadWidget>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input 
            type="text" 
            value={portfolio.name || ""} 
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-transparent" 
            placeholder="John Doe" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Username (Public URL Slug)</label>
          <input 
            type="text" 
            value={portfolio.username || ""} 
            onChange={(e) => handleChange("username", e.target.value)}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-transparent" 
            placeholder="johndoe" 
          />
        </div>
      </div>

      {/* Vibe Selector */}
        <div className={`p-5 rounded-2xl border-2 mb-8 transition-all ${
          portfolio.vibe === 'professional' ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800' :
          portfolio.vibe === 'hacker' ? 'bg-zinc-100 dark:bg-zinc-900 border-zinc-400 dark:border-zinc-700' :
          'bg-purple-50 dark:bg-purple-950/20 border-purple-300 dark:border-purple-800'
        }`}>
          <label className={`block text-xs font-black uppercase tracking-widest mb-4 ${
            portfolio.vibe === 'professional' ? 'text-blue-700 dark:text-blue-300' :
            portfolio.vibe === 'hacker' ? 'text-zinc-700 dark:text-zinc-300' :
            'text-purple-700 dark:text-purple-300'
          }`}>⚡ AI Personality Vibe (affects all AI writing)</label>
          <div className="space-y-2">
            {[
              { 
                id: 'professional', 
                label: '👔 PROFESSIONAL', 
                desc: 'Sophisticated, metrics-driven, authoritative. Perfect for corporate & executive positioning.',
                defaultColor: '#3b82f6',
                bgLight: 'bg-blue-50 dark:bg-blue-900/30',
                bgActive: 'bg-blue-100 dark:bg-blue-900/60',
                border: 'border-blue-300 dark:border-blue-600',
                ring: 'ring-blue-400/30'
              },
              { 
                id: 'hacker', 
                label: '💻 HACKER', 
                desc: 'Technical, minimalist, precise. Emphasizes architecture & deep expertise.',
                defaultColor: '#22c55e',
                bgLight: 'bg-zinc-100 dark:bg-zinc-800/50',
                bgActive: 'bg-zinc-200 dark:bg-zinc-700',
                border: 'border-zinc-400 dark:border-zinc-600',
                ring: 'ring-zinc-400/30'
              },
              { 
                id: 'creative', 
                label: '🎨 CREATIVE', 
                desc: 'Bold, narrative-driven, visionary. Tells the story of your craft.',
                defaultColor: '#ec4899',
                bgLight: 'bg-purple-50 dark:bg-purple-900/30',
                bgActive: 'bg-purple-100 dark:bg-purple-900/60',
                border: 'border-purple-300 dark:border-purple-600',
                ring: 'ring-purple-400/30'
              }
            ].map(v => (
              <button
                key={v.id}
                type="button"
                onClick={() => setPortfolio({ 
                  ...portfolio, 
                  vibe: v.id,
                  theme: { ...portfolio.theme, primaryColor: v.defaultColor }
                })}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  portfolio.vibe === v.id 
                    ? `${v.bgActive} ${v.border} ring-2 ${v.ring} shadow-lg`
                    : `${v.bgLight} ${v.border} hover:shadow-md`
                }`}
              >
                <div className="font-bold text-sm">{v.label}</div>
                <div className="text-xs opacity-70 leading-snug mt-1">{v.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-end mb-2">
            <label className="block text-sm font-bold">Professional Bio</label>
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={() => generateAIContent('bio', portfolio.bio || portfolio.name || 'Software Engineer')}
                disabled={isGeneratingBio}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all border ${
                  portfolio.vibe === 'professional' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 hover:bg-blue-200' :
                  portfolio.vibe === 'hacker' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200' :
                  'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700 hover:bg-purple-200'
                } disabled:opacity-50 shadow-sm`}
              >
                <Wand2 size={13} /> {isGeneratingBio ? "AI writing..." : "AI Auto-Write"}
              </button>
              {portfolio.bio && portfolio.bio.length > 10 && (
                <button 
                  type="button" 
                  onClick={() => elaborateContent('bio', portfolio.bio)}
                  disabled={isPolishingBio}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all border ${
                    portfolio.vibe === 'professional' ? 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700 hover:bg-cyan-200' :
                    portfolio.vibe === 'hacker' ? 'bg-lime-100 dark:bg-lime-900/40 text-lime-700 dark:text-lime-300 border-lime-300 dark:border-lime-700 hover:bg-lime-200' :
                    'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 border-pink-300 dark:border-pink-700 hover:bg-pink-200'
                  } disabled:opacity-50 shadow-sm`}
                >
                  <Sparkles size={13} /> {isPolishingBio ? "Elaborating..." : "Elaborate"}
                </button>
              )}
            </div>
          </div>
          <textarea 
            value={portfolio.bio || ""}
            onChange={(e) => handleChange("bio", e.target.value)}
            className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
            rows={4} 
            placeholder="I am a passionate developer focusing on... (Click 'AI Auto-Write' to generate, or 'Polish' to enhance existing content)"
          />
        </div>

      {/* Theme & Template Settings */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2">Layout & Theme</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Template Style</label>
          <div className="flex gap-4">
            <label className={`flex-1 p-3 border rounded-xl text-center cursor-pointer transition-all ${portfolio.template === 'minimal' ? 'bg-zinc-100 dark:bg-zinc-800' : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`} style={{ borderColor: portfolio.template === 'minimal' ? portfolio.theme?.primaryColor : ''}}>
              <input type="radio" className="hidden" checked={portfolio.template === 'minimal'} onChange={() => handleChange('template', 'minimal')} />
              <div className="font-bold text-sm">Minimal Flow</div>
            </label>
            <label className={`flex-1 p-3 border rounded-xl text-center cursor-pointer transition-all ${portfolio.template === 'sidebar' ? 'bg-zinc-100 dark:bg-zinc-800' : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`} style={{ borderColor: portfolio.template === 'sidebar' ? portfolio.theme?.primaryColor : ''}}>
              <input type="radio" className="hidden" checked={portfolio.template === 'sidebar'} onChange={() => handleChange('template', 'sidebar')} />
              <div className="font-bold text-sm">Sidebar Grid</div>
            </label>
          </div>
        </div>


        <div className="mt-2">
          <label className="block text-sm font-medium mb-2">Primary Accent Color</label>
          <p className="text-xs text-zinc-500 mb-2">Selecting a vibe sets the default color — you can override it here</p>
          <div className="flex gap-2 flex-wrap">
            {['#3b82f6', '#ef4444', '#10b981', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4', '#ffffff'].map(color => (
              <button 
                key={color}
                onClick={() => handleThemeChange('primaryColor', color)}
                className={`w-8 h-8 rounded-full border-2 transition-transform ${portfolio.theme?.primaryColor === color ? 'border-zinc-900 dark:border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
          <h3 className="text-xl font-semibold">Featured Projects</h3>
          <button onClick={addProject} className="text-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3 py-1.5 rounded-md flex items-center gap-1 font-bold hover:scale-105 transition-transform shadow-md">
            <Plus size={16} /> Add Project
          </button>
        </div>
        
        {portfolio.projects?.map((proj: any, idx: number) => (
          <div key={idx} className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-4 relative group bg-white dark:bg-zinc-950 shadow-sm hover:shadow-md transition-shadow">
            <button 
              onClick={() => removeProject(idx)}
              title="Delete this project"
              className="absolute top-3 right-3 p-2 bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/30 rounded-lg opacity-60 hover:opacity-100 transition-all shadow-sm group-hover:shadow-md"
            >
              <Trash2 size={18} />
            </button>
            <input 
              type="text" 
              placeholder="Project Title" 
              value={proj.title || ""}
              onChange={(e) => updateProject(idx, "title", e.target.value)}
              className="w-11/12 px-3 py-2 border-b border-zinc-300 dark:border-zinc-700 bg-transparent font-bold text-lg focus:outline-none focus:border-blue-500" 
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-1 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-2 flex flex-col items-center justify-center min-h-[100px] bg-zinc-50 dark:bg-zinc-900">
                {proj.imageUrl ? (
                  <img src={proj.imageUrl} alt="Thumbnail" className="w-full h-full object-cover rounded shadow-sm" style={{ maxHeight: '120px' }} />
                ) : (
                  <ImageIcon size={24} className="text-zinc-400 mb-2" />
                )}
                <div className="mt-2 text-center">
                  <CldUploadWidget uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "portfolio_preset"} onSuccess={(result: any) => updateProject(idx, "imageUrl", result.info.secure_url)}>
                    {({ open }) => (
                      <button type="button" onClick={() => open()} className="px-3 py-1 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded text-[11px] font-bold transition-colors">
                        {proj.imageUrl ? "Replace" : "Upload Image"}
                      </button>
                    )}
                  </CldUploadWidget>
                </div>
              </div>
              
              <div className="col-span-2 space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">Description</label>
                  <div className="flex gap-1.5">
                    <button 
                      type="button" 
                      onClick={() => generateAIContent('project', proj.title || 'My Project', idx)}
                      disabled={generatingProjectIdx === idx}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all border ${
                        portfolio.vibe === 'professional' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/50 hover:bg-blue-200' :
                        portfolio.vibe === 'hacker' ? 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/50 hover:bg-zinc-200' :
                        'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/50 hover:bg-purple-200'
                      } disabled:opacity-50`}
                    >
                      <Wand2 size={11} /> {generatingProjectIdx === idx ? "Gen..." : "AI Assist"}
                    </button>
                    {proj.description && proj.description.length > 10 && (
                      <button 
                        type="button" 
                        onClick={() => elaborateContent('project', proj.description, idx)}
                        disabled={polishingProjectIdx === idx}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all border ${
                          portfolio.vibe === 'professional' ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/50 hover:bg-cyan-200' :
                          portfolio.vibe === 'hacker' ? 'bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-300 border-lime-200 dark:border-lime-800/50 hover:bg-lime-200' :
                          'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800/50 hover:bg-pink-200'
                        } disabled:opacity-50`}
                      >
                        <Sparkles size={11} /> {polishingProjectIdx === idx ? "..." : "Elaborate"}
                      </button>
                    )}
                  </div>
                </div>
                <textarea 
                  placeholder="A web app that does... (Use AI Assist for initial draft, then Polish to enhance)" 
                  value={proj.description || ""}
                  onChange={(e) => updateProject(idx, "description", e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-sm min-h-[70px] shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  rows={2} 
                />
                <input 
                  type="url" 
                  placeholder="https://my-link.com (optional)" 
                  value={proj.link || ""}
                  onChange={(e) => updateProject(idx, "link", e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2">Social Profiles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['github', 'twitter', 'linkedin', 'website'].map(platform => (
            <div key={platform}>
              <label className="block text-sm font-medium mb-1 capitalize">{platform}</label>
              <input 
                type="url" 
                value={portfolio.socialLinks?.[platform] || ""} 
                onChange={(e) => handleSocialChange(platform, e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-transparent" 
                placeholder={`https://${platform}.com/`} 
              />
            </div>
          ))}
        </div>
      </div>


      {/* Publish & Tools Section - inline below Social Profiles */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6 space-y-3">
        <h3 className="text-xl font-semibold">Publish & Export</h3>

        {/* Tool icon buttons — always visible if any content exists */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowCodeModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl transition-all shadow-lg shadow-purple-500/30 hover:scale-105 text-sm font-semibold"
            title="View Source Code"
          >
            <Code size={16} /> View Code
          </button>
          <button
            onClick={async () => {
              try {
                console.log('Starting export with portfolio:', portfolio.username);
                const res = await fetch('/api/export', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(portfolio),
                });
                
                if (!res.ok) {
                  const errorData = await res.json().catch(() => ({}));
                  throw new Error(errorData.error || `HTTP ${res.status}: Export failed`);
                }
                
                const blob = await res.blob();
                if (blob.size === 0) throw new Error('Received empty file');
                
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${portfolio.username || 'portfolio'}-portfolio.zip`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                
                console.log('Export successful');
              } catch (err: any) {
                console.error('Export error:', err);
                alert('❌ Export failed: ' + err.message);
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl transition-all shadow-lg shadow-emerald-500/30 hover:scale-105 text-sm font-semibold"
            title="Download as ZIP"
          >
            <Download size={16} /> Download ZIP
          </button>
            <button
            onClick={() => setShowHostingTips(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-xl transition-all shadow-lg shadow-yellow-500/30 hover:scale-105 text-sm font-semibold"
            title="How to Export"
          >
            <Sun size={16} /> How to Export
          </button>
        </div>

        {/* Publish Site button - full width at the bottom */}
        <button 
          onClick={onSave}
          disabled={isSaving || !portfolio.username || !portfolio.name}
          className={`w-full font-bold py-4 rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 text-lg ${
            isSaving ? 'bg-gray-500 text-white' :
            !portfolio.username || !portfolio.name ? 'bg-gray-400 text-white cursor-not-allowed' :
            'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
          }`}
          title={!portfolio.username ? "Please enter a username" : !portfolio.name ? "Please enter your full name" : "Publish your portfolio"}
        >
          {isSaving ? "Publishing..." : "🚀 Publish Site"}
        </button>
      </div>

      {/* Code Viewer Modal */}
      {showCodeModal && (() => {
        const { html, css } = generateCode(portfolio);
        const activeCode = activeTab === 'html' ? html : css;
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900/50 dark:to-zinc-800/30">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter">Source Code</h2>
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-1">Generated HTML & CSS - Ready to deploy or customize</p>
                </div>
                <button 
                  onClick={() => setShowCodeModal(false)}
                  className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex gap-2 p-4 bg-zinc-100/50 dark:bg-zinc-900/30 border-b border-zinc-200 dark:border-zinc-800 items-center justify-between">
                    <div className="flex gap-2">
                      <button 
                          onClick={() => setActiveTab('html')}
                          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'html' ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg' : 'hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}
                      >
                          📄 index.html
                      </button>
                      <button 
                          onClick={() => setActiveTab('css')}
                          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'css' ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg' : 'hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}
                      >
                          🎨 style.css
                      </button>
                    </div>
                    <button 
                        onClick={() => handleCopy(activeCode)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-600/20"
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? "Copied!" : "Copy Code"}
                    </button>
                  </div>

                  <div className="flex-1 overflow-auto p-6 font-mono text-sm bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                      <pre className="whitespace-pre-wrap break-all leading-relaxed opacity-85 text-xs">
                          {activeCode}
                      </pre>
                  </div>
              </div>
              
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900/50 dark:to-zinc-800/30 flex justify-end gap-3">
                   <button 
                      onClick={() => setShowCodeModal(false)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl text-sm font-bold hover:bg-zinc-300 dark:hover:bg-zinc-700 transition"
                   >
                      Close
                   </button>
                   <button 
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/export', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(portfolio),
                          });
                          if (!res.ok) throw new Error('Export failed');
                          const blob = await res.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${portfolio.username || 'portfolio'}-portfolio.zip`;
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                          window.URL.revokeObjectURL(url);
                        } catch (err: any) {
                          alert('Export failed: ' + err.message);
                        }
                      }}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
                   >
                      <Download size={16} /> Download ZIP
                   </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Hosting Tips Modal */}
      {showHostingTips && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 sticky top-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl">
                    <Sun size={24} className="text-white" />
                  </div>
                    <div>
                      <h2 className="text-2xl font-black tracking-tighter">How to Export</h2>
                      <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-1">Step-by-step export guide</p>
                    </div>
                </div>
                <button onClick={() => setShowHostingTips(false)} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {[
                {
                  step: 1,
                  title: "Click Download ZIP",
                  desc: "Click the green Download button (📥) to export your portfolio as a ZIP archive.",
                  action: "The ZIP contains index.html, style.css, and all your assets"
                },
                {
                  step: 2,
                  title: "Extract the ZIP File",
                  desc: "After downloading, extract the ZIP file using any file extraction tool.",
                  action: "Right-click → Extract or use WinRAR / 7-Zip"
                },
                {
                  step: 3,
                  title: "Review Your Code",
                  desc: "Open index.html in any text editor (VS Code, Notepad, etc.) to view or customize the source code.",
                  action: "You can edit the HTML and CSS files anytime"
                },
                {
                  step: 4,
                  title: "Preview Locally",
                  desc: "Double-click index.html to open it in your browser and preview your portfolio offline.",
                  action: "No internet required - works completely offline"
                },
                {
                  step: 5,
                  title: "Deploy Anywhere",
                  desc: "Upload the extracted files to any static hosting service to publish your portfolio online.",
                  action: "Vercel, Netlify, GitHub Pages, or any web host"
                }
              ].map((item, idx) => (
                <div key={idx} className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold">
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                      {item.desc && <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">{item.desc}</p>}
                      {item.action && <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">💡 {item.action}</p>}
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                <p className="font-bold text-purple-900 dark:text-purple-100 mb-2">⚡ Pro Tips:</p>
                <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1 text-[13px]">
                  <li>✓ All services offer free tiers - no credit card needed</li>
                  <li>✓ Deployment is instant - usually live in seconds</li>
                  <li>✓ Your portfolio is now globally accessible 24/7</li>
                  <li>✓ Update your portfolio anytime by re-uploading files</li>
                </ul>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-end gap-3">
              <button 
                onClick={() => setShowHostingTips(false)}
                className="px-6 py-2.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl text-sm font-bold hover:bg-zinc-300 dark:hover:bg-zinc-700 transition"
              >
                Close
              </button>
              <a 
                href="https://vercel.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-yellow-600/30 transition-all hover:scale-105"
              >
                → Go to Vercel
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Custom Modal */}

    </div>
  );
}
